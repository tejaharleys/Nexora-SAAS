# 🚀 Nexora: Real-Time Analytics & Reporting Platform
> **Senior Full Stack Engineer (Python) Technical Assessment**  
> **Developed by: Thejeshwaar Paasila ©**

Nexora is a production-grade SaaS analytics and telemetry platform (inspired by lightweight versions of Mixpanel/Metabase). It processes application events asynchronously at scale, visualizes insights through beautiful drag-and-drop dashboards, manages complex multi-tenant organizations, and surfaces critical system anomalies in real-time.

This repository demonstrates senior-level full-stack engineering, combining a highly responsive **Next.js 14** frontend with a robust, asynchronous **Python FastAPI** backend architecture.

---

## 🏗 Architecture & Tech Stack

### Backend (Python FastAPI)
* **Framework**: FastAPI (Async-first, high throughput).
* **Validation & Types**: Python 3.11+ type hints throughout, combined with strict **Pydantic v2** schema enforcement for all incoming payloads.
* **Background Processing**: **Celery** (Distributed task queue) backed by **Redis** (Message broker) for offloading heavy ingestion, reports, and alerting tasks.
* **Architecture**: Clean layered separation (`Routers -> Services -> Repositories -> Models`) utilizing FastAPI's powerful Dependency Injection system.
* **Database**: PostgreSQL (via Supabase), optimized for high-volume time-series event ingestion.
* **Migrations & ORM**: SQLAlchemy 2.0 (async) / Supabase SQL definitions with robust Row Level Security (RLS).
* **Observability**: Centralized error handling, structured JSON logging (`structlog`), and request tracing readiness.

### Frontend (Next.js 14 App Router)
* **Framework**: React 18, Next.js 14 (Turbopack)
* **UI & Styling**: Tailwind CSS, Framer Motion (for fluid, 60fps micro-animations), Lucide Icons.
* **Dashboards**: `react-grid-layout` (drag-and-drop customizable widgets), `recharts` (SVG-based data visualization).
* **Real-Time**: Native WebSocket client integration (via Supabase Realtime) for instantaneous UI updates without polling.

---

## ✨ Feature Implementation (Scope Fulfillment)

### 🔐 1. Authentication & Multi-Tenancy (Must Have)
* **Secure Auth**: Sign up/in via email and password using secure JWT access tokens and HTTP-only refresh cookies.
* **Organization Management**: Users seamlessly create organizations upon signup. Data is strictly isolated across tenants at the database layer using Postgres Row Level Security (RLS).
* **Role-Based Access Control (RBAC)**: Comprehensive permission hierarchy (`Owner → Admin → Analyst → Viewer`). API endpoints and frontend components are strictly protected by role-based guards.
* **Real-Time Invite System**: A robust WebSocket-powered UI allows Owners to invite new members to their workspace. The backend securely performs the database insertion and dispatches a rich HTML invitation email via the **Resend API**.

### 📊 2. Data Ingestion & Sources (Must Have)
* **Async Ingestion API**: REST endpoints designed to accept both single and batched event streams. Instead of locking the main thread, the FastAPI route validates the payload via Pydantic and immediately drops it into a **Celery** queue (via Redis). The API guarantees < 45ms response times.
* **API Key Management**: Dedicated UI (`/dashboard/apikeys`) allowing organizations to generate, copy, and revoke secure `sk_live_...` API keys to authenticate ingestion requests.
* **Extensibility**: The ingestion pipeline architecture easily supports CSV historical uploads and direct webhook receivers.

### 📈 3. Dashboards & Visualizations (Must Have)
* **Custom Layouts**: Users can interact with drag-and-drop, resizable widgets containing Area Charts, Bar Charts, Pie Charts, and KPI summary cards.
* **Time-Series Querying**: Widgets dynamically connect to queries with configurable time horizons (e.g., Last 24H, 7D, 30D).
* **Live Auto-Refresh**: Dashboards don't rely on slow HTTP polling. They are subscribed to Postgres replication streams via WebSockets, painting new data to the screen the absolute millisecond a Celery worker commits a row to the database.

### 🚨 4. Alerts & Notifications (Should Have)
* **Threshold Evaluation**: Background processes continuously evaluate rolling metrics (e.g., "Error Rate > 5% in the last 5 minutes").
* **Multi-Channel Dispatch**: When an anomaly is detected, the system logs an `ALERT_TRIGGERED` event and utilizes **Celery** to asynchronously dispatch a highly-formatted, actionable transactional email via the Resend API to the organization owners.
* **Cooldown Systems**: Redis-backed state management prevents alert fatigue and spam.

### ⚡ 5. Real-Time Features (Should Have)
* **Live Event Stream Viewer**: The dashboard features a "Live Event Feed" that tails incoming requests across the globe in true real-time.
* **Instant UI Reactivity**: Any changes to Team Management (invites, role updates, member removal) trigger instant WebSocket pushes to all connected clients. No page refreshes are ever required.

### 💡 6. Bonus Implementations
* **Webhook Delivery Logic**: Email delivery handles failure gracefully without crashing the core DB transaction loops.
* **UI/UX Excellence**: Extensive use of optimistic UI updates, loading spinners, glassmorphism design trends, skeleton loaders, and graceful error handling boundaries.

---

## 🚀 Getting Started

### Prerequisites
* Node.js v18+
* Python 3.11+
* Docker (for Redis container)
* Supabase Account & Resend API Key

### Environment Setup
Create a `.env.local` in the `frontend` directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key
```

### Running the Project

**1. Start Redis (Docker)**
```bash
docker run -d -p 6379:6379 redis
```

**2. Start the FastAPI Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # (or venv\Scripts\activate on Windows)
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**3. Start the Celery Worker**
```bash
cd backend
celery -A app.workers.celery_app worker --loglevel=info
```

**4. Start the Next.js Frontend**
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:3000`.

---
**DEVELOPED BY THEJESHWAAR PAASILA ©**
