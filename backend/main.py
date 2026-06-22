from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import json
import sqlite3
import bcrypt
import uuid
import base64
from jose import JWTError, jwt

app = FastAPI(title="Parliament SecureChat")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── JWT CONFIG ───────────────────────────────────────────
SECRET_KEY  = "parliament-super-secret-key-change-in-production"
ALGORITHM   = "HS256"
TOKEN_EXPIRE_MINUTES = 120  # 2 hours (inactivity handled frontend)

security = HTTPBearer()

# ── DATABASE ─────────────────────────────────────────────
DB_FILE = "parliament.db"

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()

    # Users table
    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id          TEXT PRIMARY KEY,
            username    TEXT UNIQUE NOT NULL,
            email       TEXT UNIQUE NOT NULL,
            phone       TEXT NOT NULL,
            password    TEXT NOT NULL,
            role        TEXT DEFAULT 'pending',
            public_key  TEXT,
            last_seen   TEXT,
            created_at  TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Messages table — stores ONLY encrypted text
    c.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id           TEXT PRIMARY KEY,
            sender       TEXT NOT NULL,
            receiver     TEXT,
            room         TEXT DEFAULT 'general',
            is_dm        INTEGER DEFAULT 0,
            ciphertext   TEXT NOT NULL,
            timestamp    TEXT NOT NULL,
            created_at   TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Activity log
    c.execute("""
        CREATE TABLE IF NOT EXISTS activity_log (
            id         TEXT PRIMARY KEY,
            user_id    TEXT NOT NULL,
            action     TEXT NOT NULL,
            ip         TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Password reset tokens
    c.execute("""
        CREATE TABLE IF NOT EXISTS reset_tokens (
            token      TEXT PRIMARY KEY,
            user_id    TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Files table
    c.execute("""
        CREATE TABLE IF NOT EXISTS files (
            id          TEXT PRIMARY KEY,
            uploader_id TEXT NOT NULL,
            filename    TEXT NOT NULL,
            mimetype    TEXT,
            size        INTEGER,
            data        TEXT NOT NULL,
            created_at  TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Friend / connection requests
    c.execute("""
        CREATE TABLE IF NOT EXISTS friend_requests (
            id           TEXT PRIMARY KEY,
            from_user_id TEXT NOT NULL,
            to_user_id   TEXT NOT NULL,
            status       TEXT DEFAULT 'pending',
            created_at   TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(from_user_id, to_user_id)
        )
    """)

    # Custom groups
    c.execute("""
        CREATE TABLE IF NOT EXISTS groups (
            id         TEXT PRIMARY KEY,
            name       TEXT NOT NULL,
            created_by TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS group_members (
            group_id TEXT NOT NULL,
            user_id  TEXT NOT NULL,
            PRIMARY KEY (group_id, user_id)
        )
    """)

    # Migration: add message_type column if missing
    try:
        c.execute("ALTER TABLE messages ADD COLUMN message_type TEXT DEFAULT 'text'")
    except Exception:
        pass

    # Create default admin if not exists
    admin_exists = conn.execute(
        "SELECT id FROM users WHERE role='admin'"
    ).fetchone()

    if not admin_exists:
        admin_id = str(uuid.uuid4())
        hashed = bcrypt.hashpw(
            "Admin@Parliament1".encode(),
            bcrypt.gensalt()
        ).decode()
        conn.execute("""
            INSERT INTO users (id, username, email, phone, password, role)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            admin_id,
            "admin",
            "admin@parliament.gov.et",
            "+251900000000",
            hashed,
            "admin"
        ))
        print("✅ Default admin created")
        print("   Email:    admin@parliament.gov.et")
        print("   Password: Admin@Parliament1")

    conn.commit()
    conn.close()
    print("✅ Database initialized")

init_db()

# ── JWT HELPERS ──────────────────────────────────────────
def create_token(user_id: str, role: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": user_id, "role": role, "exp": expire},
        SECRET_KEY,
        algorithm=ALGORITHM
    )

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = verify_token(credentials.credentials)
    conn = get_db()
    user = conn.execute(
        "SELECT * FROM users WHERE id=?", (payload["sub"],)
    ).fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if user["role"] == "suspended":
        raise HTTPException(status_code=403, detail="Account suspended")
    return dict(user)

def require_admin(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

def log_activity(user_id: str, action: str):
    conn = get_db()
    conn.execute(
        "INSERT INTO activity_log (id, user_id, action) VALUES (?, ?, ?)",
        (str(uuid.uuid4()), user_id, action)
    )
    conn.commit()
    conn.close()

# ── PYDANTIC MODELS ──────────────────────────────────────
class RegisterModel(BaseModel):
    username: str
    email: str
    phone: str
    password: str

class LoginModel(BaseModel):
    email: str
    password: str

class PublicKeyModel(BaseModel):
    public_key: str

class MessageModel(BaseModel):
    ciphertext: str
    receiver: Optional[str] = None
    room: Optional[str] = "general"
    is_dm: Optional[bool] = False

class FriendRequestModel(BaseModel):
    to_username: str

class CreateGroupModel(BaseModel):
    name: str
    members: List[str]

# ── CONNECTION MANAGER ───────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active: Dict[str, WebSocket] = {}

    async def connect(self, user_id: str, ws: WebSocket):
        await ws.accept()
        self.active[user_id] = ws

    def disconnect(self, user_id: str):
        if user_id in self.active:
            del self.active[user_id]

    async def send_to(self, user_id: str, data: dict):
        if user_id in self.active:
            try:
                await self.active[user_id].send_text(json.dumps(data))
            except:
                self.disconnect(user_id)

    async def broadcast(self, data: dict, exclude: str = None):
        for uid, ws in list(self.active.items()):
            if uid != exclude:
                try:
                    await ws.send_text(json.dumps(data))
                except:
                    self.disconnect(uid)

    def get_online_users(self):
        return list(self.active.keys())

manager = ConnectionManager()
def get_online_usernames():
    """Convert user IDs to usernames for display"""
    conn = get_db()
    result = []
    for user_id in manager.get_online_users():
        row = conn.execute(
            "SELECT username FROM users WHERE id=?", (user_id,)
        ).fetchone()
        if row:
            result.append(row["username"])
    conn.close()
    return result

# ── AUTH ENDPOINTS ───────────────────────────────────────

@app.post("/api/register")
def register(data: RegisterModel):
    conn = get_db()

    # Check duplicates
    existing_email = conn.execute(
        "SELECT id FROM users WHERE email=?", (data.email,)
    ).fetchone()
    if existing_email:
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")

    existing_username = conn.execute(
        "SELECT id FROM users WHERE username=?", (data.username,)
    ).fetchone()
    if existing_username:
        conn.close()
        raise HTTPException(status_code=400, detail="Username already taken")

    # Hash password
    hashed = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()

    user_id = str(uuid.uuid4())
    conn.execute("""
        INSERT INTO users (id, username, email, phone, password, role)
        VALUES (?, ?, ?, ?, ?, 'pending')
    """, (user_id, data.username, data.email, data.phone, hashed))

    conn.commit()
    conn.close()

    log_activity(user_id, "registered")

    return {
        "message": "Account created successfully. Awaiting admin approval.",
        "user_id": user_id
    }

@app.post("/api/login")
def login(data: LoginModel):
    conn = get_db()
    user = conn.execute(
        "SELECT * FROM users WHERE email=?", (data.email,)
    ).fetchone()
    conn.close()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not bcrypt.checkpw(data.password.encode(), user["password"].encode()):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user["role"] == "pending":
        raise HTTPException(
            status_code=403,
            detail="Account pending admin approval. Please wait."
        )

    if user["role"] == "suspended":
        raise HTTPException(
            status_code=403,
            detail="Account suspended. Contact administrator."
        )

    token = create_token(user["id"], user["role"])
    log_activity(user["id"], "login")

    return {
        "token": token,
        "user": {
            "id":       user["id"],
            "username": user["username"],
            "email":    user["email"],
            "phone":    user["phone"],
            "role":     user["role"],
        }
    }

@app.post("/api/logout")
def logout(user=Depends(get_current_user)):
    log_activity(user["id"], "logout")
    return {"message": "Logged out successfully"}

@app.get("/api/me")
def get_me(user=Depends(get_current_user)):
    return {
        "id":       user["id"],
        "username": user["username"],
        "email":    user["email"],
        "phone":    user["phone"],
        "role":     user["role"],
    }

# ── KEY ENDPOINTS ────────────────────────────────────────

@app.post("/api/keys/upload")
def upload_public_key(data: PublicKeyModel, user=Depends(get_current_user)):
    conn = get_db()
    conn.execute(
        "UPDATE users SET public_key=? WHERE id=?",
        (data.public_key, user["id"])
    )
    conn.commit()
    conn.close()
    return {"message": "Public key uploaded successfully"}

@app.get("/api/keys/{username}")
def get_public_key(username: str, user=Depends(get_current_user)):
    conn = get_db()
    row = conn.execute(
        "SELECT public_key FROM users WHERE username=?", (username,)
    ).fetchone()
    conn.close()

    if not row or not row["public_key"]:
        raise HTTPException(status_code=404, detail="Public key not found")

    return {"username": username, "public_key": row["public_key"]}

# ── ADMIN ENDPOINTS ──────────────────────────────────────

@app.get("/api/admin/users")
def get_all_users(admin=Depends(require_admin)):
    conn = get_db()
    rows = conn.execute("""
        SELECT id, username, email, phone, role, last_seen, created_at
        FROM users ORDER BY created_at DESC
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.put("/api/admin/users/{user_id}/approve")
def approve_user(user_id: str, admin=Depends(require_admin)):
    conn = get_db()
    conn.execute(
        "UPDATE users SET role='member' WHERE id=?", (user_id,)
    )
    conn.commit()
    conn.close()
    log_activity(admin["id"], f"approved_user:{user_id}")
    return {"message": "User approved successfully"}

@app.put("/api/admin/users/{user_id}/suspend")
def suspend_user(user_id: str, admin=Depends(require_admin)):
    conn = get_db()
    conn.execute(
        "UPDATE users SET role='suspended' WHERE id=?", (user_id,)
    )
    conn.commit()
    conn.close()
    log_activity(admin["id"], f"suspended_user:{user_id}")
    return {"message": "User suspended"}

@app.get("/api/admin/logs")
def get_activity_logs(admin=Depends(require_admin)):
    conn = get_db()
    rows = conn.execute("""
        SELECT l.*, u.username
        FROM activity_log l
        LEFT JOIN users u ON l.user_id = u.id
        ORDER BY l.created_at DESC
        LIMIT 100
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.get("/api/admin/users/{user_id}/messages")
def get_user_message_count(user_id: str, admin=Depends(require_admin)):
    conn = get_db()
    count = conn.execute(
        "SELECT COUNT(*) as total FROM messages WHERE sender=?",
        (user_id,)
    ).fetchone()
    conn.close()
    # Admin sees only COUNT — not content (E2E encrypted anyway)
    return {"message_count": count["total"]}

# ── USERS ENDPOINT ───────────────────────────────────────

@app.get("/api/users")
def get_members(user=Depends(get_current_user)):
    conn = get_db()
    rows = conn.execute("""
        SELECT id, username, role, last_seen
        FROM users
        WHERE role IN ('member', 'admin')
        ORDER BY username
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]

# ── FILE ENDPOINTS ──────────────────────────────────────

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...), user=Depends(get_current_user)):
    content = await file.read()
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 50MB)")
    file_id = str(uuid.uuid4())
    data_b64 = base64.b64encode(content).decode()
    conn = get_db()
    conn.execute(
        "INSERT INTO files (id, uploader_id, filename, mimetype, size, data) VALUES (?, ?, ?, ?, ?, ?)",
        (file_id, user["id"], file.filename, file.content_type, len(content), data_b64)
    )
    conn.commit()
    conn.close()
    return {"file_id": file_id, "filename": file.filename, "mimetype": file.content_type, "size": len(content)}

@app.get("/api/files/{file_id}")
def get_file(file_id: str, user=Depends(get_current_user)):
    conn = get_db()
    row = conn.execute("SELECT * FROM files WHERE id=?", (file_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="File not found")
    return {"file_id": row["id"], "filename": row["filename"], "mimetype": row["mimetype"], "size": row["size"], "data": row["data"]}

# ── FRIEND / CONNECTION REQUEST ENDPOINTS ────────────────

@app.post("/api/friends/request")
async def send_friend_request(data: FriendRequestModel, user=Depends(get_current_user)):
    conn = get_db()
    to_user = conn.execute("SELECT id FROM users WHERE username=?", (data.to_username,)).fetchone()
    if not to_user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    if to_user["id"] == user["id"]:
        conn.close()
        raise HTTPException(status_code=400, detail="Cannot send request to yourself")
    existing = conn.execute(
        "SELECT id FROM friend_requests WHERE from_user_id=? AND to_user_id=? AND status='pending'",
        (user["id"], to_user["id"])
    ).fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="Request already sent")
    req_id = str(uuid.uuid4())
    try:
        conn.execute(
            "INSERT INTO friend_requests (id, from_user_id, to_user_id) VALUES (?, ?, ?)",
            (req_id, user["id"], to_user["id"])
        )
        conn.commit()
    except Exception:
        conn.close()
        raise HTTPException(status_code=400, detail="Request already exists")
    conn.close()
    await manager.send_to(to_user["id"], {
        "type": "friend_request",
        "request_id": req_id,
        "from_username": user["username"]
    })
    return {"message": "Connection request sent", "request_id": req_id}

@app.get("/api/friends/requests")
def get_friend_requests(user=Depends(get_current_user)):
    conn = get_db()
    rows = conn.execute("""
        SELECT fr.id, u.username as from_username, fr.created_at
        FROM friend_requests fr
        JOIN users u ON fr.from_user_id = u.id
        WHERE fr.to_user_id=? AND fr.status='pending'
        ORDER BY fr.created_at DESC
    """, (user["id"],)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.get("/api/friends/sent")
def get_sent_friend_requests(user=Depends(get_current_user)):
    conn = get_db()
    rows = conn.execute("""
        SELECT fr.id, u.username as to_username, fr.status, fr.created_at
        FROM friend_requests fr
        JOIN users u ON fr.to_user_id = u.id
        WHERE fr.from_user_id=? AND fr.status='pending'
        ORDER BY fr.created_at DESC
    """, (user["id"],)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.put("/api/friends/requests/{request_id}/accept")
async def accept_friend_request(request_id: str, user=Depends(get_current_user)):
    conn = get_db()
    req = conn.execute(
        "SELECT * FROM friend_requests WHERE id=? AND to_user_id=?",
        (request_id, user["id"])
    ).fetchone()
    if not req:
        conn.close()
        raise HTTPException(status_code=404, detail="Request not found")
    conn.execute("UPDATE friend_requests SET status='accepted' WHERE id=?", (request_id,))
    conn.commit()
    conn.close()
    await manager.send_to(req["from_user_id"], {
        "type": "friend_request_accepted",
        "by_username": user["username"]
    })
    return {"message": "Connection request accepted"}

@app.put("/api/friends/requests/{request_id}/reject")
async def reject_friend_request(request_id: str, user=Depends(get_current_user)):
    conn = get_db()
    req = conn.execute(
        "SELECT * FROM friend_requests WHERE id=? AND to_user_id=?",
        (request_id, user["id"])
    ).fetchone()
    if not req:
        conn.close()
        raise HTTPException(status_code=404, detail="Request not found")
    conn.execute("UPDATE friend_requests SET status='rejected' WHERE id=?", (request_id,))
    conn.commit()
    conn.close()
    return {"message": "Connection request rejected"}

@app.get("/api/friends/connections")
def get_connections(user=Depends(get_current_user)):
    conn = get_db()
    rows = conn.execute("""
        SELECT CASE
            WHEN fr.from_user_id = ? THEN u2.username
            ELSE u1.username
        END as username
        FROM friend_requests fr
        JOIN users u1 ON fr.from_user_id = u1.id
        JOIN users u2 ON fr.to_user_id = u2.id
        WHERE (fr.from_user_id = ? OR fr.to_user_id = ?)
        AND fr.status = 'accepted'
    """, (user["id"], user["id"], user["id"])).fetchall()
    conn.close()
    return [r["username"] for r in rows]

@app.post("/api/admin/users/{user_id}/reset-token")
def generate_reset_token(user_id: str, admin=Depends(require_admin)):
    """Generate a one-time password reset token. The user uses the link to set their own password."""
    conn = get_db()
    user = conn.execute("SELECT id, email FROM users WHERE id=?", (user_id,)).fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    token = str(uuid.uuid4())
    expires = (datetime.utcnow() + timedelta(hours=24)).isoformat()
    conn.execute(
        "INSERT OR REPLACE INTO reset_tokens (token, user_id, expires_at) VALUES (?,?,?)",
        (token, user_id, expires)
    )
    conn.commit()
    conn.close()
    log_activity(admin["id"], f"generated_reset_link:{user_id}")
    return {"token": token}

class SelfResetModel(BaseModel):
    token: str
    new_password: str

@app.post("/api/auth/reset-password")
def self_reset_password(data: SelfResetModel):
    """Allow a user to reset their own password using a valid token."""
    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    conn = get_db()
    row = conn.execute(
        "SELECT user_id, expires_at FROM reset_tokens WHERE token=?", (data.token,)
    ).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=400, detail="Invalid or already-used reset link")
    if datetime.utcnow().isoformat() > row["expires_at"]:
        conn.close()
        raise HTTPException(status_code=400, detail="Reset link has expired")
    hashed = bcrypt.hashpw(data.new_password.encode(), bcrypt.gensalt()).decode()
    conn.execute("UPDATE users SET password=? WHERE id=?", (hashed, row["user_id"]))
    conn.execute("DELETE FROM reset_tokens WHERE token=?", (data.token,))
    conn.commit()
    conn.close()
    return {"message": "Password updated successfully"}

# ── GROUP ENDPOINTS ──────────────────────────────────────

@app.post("/api/groups")
async def create_group(body: CreateGroupModel, user=Depends(get_current_user)):
    if not body.name.strip():
        raise HTTPException(status_code=400, detail="Group name required")
    conn = get_db()
    group_id = str(uuid.uuid4())
    member_ids = [user["id"]]
    for uname in body.members:
        if uname == user["username"]:
            continue
        m = conn.execute("SELECT id FROM users WHERE username=?", (uname,)).fetchone()
        if not m:
            conn.close()
            raise HTTPException(status_code=404, detail=f"User '{uname}' not found")
        member_ids.append(m["id"])
    conn.execute(
        "INSERT INTO groups (id, name, created_by) VALUES (?, ?, ?)",
        (group_id, body.name.strip(), user["id"])
    )
    for uid in member_ids:
        conn.execute(
            "INSERT INTO group_members (group_id, user_id) VALUES (?, ?)",
            (group_id, uid)
        )
    conn.commit()
    conn.close()
    return {"id": group_id, "name": body.name.strip(), "members": body.members}

@app.get("/api/groups")
def get_groups(user=Depends(get_current_user)):
    conn = get_db()
    rows = conn.execute("""
        SELECT g.id, g.name, g.created_by, g.created_at
        FROM groups g
        JOIN group_members gm ON g.id = gm.group_id
        WHERE gm.user_id = ?
        ORDER BY g.created_at DESC
    """, (user["id"],)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

# ── WEBSOCKET ────────────────────────────────────────────

@app.websocket("/ws/{token}")
async def websocket_endpoint(ws: WebSocket, token: str):
    # Verify token before accepting
    try:
        payload = verify_token(token)
        user_id = payload["sub"]
    except:
        await ws.close(code=4001)
        return

    # Get user info
    conn = get_db()
    user = conn.execute(
        "SELECT * FROM users WHERE id=?", (user_id,)
    ).fetchone()
    conn.close()

    if not user or user["role"] not in ("member", "admin"):
        await ws.close(code=4003)
        return

    username = user["username"]

    await manager.connect(user_id, ws)

    # Update last seen
    conn = get_db()
    conn.execute(
        "UPDATE users SET last_seen=? WHERE id=?",
        (datetime.utcnow().isoformat(), user_id)
    )
    conn.commit()
    conn.close()

    # Notify everyone
    # user_joined broadcast
    await manager.broadcast({
        "type": "user_joined",
        "username": username,
        "user_id": user_id,
        "online_users": get_online_usernames()  # ← changed
    })

    # user_left broadcast  
    await manager.broadcast({
        "type": "user_left",
        "username": username,
        "user_id": user_id,
        "online_users": get_online_usernames()  # ← changed
    })

    # Send message history (encrypted — server cannot read)
    conn = get_db()
    history = conn.execute("""
        SELECT m.*, u.username as sender_name
        FROM messages m
        JOIN users u ON m.sender = u.id
        WHERE m.is_dm = 0
        ORDER BY m.created_at DESC
        LIMIT 50
    """).fetchall()
    conn.close()

    await manager.send_to(user_id, {
        "type": "history",
        "messages": [dict(h) for h in reversed(history)]
    })

    # Send pending connection requests
    conn = get_db()
    pending_reqs = conn.execute("""
        SELECT fr.id, u.username as from_username, fr.created_at
        FROM friend_requests fr
        JOIN users u ON fr.from_user_id = u.id
        WHERE fr.to_user_id=? AND fr.status='pending'
        ORDER BY fr.created_at DESC
    """, (user_id,)).fetchall()
    conn.close()
    if pending_reqs:
        await manager.send_to(user_id, {
            "type": "pending_friend_requests",
            "requests": [dict(r) for r in pending_reqs]
        })

    try:
        while True:
            raw  = await ws.receive_text()
            data = json.loads(raw)
            msg_type = data.get("type")

            # ── GROUP MESSAGE ─────────────────────────
            if msg_type == "group_message":
                ciphertext = data.get("ciphertext", "")
                timestamp  = data.get("timestamp", "")
                room       = data.get("room", "general")
                msg_id     = str(uuid.uuid4())

                conn = get_db()
                if room == "general":
                    conn.execute("""
                        INSERT INTO messages
                        (id, sender, room, ciphertext, timestamp, is_dm)
                        VALUES (?, ?, 'general', ?, ?, 0)
                    """, (msg_id, user_id, ciphertext, timestamp))
                    conn.commit()
                    conn.close()
                    await manager.broadcast({
                        "type": "group_message", "id": msg_id, "room": "general",
                        "sender": username, "sender_id": user_id,
                        "ciphertext": ciphertext, "timestamp": timestamp,
                    })
                else:
                    is_member = conn.execute(
                        "SELECT 1 FROM group_members WHERE group_id=? AND user_id=?",
                        (room, user_id)
                    ).fetchone()
                    if is_member:
                        conn.execute("""
                            INSERT INTO messages
                            (id, sender, room, ciphertext, timestamp, is_dm)
                            VALUES (?, ?, ?, ?, ?, 0)
                        """, (msg_id, user_id, room, ciphertext, timestamp))
                        conn.commit()
                        members = conn.execute(
                            "SELECT user_id FROM group_members WHERE group_id=?", (room,)
                        ).fetchall()
                        conn.close()
                        payload = {
                            "type": "group_message", "id": msg_id, "room": room,
                            "sender": username, "sender_id": user_id,
                            "ciphertext": ciphertext, "timestamp": timestamp,
                        }
                        for m in members:
                            await manager.send_to(m["user_id"], payload)
                    else:
                        conn.close()

            # ── PRIVATE MESSAGE ───────────────────────
            elif msg_type == "private_message":
                receiver_username = data.get("to")
                ciphertext        = data.get("ciphertext", "")
                timestamp         = data.get("timestamp", "")

                # Find receiver id
                conn = get_db()
                receiver = conn.execute(
                    "SELECT id FROM users WHERE username=?",
                    (receiver_username,)
                ).fetchone()

                msg_id = str(uuid.uuid4())

                if receiver:
                    conn.execute("""
                        INSERT INTO messages
                        (id, sender, receiver, ciphertext, timestamp, is_dm)
                        VALUES (?, ?, ?, ?, ?, 1)
                    """, (msg_id, user_id, receiver["id"], ciphertext, timestamp))
                    conn.commit()
                conn.close()

                payload = {
                    "type":       "private_message",
                    "id":         msg_id,
                    "sender":     username,
                    "sender_id":  user_id,
                    "to":         receiver_username,
                    "ciphertext": ciphertext,
                    "timestamp":  timestamp,
                }

                if receiver:
                    await manager.send_to(receiver["id"], payload)
                await manager.send_to(user_id, payload)

            # ── TYPING ────────────────────────────────
            elif msg_type == "typing":
                to = data.get("to", "general")
                if to == "general":
                    await manager.broadcast({
                        "type":     "typing",
                        "from":     username,
                        "room":     "general"
                    }, exclude=user_id)
                else:
                    conn = get_db()
                    receiver = conn.execute(
                        "SELECT id FROM users WHERE username=?", (to,)
                    ).fetchone()
                    conn.close()
                    if receiver:
                        await manager.send_to(receiver["id"], {
                            "type": "typing",
                            "from": username,
                            "room": to
                        })

            # ── STOP TYPING ───────────────────────────
            elif msg_type == "stop_typing":
                to = data.get("to", "general")
                if to == "general":
                    await manager.broadcast({
                        "type": "stop_typing",
                        "from": username,
                        "room": "general"
                    }, exclude=user_id)
                else:
                    conn = get_db()
                    receiver = conn.execute(
                        "SELECT id FROM users WHERE username=?", (to,)
                    ).fetchone()
                    conn.close()
                    if receiver:
                        await manager.send_to(receiver["id"], {
                            "type": "stop_typing",
                            "from": username,
                            "room": to
                        })

            # ── FETCH GROUP HISTORY ───────────────────
            elif msg_type == "fetch_group_history":
                room = data.get("room")
                if room:
                    conn = get_db()
                    is_member = conn.execute(
                        "SELECT 1 FROM group_members WHERE group_id=? AND user_id=?",
                        (room, user_id)
                    ).fetchone()
                    if is_member:
                        history = conn.execute("""
                            SELECT m.*, u.username as sender_name
                            FROM messages m
                            JOIN users u ON m.sender = u.id
                            WHERE m.is_dm = 0 AND m.room = ?
                            ORDER BY m.created_at ASC
                            LIMIT 100
                        """, (room,)).fetchall()
                        await manager.send_to(user_id, {
                            "type": "group_history",
                            "room": room,
                            "messages": [dict(h) for h in history]
                        })
                    conn.close()

            # ── FETCH PRIVATE HISTORY ─────────────────
            elif msg_type == "fetch_private":
                with_username = data.get("with")
                conn = get_db()
                other = conn.execute(
                    "SELECT id FROM users WHERE username=?",
                    (with_username,)
                ).fetchone()

                if other:
                    history = conn.execute("""
                        SELECT m.*, u.username as sender_name
                        FROM messages m
                        JOIN users u ON m.sender = u.id
                        WHERE m.is_dm = 1
                        AND (
                            (m.sender=? AND m.receiver=?)
                            OR
                            (m.sender=? AND m.receiver=?)
                        )
                        ORDER BY m.created_at ASC
                        LIMIT 100
                    """, (user_id, other["id"], other["id"], user_id)).fetchall()

                    await manager.send_to(user_id, {
                        "type":     "private_history",
                        "with":     with_username,
                        "messages": [dict(h) for h in history]
                    })
                conn.close()

            # ── FILE MESSAGE ──────────────────────────
            elif msg_type == "file_message":
                file_id    = data.get("file_id", "")
                filename   = data.get("filename", "file")
                mimetype   = data.get("mimetype", "")
                to_user    = data.get("to")
                timestamp  = data.get("timestamp", "")
                msg_id     = str(uuid.uuid4())
                stored_ref = f"__FILE__{file_id}__{filename}__{mimetype}"

                if to_user:
                    conn = get_db()
                    receiver = conn.execute(
                        "SELECT id FROM users WHERE username=?", (to_user,)
                    ).fetchone()
                    if receiver:
                        conn.execute("""
                            INSERT INTO messages
                            (id, sender, receiver, ciphertext, timestamp, is_dm, message_type)
                            VALUES (?, ?, ?, ?, ?, 1, 'file')
                        """, (msg_id, user_id, receiver["id"], stored_ref, timestamp))
                        conn.commit()
                    conn.close()
                    payload = {"type": "file_message", "id": msg_id, "sender": username, "to": to_user, "file_id": file_id, "filename": filename, "mimetype": mimetype, "timestamp": timestamp}
                    if receiver:
                        await manager.send_to(receiver["id"], payload)
                    await manager.send_to(user_id, payload)
                else:
                    conn = get_db()
                    conn.execute("""
                        INSERT INTO messages
                        (id, sender, room, ciphertext, timestamp, is_dm, message_type)
                        VALUES (?, ?, 'general', ?, ?, 0, 'file')
                    """, (msg_id, user_id, stored_ref, timestamp))
                    conn.commit()
                    conn.close()
                    await manager.broadcast({
                        "type": "file_message", "id": msg_id, "sender": username,
                        "file_id": file_id, "filename": filename, "mimetype": mimetype, "timestamp": timestamp
                    })

            # ── DELETE MESSAGE ────────────────────────
            elif msg_type == "delete_message":
                msg_id = data.get("msg_id", "")
                conn = get_db()
                msg = conn.execute("SELECT * FROM messages WHERE id=?", (msg_id,)).fetchone()
                if msg and msg["sender"] == user_id:
                    conn.execute("DELETE FROM messages WHERE id=?", (msg_id,))
                    conn.commit()
                    payload = {"type": "message_deleted", "id": msg_id}
                    if msg["is_dm"]:
                        await manager.send_to(user_id, payload)
                        if msg["receiver"]:
                            await manager.send_to(msg["receiver"], payload)
                    else:
                        await manager.broadcast(payload)
                conn.close()

            # ── EDIT MESSAGE ──────────────────────────
            elif msg_type == "edit_message":
                msg_id    = data.get("msg_id", "")
                new_cipher = data.get("ciphertext", "")
                conn = get_db()
                msg = conn.execute("SELECT * FROM messages WHERE id=?", (msg_id,)).fetchone()
                if msg and msg["sender"] == user_id and new_cipher:
                    conn.execute("UPDATE messages SET ciphertext=? WHERE id=?", (new_cipher, msg_id))
                    conn.commit()
                    broadcast_data = {
                        "type":       "message_edited",
                        "id":         msg_id,
                        "ciphertext": new_cipher,
                        "is_dm":      bool(msg["is_dm"]),
                        "from":       username,
                    }
                    if msg["is_dm"] and msg["receiver"]:
                        rec_row = conn.execute(
                            "SELECT username FROM users WHERE id=?", (msg["receiver"],)
                        ).fetchone()
                        if rec_row:
                            broadcast_data["to"] = rec_row["username"]
                        await manager.send_to(user_id, broadcast_data)
                        await manager.send_to(msg["receiver"], broadcast_data)
                    else:
                        await manager.broadcast(broadcast_data)
                conn.close()

            # ── PING (keep alive) ─────────────────────
            elif msg_type == "ping":
                await manager.send_to(user_id, {"type": "pong"})

                # Update last seen
                conn = get_db()
                conn.execute(
                    "UPDATE users SET last_seen=? WHERE id=?",
                    (datetime.utcnow().isoformat(), user_id)
                )
                conn.commit()
                conn.close()

    except WebSocketDisconnect:
        manager.disconnect(user_id)
        await manager.broadcast({
            "type":         "user_left",
            "username":     username,
            "user_id":      user_id,
            "online_users": manager.get_online_users()
        })
        log_activity(user_id, "disconnect")