# FlowPOS

A full-stack Point of Sale and service management platform for repair and home-service businesses. FlowPOS connects customers with certified technicians and handles the entire workflow — from booking to invoicing to payment.

---

## Features

- **Authentication** — Firebase-based login with Google OAuth support
- **Customer Management** — Create and manage customer profiles
- **Job & Booking Management** — Schedule and track service jobs
- **Invoicing & Payments** — Generate invoices and record payments
- **Product Management** — Manage inventory and service catalog
- **Reports** — Business analytics and reporting
- **AI Assistant** — Built-in chat support powered by Groq AI
- **Email Notifications** — Automated emails via Nodemailer
- **Multi-language Support** — i18n via react-i18next
- **Admin Panel** — User and settings management
- **PDF Generation** — Export invoices and reports as PDFs

---

## Tech Stack

### Frontend
| Tech | Purpose |
|---|---|
| React 19 | UI framework |
| React Router v6 | Client-side routing |
| TanStack Query | Server state management |
| Tailwind CSS | Styling |
| Recharts | Data visualization |
| Firebase | Authentication |
| Axios | HTTP client |
| i18next | Internationalization |
| SweetAlert2 | Alerts & modals |

### Backend
| Tech | Purpose |
|---|---|
| Node.js + Express 5 | REST API server |
| MongoDB + Mongoose | Database |
| Firebase Admin SDK | Auth verification |
| Groq SDK | AI chat (LLM) |
| Anthropic SDK | AI features |
| JWT | Authorization tokens |
| Nodemailer | Email delivery |
| PDFKit | PDF generation |
| Helmet + Rate Limiting | Security |

---

## Project Structure

```
flowpos/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── firebase.js
│   └── package.json
│
└── pos-server/      # Express backend
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── services/
    ├── utils/
    └── server.js
```

---

## Getting Started

### Prerequisites
- Node.js 20.x
- MongoDB instance (local or Atlas)
- Firebase project
- Groq API key

### 1. Clone the repositories

```bash
# Frontend
git clone https://github.com/alaska25/flowpos.git

# Backend
git clone https://github.com/alaska25/pos-server.git
```

### 2. Backend Setup

```bash
cd pos-server
npm install
```

Create a `.env` file in the root:

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=your_mongodb_connection_string

# Firebase Admin
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Auth
JWT_SECRET=your_jwt_secret

# Groq AI
GROQ_API_KEY=your_groq_api_key

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
SMTP_PASS=your_smtp_password

# CORS
CLIENT_URL=http://localhost:3000
```

Start the backend:

```bash
npm run dev       # development (nodemon)
npm start         # production
```

### 3. Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file in the root:

```env
REACT_APP_API_URL=http://localhost:5000

REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

Start the frontend:

```bash
npm start
```

App runs at `http://localhost:3000`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/...` | Authentication |
| GET/POST | `/api/customers` | Customer management |
| GET/POST | `/api/jobs` | Job management |
| GET/POST | `/api/invoices` | Invoice management |
| GET/POST | `/api/payments` | Payment management |
| GET/POST | `/api/bookings` | Booking management |
| GET/POST | `/api/products` | Product management |
| GET | `/api/reports` | Business reports |
| POST | `/api/chat` | AI chat support |
| GET/POST | `/api/settings` | App settings |
| GET/POST | `/api/users` | User management |
| GET/POST | `/api/admin` | Admin controls |

---

## Deployment

### Backend — Railway

1. Connect your `pos-server` GitHub repo to [Railway](https://railway.app)
2. Add all environment variables in the **Variables** tab
3. Generate a public domain under **Settings → Networking**

### Frontend — Vercel

1. Connect your frontend GitHub repo to [Vercel](https://vercel.com)
2. Add all `REACT_APP_*` environment variables
3. Set `REACT_APP_API_URL` to your Railway backend domain
4. Deploy

---

## Environment Variables Summary

| Variable | Where | Description |
|---|---|---|
| `REACT_APP_API_URL` | Frontend | Backend API base URL |
| `REACT_APP_FIREBASE_*` | Frontend | Firebase config |
| `MONGO_URI` | Backend | MongoDB connection string |
| `FIREBASE_PROJECT_ID` | Backend | Firebase Admin SDK |
| `FIREBASE_CLIENT_EMAIL` | Backend | Firebase Admin SDK |
| `FIREBASE_PRIVATE_KEY` | Backend | Firebase Admin SDK |
| `JWT_SECRET` | Backend | JWT signing secret |
| `GROQ_API_KEY` | Backend | Groq AI API key |
| `EMAIL_USER` | Backend | SMTP email address |
| `EMAIL_PASS` | Backend | SMTP email password |
| `CLIENT_URL` | Backend | Allowed CORS origin |

---

## License

MIT