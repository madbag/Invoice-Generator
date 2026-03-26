# 🧾 Invoice Generator

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18-blue)
![MongoDB](https://img.shields.io/badge/database-MongoDB-green)

A full-stack Invoice Generator web application built with the **MERN Stack** (MongoDB, Express, React, Node.js). The application allows users to create invoices, preview them, generate a PDF, and send the invoice directly to a client's email.

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
    - [Email Functionality](#email-functionality)
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
    - [User Profile](#user-profile-1)
    - [Invoices](#invoices)
  - [Key Concepts Demonstrated](#key-concepts-demonstrated)
  - [Troubleshooting](#troubleshooting)
  - [Future Improvements](#future-improvements)
  - [Contributing](#contributing)
  - [Author](#author)

---

## Project Overview

This application allows authenticated users to create professional invoices, preview them, and send them as PDF files directly to clients.

The goal of this project was to build a real-world business tool while demonstrating backend architecture, API development, authentication, and frontend state management.

---

## Features

### Authentication
- User registration
- Secure login using JWT authentication
- Protected routes using middleware

### Invoice Management
- Create invoices with multiple line items
- Automatically calculate subtotals, tax, and grand totals
- Edit and update existing invoices
- Preview invoices before sending
- Save invoices to MongoDB

### Email Functionality
- Generate invoice as a PDF
- Send invoice directly to client email via Resend
- Custom email message option

### User Profile
- Manage user information
- User-specific invoice storage

### UI
- Dynamic invoice form with real-time total calculation
- Invoice preview modal
- Clean and responsive interface

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React, TypeScript, Tailwind CSS, Context API |
| **Backend** | Node.js, Express.js, JWT Authentication, Resend |
| **Database** | MongoDB, Mongoose ODM |
| **Tools** | Git, GitHub, Postman, npm |

---

## Project Structure

```
invoice-generator/
│
├── frontend/
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── context/
│   └── utils/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── utils/
│
└── README.md
```

---

## Prerequisites

Make sure you have the following installed before running the project:

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9 or higher
- [MongoDB]free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- A Gmail account with an [App Password](https://support.google.com/accounts/answer/185833) enabled (required for Resend)

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

Copy the example env file and fill in your values (see [Environment Variables](#environment-variables)):

```bash
cp backend/.env.example backend/.env
```

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

Create a `.env` file inside the `backend/` folder. An `.env.example` file is included for reference:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RESEND_API_KEY=your_email@gmail.com
FRONTEND_URL=your_gmail_app_password
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

### User Profile

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| `GET` | `/api/users/profile` | ✅ | Get the current user's profile |
| `PUT` | `/api/users/profile` | ✅ | Update the current user's profile |

### Invoices

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| `GET` | `/api/invoices` | ✅ | Get all invoices for the authenticated user |
| `POST` | `/api/invoices` | ✅ | Create a new invoice |
| `GET` | `/api/invoices/:id` | ✅ | Get a single invoice by ID |
| `PUT` | `/api/invoices/:id` | ✅ | Update an existing invoice |
| `DELETE` | `/api/invoices/:id` | ✅ | Delete an invoice |
| `POST` | `/api/invoices/:id/send` | ✅ | Generate PDF and send invoice to client email |

---

## Key Concepts Demonstrated

- Full-stack MERN architecture
- REST API development
- JWT authentication and middleware-protected routes
- MongoDB schema design with Mongoose
- Email service integration with Resend
- PDF generation
- React state management with Context API
- Component-based frontend architecture
- TypeScript for type-safe frontend development

---

## Troubleshooting

**JWT errors / Unauthorized responses**
- Make sure `JWT_SECRET` in your `.env` matches what was used to sign existing tokens. Changing it invalidates all active sessions.

**Emails not sending**
- Gmail requires an [App Password](https://support.google.com/accounts/answer/185833), not your regular account password. Make sure 2-Step Verification is enabled on your Google account first.
- Check your spam folder if test emails are not arriving.

**CORS errors in the browser**
- Confirm the backend is running on the expected port and that your Express CORS configuration allows requests from the frontend origin (e.g. `http://localhost:5173`).

**`npm run dev` not found**
- Check that you are in the correct directory (`backend/` or `frontend/`) before running the command.

---

## Future Improvements

- Invoice dashboard with analytics and charts
- Multiple invoice templates
- Invoice status tracking (Draft / Sent / Paid / Overdue)
- Search and filter invoices

---

## Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m 'Add some feature'`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please make sure your code follows the existing style and that any new features are tested before submitting.

---

## Author

**Your Name**

- GitHub: [@madbag](https://github.com/madbag)
- LinkedIn: [Madhushree B](https://linkedin.com/in/madhushreeb)


