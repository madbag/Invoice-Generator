# 🧾 Invoice Generator
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React](https://img.shields.io/badge/react-19-blue)
![MongoDB](https://img.shields.io/badge/database-MongoDB-green)

A full-stack Invoice Generator web application built with the **MERN Stack** (MongoDB, Express, React, Node.js). The application lets users create invoices, manage clients, preview and download invoices as PDF, and send them directly to a client's email or share them via WhatsApp — with a dashboard for revenue and invoice-status analytics. A guest (no account) can also create and send a limited number of invoices without signing up.

This project demonstrates full-stack development including authentication, REST API design, database integration, and email functionality.

---

## 📸 Screenshots

> **

---

## Table of Contents

- [🧾 Invoice Generator](#-invoice-generator)
  - [📸 Screenshots](#-screenshots)
  - [Table of Contents](#table-of-contents)
  - [Project Overview](#project-overview)
  - [Features](#features)
    - [Authentication](#authentication)
    - [Invoice Management](#invoice-management)
    - [Client Management](#client-management)
    - [Dashboard \& Search](#dashboard--search)
    - [Sharing \& Email](#sharing--email)
    - [User Profile](#user-profile)
    - [UI](#ui)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
  - [Prerequisites](#prerequisites)
  - [Installation \& Setup](#installation--setup)
    - [1. Clone the repository](#1-clone-the-repository)
    - [2. Install backend dependencies](#2-install-backend-dependencies)
    - [3. Install frontend dependencies](#3-install-frontend-dependencies)
    - [4. Configure environment variables](#4-configure-environment-variables)
    - [5. Run the backend server](#5-run-the-backend-server)
    - [6. Run the frontend application](#6-run-the-frontend-application)
  - [Environment Variables](#environment-variables)
  - [API Endpoints](#api-endpoints)
    - [Authentication](#authentication-1)
    - [Invoices](#invoices)
    - [Clients](#clients)
    - [Search](#search)
  - [Key Concepts Demonstrated](#key-concepts-demonstrated)
  - [Troubleshooting](#troubleshooting)
  - [Future Improvements](#future-improvements)
  - [Contributing](#contributing)
  - [Author](#author)

---

## Project Overview

This application allows authenticated and non-authenticated users to create professional invoices, preview them, and send them as PDF files directly to clients.

The goal of this project was to build a real-world business tool while demonstrating backend architecture, API development, authentication, and frontend state management.

---

## Features

### Authentication
- User registration and secure login using JWT authentication
- Forgot-password / reset-password flow via emailed reset link
- Protected routes using middleware
- Guest mode: create and send up to 5 invoices without an account before being prompted to sign up

### Invoice Management
- Create invoices with multiple line items, with real-time subtotal/grand-total calculation
- A new invoice always starts blank — no leftover data from a previous invoice
- Auto-generated, sequential invoice numbers per account
- Pick an existing client to auto-fill their details, or enter them manually
- Track invoice status (Pending / Paid / Overdue) from the invoice list
- Preview an invoice before sending, download it as a PDF, or delete it
- Invoices are saved to MongoDB, scoped to the signed-in user

### Client Management
- Save, edit, and delete clients tied to your account
- Reuse a saved client's details when creating a new invoice

### Dashboard & Search
- Revenue and invoice-status stats (total / paid / pending / overdue)
- Client revenue breakdown chart and a list of recent invoices
- Search across invoices and clients

### Sharing & Email
- Generate an invoice as a PDF (via `@react-pdf/renderer`) and download it
- Send an invoice directly to the client's email via Resend
- Share the invoice PDF over WhatsApp (native share sheet on supported devices, with a `wa.me` chat fallback)

### User Profile
- Manage business details (name, contact, social links) and profile picture
- Choose a display currency (USD / EUR / INR) used across invoices and the dashboard
- Light/dark theme toggle

### UI
- Dynamic invoice form with real-time total calculation
- Responsive invoice preview and PDF layout
- Clean, responsive Tailwind CSS interface

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, React Router, Tailwind CSS 4, Context API, Axios, Vite |
| **Backend** | Node.js, Express 5, JWT Authentication, bcryptjs, Zod, Resend, `@react-pdf/renderer` |
| **Database** | MongoDB, Mongoose ODM |
| **Testing** | Vitest + React Testing Library (frontend), Jest + Supertest + mongodb-memory-server (backend) |
| **Tools** | Git, GitHub, npm |

---

## Project Structure

```
invoice-generator/
│
├── frontend/
│   └── src/
│       ├── api/         # Axios client
│       ├── components/  # Auth, Clients, Dashboard, Invoices, Layout, Profile, Search
│       ├── pages/       # Route-level pages (Landing, Login, Signup, Dashboard)
│       ├── context/     # Auth, Client, Invoice, Theme contexts
│       ├── utils/       # currency, PDF download, WhatsApp share, initials
│       └── tests/       # Vitest component/unit tests
│
├── backend/
│   ├── controllers/
│   ├── models/       # User, Client, Invoice (Mongoose)
│   ├── routes/       # auth, invoices, clients, search
│   ├── middleware/   # JWT auth guard, error handler
│   ├── utils/         # PDF generation, email sending, initials
│   └── tests/         # Jest integration + unit tests
│
└── README.md
```

---

## Prerequisites

Make sure you have the following installed before running the project:

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9 or higher
- free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- A [Resend](https://resend.com/) account and API key (used to send invoice and password-reset emails)

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/invoice-generator.git
cd invoice-generator
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure environment variables

Create `backend/.env` (see [Environment Variables](#environment-variables) for the required values). Optionally create `frontend/.env` if your backend isn't running on the default `http://localhost:5000/api`.

### 5. Run the backend server

From the `backend/` directory:

```bash
cd ../backend
npm run dev
```

### 6. Run the frontend application

Open a **new terminal**, then from the `frontend/` directory:

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173` and the backend on `http://localhost:5000`.


---

## Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RESEND_API_KEY=your_resend_api_key
FRONTEND_URL=your_deployed_link
```

Optionally, create a `.env` file inside the `frontend/` folder if the backend isn't on the default URL:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## API Endpoints

All protected routes require a valid JWT token passed in the `Authorization` header:

```
Authorization: Bearer <token>
```

### Authentication

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| `POST` | `/api/auth/register` | ❌ | Register a new user |
| `POST` | `/api/auth/login` | ❌ | Log in and receive a JWT |
| `POST` | `/api/auth/forgot-password` | ❌ | Request a password-reset email |
| `POST` | `/api/auth/reset-password` | ❌ | Reset password using a reset token |
| `GET` | `/api/auth/profile` | ✅ | Get the current user's profile |
| `PUT` | `/api/auth/profile` | ✅ | Update the current user's profile (business details, currency, profile picture) |
| `DELETE` | `/api/auth/profile` | ✅ | Delete the current user's account |

### Invoices

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| `GET` | `/api/invoices` | ✅ | Get all invoices for the authenticated user |
| `POST` | `/api/invoices` | ✅ | Create a new invoice |
| `GET` | `/api/invoices/:id` | ✅ | Get a single invoice by ID |
| `PUT` | `/api/invoices/:id` | ✅ | Update an invoice (e.g. status: pending / paid / overdue) |
| `DELETE` | `/api/invoices/:id` | ✅ | Delete an invoice |
| `POST` | `/api/invoices/:id/send` | ✅ | Generate PDF and send invoice to client email |
| `POST` | `/api/invoices/pdf` | ❌ | Generate a PDF from draft invoice data (used for preview/download) |
| `POST` | `/api/invoices/guest-send` | ❌ | Send a one-off invoice by email without an account (rate-limited, nothing is saved) |

### Clients

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| `GET` | `/api/clients` | ✅ | Get all clients for the authenticated user |
| `POST` | `/api/clients` | ✅ | Create a new client |
| `PUT` | `/api/clients/:id` | ✅ | Update a client |
| `DELETE` | `/api/clients/:id` | ✅ | Delete a client |

### Search

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| `GET` | `/api/search?q=...` | ✅ | Search across the authenticated user's invoices and clients |

---

## Key Concepts Demonstrated

- Full-stack MERN architecture
- REST API development
- JWT authentication and middleware-protected routes
- MongoDB schema design with Mongoose
- Email service integration with Resend, including a password-reset flow
- Server-side PDF generation with `@react-pdf/renderer`
- React state management with Context API (auth, clients, invoices, theme)
- Component-based frontend architecture
- TypeScript for type-safe frontend and backend development
- Guest checkout flow with usage limits, separate from the authenticated data model
- Integration and unit testing with Jest (backend) and Vitest (frontend)

---

## Troubleshooting

**JWT errors / Unauthorized responses**
- Make sure `JWT_SECRET` in your `.env` matches what was used to sign existing tokens. Changing it invalidates all active sessions.

**Emails not sending**
- Make sure `RESEND_API_KEY` in your `.env` is set to a valid Resend API key.
- The default `onboarding@resend.dev` sender can only deliver to the email address on your Resend account until you verify a custom domain — verify a domain in the Resend dashboard to send to arbitrary client addresses.
- Check your spam folder if test emails are not arriving.

**"Share via WhatsApp" doesn't attach the PDF**
- The invoice PDF is attached automatically only on browsers/devices that support the native file-sharing API (mostly mobile). On desktop browsers without support, the PDF downloads and a WhatsApp chat opens with a text message — attach the downloaded file manually.

**CORS errors in the browser**
- Confirm the backend is running on the expected port and that your Express CORS configuration allows requests from the frontend origin (e.g. `http://localhost:5173`).

**`npm run dev` not found**
- Check that you are in the correct directory (`backend/` or `frontend/`) before running the command.

---

## Future Improvements

- Multiple invoice templates
- Recurring / scheduled invoices
- Multi-currency conversion (currently a display-format setting rather than live conversion)
- Export invoices/clients to CSV

---

## Contributing

This is primarily a personal/portfolio project, but issues and pull requests are welcome. Please open an issue first to discuss any significant change.

---

## Author

**Madhushree Boyle**

- GitHub: [@madbag](https://github.com/madbag)
- LinkedIn: [Madhushree B](https://linkedin.com/in/madhushreeb)
