# Protein Authentication Web Application

## Overview
A production-ready protein product authentication web application. This repository contains the initial foundation with a React frontend and an Express/MySQL backend.

## Technology Stack
- **Frontend**: React.js, Vite, JavaScript, CSS, React Router
- **Backend**: Node.js, Express.js, MySQL
- **Architecture**: Monorepo with separated `frontend` and `backend` directories.

## Folder Structure
```
protein-authentication/
├── frontend/        # React application
├── backend/         # Node.js/Express server
├── database/        # Database schemas and migrations
├── .env.example     # Environment variables template
└── README.md
```

## Installation Steps

1. **Clone the repository**
2. **Setup Environment Variables**:
   Copy `.env.example` to `.env` in the root (or in backend) and fill in your database credentials.
   ```bash
   cp .env.example .env
   ```

3. **Backend Setup**:
   ```bash
   cd backend
   npm install
   ```

4. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   ```

## Starting the Application

**Start the Backend**:
```bash
cd backend
npm run dev
```

**Start the Frontend**:
```bash
cd frontend
npm run dev
```
