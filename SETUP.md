# Project Task Manager - Setup Instructions

## Prerequisites

- **Bun** (latest version) - https://bun.sh/
- **Docker** and **Docker Compose** - for PostgreSQL database

### Installing Bun

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"
```

## Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Environment Configuration

Copy the example environment files and update as needed:

```bash
# Backend environment
cp packages/api/.env.example packages/api/.env

# Frontend environment (if needed)
cp packages/client/.env.example packages/client/.env
```

### 3. Start Database

```bash
docker-compose up -d
```

### 4. Run Migrations

```bash
bun run db:migrate
```

### 5. Start Application

```bash
bun run dev
```

## Access

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

Create an account or use the test credentials from the environment file.
