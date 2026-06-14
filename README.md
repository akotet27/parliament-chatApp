Parliament SecureChat

A secure, real-time chat application designed for parliamentary communication. The platform combines a modern React frontend with a FastAPI backend to support authenticated messaging, role-based access, and administrative oversight.

Overview
This application provides:
- secure authentication
- real-time chat
- role-based access control
- encrypted message handling
- admin monitoring tools

Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, WebSocket, Web Crypto API |
| Backend | FastAPI, SQLite, JWT, bcrypt, Uvicorn |

Project Structure

parliament-chat/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   └── hooks/
│   ├── package.json
│   └── vite.config.js
├── screenshots/
│   ├── login-screen.svg
│   ├── chat-screen.svg
│   └── admin-dashboard.svg
└── README.md

Screenshots

The following placeholder screenshots are available in the screenshots folder:
- Login screen: screenshots/login-screen.svg
- Chat interface: screenshots/chat-screen.svg
- Admin dashboard: screenshots/admin-dashboard.svg

Setup

Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Frontend
```bash
cd frontend
pnpm install
pnpm run dev
```

Default Admin Account
- Email: admin@parliament.gov.et
- Password: Admin@Parliament1

Usage Notes
- The frontend runs on http://localhost:5173
- The backend runs on http://localhost:8000
- Admin approval is required for new user accounts

Author
Akotet Shimelis
https://github.com/akotet27