# 🌾 AgriChain — Agricultural Inventory Management System

A full-stack Farm-to-Warehouse inventory management platform covering the complete agricultural supply chain: Sowing → Harvest → Processing → Quality Control → Delivery → Market & Sales.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [System Requirements](#-system-requirements)
- [Project Structure](#-project-structure)
- [First-Time Setup](#-first-time-setup)
- [Running the Project](#-running-the-project)
- [Default Accounts](#-default-accounts)
- [User Roles](#-user-roles)
- [Available Scripts](#-available-scripts)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite |
| **Routing** | React Router DOM v6 |
| **Charts** | Recharts |
| **HTTP Client** | Axios |
| **Animations** | Framer Motion |
| **Styling** | Vanilla CSS |
| **Backend** | Node.js + Express.js |
| **Database** | MySQL |
| **Auth** | JWT + bcryptjs |

---

## 💻 System Requirements

Make sure the following are installed on your machine before starting:

| Tool | Version | Download |
|---|---|---|
| **Node.js** | v18+ | https://nodejs.org |
| **MySQL** | v8.0+ | https://dev.mysql.com/downloads/ |
| **npm** | v9+ | Comes with Node.js |
| **Git** | Latest | https://git-scm.com |

---

## 📁 Project Structure

```
AgriChain/
├── public/                  # Static assets
├── src/                     # React frontend
│   ├── components/          # Layout, SharedUI, PageTransition, RoleSelector
│   ├── context/             # RoleContext (auth + role state)
│   └── pages/               # Page components grouped by role
│       ├── auth/            # Login, Register
│       ├── admin/           # Admin dashboards + data management
│       ├── farmer/          # Sowing, Harvest, Inputs
│       ├── supplier/        # Input Supply Management
│       ├── warehouse/       # Inventory, Sensors, Stock Movement
│       ├── processing/      # Plants, Batches
│       ├── quality/         # QC Reports
│       ├── logistics/       # Deliveries
│       └── market/          # Markets, Sales
├── server/                  # Node.js + Express backend
│   ├── routes/              # API route modules (10 modules)
│   ├── db.js                # MySQL connection pool
│   ├── index.js             # Express app entry point
│   ├── migrate.sql          # Full 24-table database schema
│   ├── run-migration.js     # Migration runner (no MySQL CLI needed)
│   └── seed.js              # Sample data seeder
├── .env                     # Environment variables (you must create this)
├── package.json
└── README.md
```

---

## 🚀 First-Time Setup

Follow these steps **in order** to get the project running from scratch.

### Step 1 — Clone the Repository

```bash
git clone <your-repository-url>
cd "Invetory Management for agricultural products"
```

### Step 2 — Install Frontend & Backend Dependencies

```bash
npm install
```

### Step 3 — Create the Environment File

Create a `.env` file in the **root** of the project:

```bash
touch .env
```

Open it and add the following (replace values to match your MySQL setup):

```env
# MySQL Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=agrichain

# JWT Secret (use any long random string)
JWT_SECRET=agrichain_super_secret_jwt_key_2025

# Server Port
PORT=3001
```

> **Note:** If your MySQL has a password, set `DB_PASSWORD=yourpassword`. If you're using MAMP/XAMPP, `DB_USER` may be `root` and `DB_PASSWORD` may be empty or `root`.

### Step 4 — Create the MySQL Database

Open your MySQL client (MySQL Workbench, TablePlus, phpMyAdmin, or terminal) and run:

```sql
CREATE DATABASE IF NOT EXISTS agrichain;
```

### Step 5 — Run the Database Migration

This creates all 24 tables in the `agrichain` database:

```bash
node server/run-migration.js
```

Expected output:
```
✅ Migration complete! All tables created.
```

### Step 6 — Seed Sample Data

This populates the database with realistic Bangladesh agricultural sample data (8 users, 5 products, 8 harvest batches, 7 sales, etc.):

```bash
node server/seed.js
```

Expected output:
```
🌱 Seeding AgriChain with Bangladesh sample data...
  ✓ User: Rahim Uddin (F)
  ...
🎉 Seeding complete!
```

---

## ▶️ Running the Project

You need **two terminal windows** — one for the backend, one for the frontend.

### Terminal 1 — Start the Backend API Server

```bash
node server/index.js
```

Expected output:
```
AgriChain backend v2.0 running on port 3001
```

### Terminal 2 — Start the Frontend Dev Server

```bash
npm run dev
```

Expected output (Vite):
```
VITE v8.x.x  ready in 300ms
➜  Local:   http://localhost:5173/
```

Now open **http://localhost:5173** in your browser.

---

## 🔑 Default Accounts

After seeding, you can log in with any of the following accounts. All seeded users share the same password.

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@agrichain.com | `admin123` |
| **Farmer 1** | rahim@agrichain.com | `agrichain123` |
| **Farmer 2** | karim@agrichain.com | `agrichain123` |
| **Supplier** | bashir@agrichain.com | `agrichain123` |
| **Warehouse Manager** | nasreen@agrichain.com | `agrichain123` |
| **Processing Manager** | rafique@agrichain.com | `agrichain123` |
| **Quality Inspector** | salma@agrichain.com | `agrichain123` |
| **Market Operator** | jahangir@agrichain.com | `agrichain123` |
| **Logistics Manager** | mosharraf@agrichain.com | `agrichain123` |

---

## 👥 User Roles

AgriChain supports **8 distinct user roles**, each with a dedicated dashboard and module access:

| Role | Code | Responsibilities |
|---|---|---|
| 🌾 **Farmer** | `F` | Sowing logs, harvest batches, input supply received |
| 🚚 **Supplier** | `S` | Input supply management (fertilizers, seeds, pesticides) |
| 🏭 **Warehouse Manager** | `WM` | Inventory, stock movements, sensors monitoring |
| ⚙️ **Processing Manager** | `PM` | Processing plants, batch processing |
| 🔬 **Quality Inspector** | `QI` | Quality control reports, grading |
| 🚛 **Logistics Manager** | `LM` | Delivery tracking and dispatch |
| 🏪 **Market Operator** | `MO` | Market management, sales recording |
| 🛡️ **Admin** | `A` | Full system access, all CRUD, batch traceability, analytics |

---

## 📜 Available Scripts

Run these from the project root directory:

```bash
# Start frontend dev server (Vite)
npm run dev

# Start backend API server
node server/index.js

# Run database migration (creates all 24 tables)
node server/run-migration.js

# Seed database with sample data
node server/seed.js

# Build frontend for production
npm run build

# Preview production build
npm run preview
```

---

## ⚠️ Troubleshooting

**White screen on startup**
- Make sure the backend API is running (`node server/index.js`)
- Check that MySQL is running and the `agrichain` database exists

**"Cannot connect to database" error**
- Verify your `.env` values match your local MySQL credentials
- Ensure MySQL service is running on port 3306

**"User already seeded" message from seed.js**
- If re-seeding is needed: delete users (except admin user_id=1), then re-run `node server/seed.js`

**Port conflicts**
- Backend default: `3001` — change `PORT` in `.env`
- Frontend default: `5173` — Vite auto-selects next available port

**Node.js not found in PATH (macOS)**
- Use full path: `/usr/local/bin/node server/index.js`

---

## 🌐 API Overview

The backend exposes a RESTful API at `http://localhost:3001/api/`:

| Module | Base Path | Description |
|---|---|---|
| Auth | `/api/auth` | Register, Login, Profile update |
| Farmer | `/api/farmer` | Sowing, Harvest, Input supply |
| Supplier | `/api/supplier` | Input supply CRUD |
| Warehouse | `/api/warehouse` | Inventory, Movements, Sensors |
| Processing | `/api/processing` | Plants, Batches |
| Quality | `/api/quality` | QC Reports |
| Delivery | `/api/delivery` | Delivery tracking |
| Market | `/api/market` | Markets, Sales |
| Admin | `/api/admin` | Users, Stats, Batch Traceability |
| Product | `/api/product` | Product catalogue |

---

*Built with ❤️ for agricultural supply chain management.*
