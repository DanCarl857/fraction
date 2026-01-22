# Baseball App (FastAPI + React + PostgreSQL)

This repository contains a **monorepo** with:

- **backend/** – FastAPI + SQLAlchemy ORM + PostgreSQL (source of truth)
- **frontend/** – React + TypeScript + Tailwind CSS + Radix UI

The backend:
- Fetches baseball data from `https://api.hirefraction.com/api/test/baseball`
- Stores all data in PostgreSQL
- Serves data to the frontend
- Generates LLM-based player descriptions
- Exposes Swagger docs at `/docs`

The frontend:
- Lists players ordered by **Hits** or **Home Runs**
- Displays player details and LLM-generated descriptions
- Allows editing player data (persisted to backend)

---

## Requirements (Windows)

Install these **before starting**:

- **Python 3.11+**
  ```powershell
  python --version
  ```
- **Node.js 18+**
  ```powershell
  node --version
  npm --version
  ```
- **PostgreSQL 15+**  
  Make sure PostgreSQL is running locally and you have a database created:
  ```sql
  CREATE DATABASE baseball;
  ```

---

## Project structure

```
fraction/
├── backend/
│   ├── app/
│   ├── .env
│   ├── requirements.txt
│   └── .venv/
├── frontend/
│   ├── src/
│   └── package.json
├── README.md
```

---

# Running the Backend (FastAPI)

## 1. Create a Python virtual environment

From the **backend/** directory:

```powershell
cd backend
python -m venv .venv
```

Activate it:

```powershell
.venv\Scripts\activate
```

Confirm:

```powershell
where python
```

---

## 2. Install backend dependencies

```powershell
pip install -r requirements.txt
```

---

## 3. Create backend `.env`

Inside **backend/.env**:

```env
DATABASE_URL=postgresql+psycopg://app:app@localhost:5432/baseball
OPENAI_API_KEY=your_openai_key_here
BASEBALL_UPSTREAM_URL=https://api.hirefraction.com/api/test/baseball
```

> Ensure PostgreSQL is running and the database exists.

---

## 4. Run the backend server

From **backend/**:

```powershell
uvicorn app.main:app --reload
```

Backend will be available at:

```
http://127.0.0.1:8000
```

Swagger docs:
```
http://127.0.0.1:8000/docs
```

---

# Running the Frontend (React + Vite)

## 1. Install frontend dependencies

From the project root:

```powershell
cd frontend
npm install
```

---

## 2. Create frontend `.env`

Inside **frontend/.env**:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

## 3. Start the frontend

```powershell
npm run dev
```

Frontend will be available at:

```
http://localhost:5173
```

---

# Syncing Player Data

Once backend is running, fetch data from the upstream API into your database:
On the frontend you can do this by clicking on the sync button

```
POST http://127.0.0.1:8000/api/sync
```

You can trigger this via:
- Swagger UI (`/docs`)
- Or directly from the frontend (Sync button)

---

# Useful Commands

### Backend

```powershell
uvicorn app.main:app --reload
```

### Frontend

```powershell
npm run dev
```

---

# Common Issues

### Database connection errors
Ensure:
- PostgreSQL is running
- Database exists
- `DATABASE_URL` is correct
- Credentials match your local setup

### Frontend not loading data
Ensure:
- Backend is running first
- `VITE_API_BASE_URL` is correct
- No CORS errors in console
