# 🏛️ Parliament SecureChat

End-to-end encrypted chat for the **House of Peoples' Representatives of the FDRE**  


---

## What it does

Real-time secure messaging where the server **never reads your messages**. Each user holds half an encryption key (ECDH). The shared secret is derived mathematically — never transmitted. Built with React + FastAPI.

---

## Stack

| Side | Tech |
|---|---|
| Frontend | React, Vite, Tailwind, Web Crypto API, WebSocket |
| Backend | FastAPI, SQLite, bcrypt, JWT, Uvicorn |

---

## Setup

**Backend**
```bash
cd backend
pip install fastapi uvicorn cryptography python-multipart websockets bcrypt "python-jose[cryptography]"
python -m uvicorn main:app --reload
```

**Frontend**
```bash
cd frontend
pnpm install
pnpm run dev
```

**Default admin**
```
Email:    admin@parliament.gov.et
Password: Admin@Parliament1
```

---

## How encryption works

```
Akotet  →  private key (a) + public key (A) → uploads A to server
Shimelis → private key (b) + public key (B) → uploads B to server

Akotet sends to Shimelis:
  SharedKey = ECDH(a, B)   ← Akotet's half + Shimelis's half

Shimelis receives:
  SharedKey = ECDH(b, A)   ← same key, different halves

Server stores: "gAAAAABk7xPmQr..."  ← unreadable ciphertext only
```

Neither half alone can decrypt anything. The server is completely blind.

---

## Features

- 🔐 ECDH end-to-end encryption (P-256 + AES-GCM)
- ⏱️ Auto logout after 2 minutes of inactivity
- 👤 Admin approval required for all accounts
- 💬 Group channel + private DMs + My Notes (chat with yourself)
- ✏️ Edit and delete messages
- 🌙 Dark / light mode
- 📱 Responsive (mobile, tablet, desktop)
- 🛡️ Admin dashboard with activity log

---

## User roles

| Role | Access |
|---|---|
| `pending` | Registered, awaiting approval |
| `member` | Full chat access |
| `admin` | User management dashboard |
| `suspended` | Blocked |

---

## Validation rules

| Field | Rule |
|---|---|
| Username | 2–20 chars, letters/numbers/underscore |
| Email | Valid format with domain |
| Phone | 7–15 digits, international format |
| Password | Min 8 chars + uppercase + lowercase + number + special char |

---

## Screenshots

![Parliament chat preview](frontend/src/assets/hero.png)

![Parliament logo](frontend/public/parliament-logo.png)

---

## Author

**Akotet Shimelis** · [@akotet27](https://github.com/akotet27)