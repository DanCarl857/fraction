# Baseball App (FastAPI + React + PostgreSQL)

This repository contains a **monorepo** with:

- **backend/** – FastAPI + SQLAlchemy ORM + PostgreSQL (source of truth)
- **frontend/** – React + TypeScript + Tailwind CSS + Radix UI
- **docker-compose.yml** – PostgreSQL database

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

### Project structure

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
├── docker-compose.yml
└── README.md
```
