<p align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?style=for-the-badge&logo=spring-boot" />
  <img src="https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker" />
  <img src="https://img.shields.io/badge/Prometheus-Monitoring-E6522C?style=for-the-badge&logo=prometheus" />
  <img src="https://img.shields.io/badge/Grafana-Dashboard-F46800?style=for-the-badge&logo=grafana" />
  <img src="https://img.shields.io/badge/Jenkins-CI%2FCD-D24939?style=for-the-badge&logo=jenkins" />
  <img src="https://img.shields.io/badge/GitHub%20Actions-CI-2088FF?style=for-the-badge&logo=github-actions" />
  <img src="https://img.shields.io/badge/Three.js-3D%20UI-000000?style=for-the-badge&logo=three.js" />
</p>

# ☁️ CloudPulse — Intelligent Task Orchestration Platform

> **Real-time task scheduling with automated conflict detection, priority-based resolution, and full-stack observability — deployed via an industry-grade CI/CD pipeline.**

CloudPulse is a production-ready, full-stack Java application that enables users — students, teachers, teams, and organizations — to schedule tasks across shared resources, automatically detect scheduling conflicts in real-time, and resolve them using priority-based algorithms. All operations are persisted in **MongoDB**, monitored via **Prometheus + Grafana**, and deployed through a fully automated **Docker + GitHub Actions + Jenkins** pipeline.

---

## 📑 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Monitoring & Observability](#-monitoring--observability)
- [Testing](#-testing)
- [Screenshots](#-screenshots)
- [Scope & Future Enhancements](#-scope--future-enhancements)

---

## ✨ Features

### Core Scheduling Engine
- **Task CRUD** — Create, read, update, delete tasks with title, description, assignee, resource, time window, and priority
- **Dual Conflict Detection** — Detects TWO types of conflicts automatically:
  - 🔴 **Resource Conflict** — Same resource, overlapping time (e.g., two tasks on SERVER-01 at the same time)
  - 🔴 **Assignee Conflict** — Same person, overlapping time (e.g., "ankan" has two tasks at once, even on different resources)
- **Smart Free-Slot Resolution** — Auto-resolve scans ALL existing tasks to find the next time slot where BOTH the resource AND assignee are free. Higher priority keeps its slot; lower priority gets intelligently rescheduled
- **Resource Management** — Tasks are grouped by resource (servers, rooms, labs) for easy management

### Real-Time Persistence
- **MongoDB Integration** — All tasks stored in MongoDB; data persists across container restarts
- **Live Updates** — UI auto-refreshes every 5 seconds; changes reflect instantly across browser tabs

### 3D Immersive UI
- **Three.js Background** — Animated starfield (1800 particles), floating icosahedron nodes, traveling connector particles, pulsing ring geometry
- **Glassmorphism Design** — Frosted glass panels, gradient buttons, smooth transitions
- **Toast Notifications** — Slide-in alerts on task creation, conflict detection, resolution, and deletion
- **4-Tab Interface** — All Tasks (with search/filter), Conflicts, Resources, Timeline

### DevOps & Observability
- **Docker Compose** — 5 containers (App, MongoDB, Prometheus, Grafana, Jenkins) orchestrated with one command
- **GitHub Actions CI** — Automated build + test on every push (5 JUnit tests)
- **Jenkins CD** — Automated deployment pipeline
- **Prometheus Metrics** — Custom business metrics (tasks created, conflicts detected/resolved, active tasks) + JVM metrics
- **Grafana Dashboard** — 35+ panels across 5 sections with real-time data visualization

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER (Browser)                           │
│                                                                 │
│   ┌──────────────────────────────────────────────────────┐      │
│   │  3D Landing Page (Three.js + Glassmorphism UI)       │      │
│   │  index.html / styles.css / script.js                 │      │
│   └──────────────────────┬───────────────────────────────┘      │
│                          │ REST API calls                        │
└──────────────────────────┼──────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                    DOCKER COMPOSE                                │
│                          │                                       │
│   ┌──────────────────────▼───────────────────────────────┐      │
│   │  Spring Boot Application (port 8080)                  │      │
│   │  ├── TaskController (8 REST endpoints)                │      │
│   │  ├── ConflictDetectionService (overlap scanner)       │      │
│   │  ├── ConflictResolutionEngine (priority resolver)     │      │
│   │  ├── MetricsService (Prometheus counters/gauges)      │      │
│   │  └── Static UI served from /resources/static/         │      │
│   └───────┬──────────────┬───────────────────────────────┘      │
│           │              │                                       │
│   ┌───────▼──────┐ ┌────▼─────────────┐                        │
│   │  MongoDB 7   │ │  Prometheus      │                        │
│   │  port 27018  │ │  port 9090       │                        │
│   │  cloudpulse  │ │  scrapes /actuator│                       │
│   │  database    │ │  /prometheus      │                        │
│   └──────────────┘ └────┬─────────────┘                        │
│                         │                                        │
│                    ┌────▼─────────────┐  ┌──────────────┐       │
│                    │  Grafana         │  │  Jenkins     │       │
│                    │  port 3000       │  │  port 8090   │       │
│                    │  35+ panels      │  │  CD pipeline │       │
│                    └──────────────────┘  └──────────────┘       │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend** | Java 17, Spring Boot 3.2 | REST API, business logic, conflict engine |
| **Database** | MongoDB 7 | Persistent task storage (auto-created) |
| **Frontend** | HTML5, CSS3, JavaScript, Three.js | 3D immersive task scheduler UI |
| **Monitoring** | Prometheus | Metrics scraping (JVM + business metrics) |
| **Visualization** | Grafana | 35+ real-time dashboard panels |
| **Containerization** | Docker, Docker Compose | Multi-container orchestration |
| **CI** | GitHub Actions | Automated build + Maven test on push |
| **CD** | Jenkins | Automated deployment pipeline |
| **Testing** | JUnit 5 | 5 unit tests for core logic |
| **Metrics** | Micrometer + Prometheus Registry | Custom counters and gauges |

---

## 📂 Project Structure

```
CloudPulse/
├── src/main/java/com/cloudpulse/
│   ├── CloudPulseApplication.java      # Spring Boot entry point
│   ├── Task.java                       # @Document entity (MongoDB)
│   ├── Priority.java                   # HIGH, MEDIUM, LOW enum
│   ├── TaskStatus.java                 # SCHEDULED, CONFLICT, RESOLVED, RUNNING, DONE
│   ├── TaskRepository.java             # MongoRepository interface
│   ├── TaskController.java             # 8 REST endpoints
│   ├── ConflictDetectionService.java   # Time-window overlap scanner
│   ├── ConflictResolutionEngine.java   # Priority-based auto-rescheduler
│   ├── MetricsService.java             # Custom Prometheus business metrics
│   ├── DataInitializer.java            # Startup logger
│   └── WebConfig.java                  # CORS configuration
│
├── src/main/resources/
│   ├── application.properties          # App + MongoDB + Actuator config
│   └── static/                         # UI served by Spring Boot
│       ├── index.html
│       ├── styles.css
│       └── script.js
│
├── src/test/java/com/cloudpulse/
│   └── TaskControllerTest.java         # 5 JUnit 5 unit tests
│
├── landing/                            # Source landing page files
│   ├── index.html
│   ├── styles.css
│   └── script.js
│
├── grafana/
│   ├── dashboards/
│   │   └── cloudpulse-custom.json      # 35+ panel Grafana dashboard
│   └── provisioning/
│       ├── dashboards/dashboard.yml
│       └── datasources/datasource.yml
│
├── .github/workflows/ci.yml           # GitHub Actions CI pipeline
├── docker-compose.yml                  # 5-container orchestration
├── Dockerfile                          # Multi-stage Java build
├── prometheus.yml                      # Prometheus scrape config
├── Jenkinsfile                         # Jenkins CD pipeline
├── pom.xml                             # Maven dependencies
└── README.md                           # This file
```

---

## 🚀 Getting Started

### Prerequisites
- **Docker Desktop** installed and running
- **Git** installed
- Port 8081, 27018, 9090, 3000, 8090 available

### Quick Start (One Command)

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/CloudPulse.git
cd CloudPulse

# Start everything (app + MongoDB + Prometheus + Grafana + Jenkins)
docker-compose up -d --build
```

Wait ~2-3 minutes for the build to complete. Then open:

| Service | URL | Credentials |
|---------|-----|-------------|
| **CloudPulse UI** | http://localhost:8081 | — |
| **REST API** | http://localhost:8081/api/tasks | — |
| **MongoDB** | mongodb://localhost:27018 | — |
| **Prometheus** | http://localhost:9090 | — |
| **Grafana** | http://localhost:3000 | admin / admin |
| **Jenkins** | http://localhost:8090 | (setup wizard) |

### Stop Everything

```bash
docker-compose down       # Stop containers (data persists)
docker-compose down -v    # Stop + delete all data
```

---

## 📡 API Reference

All endpoints are prefixed with `/api/tasks`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks` | List all tasks |
| `GET` | `/api/tasks/{id}` | Get single task by ID |
| `POST` | `/api/tasks` | Create task (auto-detects conflicts) |
| `PUT` | `/api/tasks/{id}` | Update task (status, title, assignee) |
| `DELETE` | `/api/tasks/{id}` | Delete a task |
| `GET` | `/api/tasks/conflicts` | List all conflicting tasks |
| `POST` | `/api/tasks/resolve/{id}` | Auto-resolve a conflict |
| `GET` | `/api/tasks/stats` | Platform statistics |

### Example: Create a Task

```bash
curl -X POST http://localhost:8081/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Database Backup",
    "description": "Full backup of production DB",
    "assignee": "ops-team",
    "resourceTag": "DB-CLUSTER",
    "startTime": "2026-05-05T10:00:00",
    "endTime": "2026-05-05T12:00:00",
    "priority": "HIGH"
  }'
```

### Response (Conflict Detected):
```json
{
  "id": "664e3f...",
  "title": "Database Backup",
  "status": "CONFLICT",
  "conflictsDetected": 1,
  "message": "⚠️ Task created with 1 conflict(s). Use /resolve/664e3f... to auto-resolve."
}
```

---

## 🔄 CI/CD Pipeline

```text
git push → GitHub Actions (Cloud CI) → Webhook → Jenkins (Local CD) → Live
```

### GitHub Actions (Cloud CI)
- **Trigger:** Every `git push` to `main`
- **Steps:** Checkout → Setup JDK 17 → Maven build → Run 5 JUnit tests
- **Purpose:** Cloud-based gatekeeper to ensure code quality before deployment.
- **Config:** `.github/workflows/ci.yml`

### Jenkins (Local CD)
- **Trigger:** Manual trigger (or webhook) from GitHub
- **Steps:** Checkout latest code → Compile & Test → Security Scan → Deploy App
- **Purpose:** Securely deploy approved code to the production environment.
- **Config:** `Jenkinsfile`

---

## 📊 Monitoring & Observability

### Prometheus Metrics

**Custom Business Metrics** (scraped from `/actuator/prometheus`):
| Metric | Type | Description |
|--------|------|-------------|
| `cloudpulse_tasks_created_total` | Counter | Total tasks created |
| `cloudpulse_conflicts_detected_total` | Counter | Total conflicts detected |
| `cloudpulse_conflicts_resolved_total` | Counter | Total conflicts auto-resolved |
| `cloudpulse_active_tasks` | Gauge | Current active (non-DONE) tasks |

**JVM Metrics** (auto-exposed by Spring Boot Actuator):
- Heap/Non-Heap memory, GC pauses, thread counts, CPU usage, class loading, HTTP request rates

### Grafana Dashboard (35+ Panels)

| Section | Panels |
|---------|--------|
| 🚀 Business Metrics | App Status, Uptime, Tasks Created, Conflicts, Resolved, Resolution Rate Gauge, Active Tasks, Heap Gauge, CPU Gauge, Thread Bar Chart, HTTP req/s, Latency, Classes, Open Files |
| 📈 Real-Time Performance | Task Activity Over Time, JVM Heap Memory, CPU & System Load, HTTP Endpoint Performance |
| 🗄️ JVM Internals | Thread Monitoring, Thread State Donut, GC & Class Loading |
| 🔥 Advanced Observability | Task Creation Rate (bars), Conflict vs Resolution Rate, HTTP Status Breakdown, Memory Pools (stacked), GC Activity, Request Duration by Endpoint, Memory Pie Chart, Buffer Pool |
| 🏗️ System & Disk | Disk Usage Gauge, Total Requests, 5xx Errors, CPU Cores, Stacked CPU Breakdown, Uptime Trend |

---

## 🧪 Testing

### Unit Tests (5 tests)

```bash
mvn test
```

| Test | What it validates |
|------|------------------|
| `testTaskDefaultStatus` | New tasks default to SCHEDULED status |
| `testOverlapDetection` | Overlapping time windows are detected |
| `testNoOverlap` | Non-overlapping tasks pass cleanly |
| `testPriorityOrdering` | HIGH < MEDIUM < LOW ordinal ordering |
| `testStatusLifecycle` | SCHEDULED → CONFLICT → RESOLVED → DONE |

---

## 📸 Screenshots

> Add your screenshots here after running the application.

| Screenshot | Description |
|-----------|-------------|
| UI - Empty State | Landing page with 3D background, empty task list |
| UI - Task Created | Task card with priority badge and time slot |
| UI - Conflict Detected | Warning banner, red CONFLICT badges |
| UI - Auto-Resolved | Blue RESOLVED badges with rescheduling note |
| UI - Resources Tab | Tasks grouped by resource |
| UI - Timeline Tab | Sorted timeline of active tasks |
| MongoDB Compass | Task documents in the `cloudpulse.tasks` collection |
| Prometheus | Custom metrics query results |
| Grafana | 35+ panel dashboard with live data |
| Docker | All 5 containers running |
| GitHub Actions | CI pipeline passing with 5 tests |

---

## 🔮 Scope & Future Enhancements

### Current Scope
- Real-time task scheduling with CRUD operations
- Dual conflict detection (resource overlap + assignee overlap)
- Smart free-slot resolution — finds next available slot where both resource AND assignee are free
- MongoDB persistence (data survives restarts)
- Full CI/CD pipeline (GitHub Actions + Jenkins)
- Live monitoring (Prometheus + 35-panel Grafana dashboard)
- 3D immersive frontend (Three.js + glassmorphism)

### Future Enhancements
- **User Authentication** — JWT-based login for multi-tenant scheduling
- **WebSocket Push** — Real-time push updates instead of polling
- **Recurring Tasks** — Cron-based recurring schedule support
- **Email Notifications** — Alert users when conflicts are detected
- **Calendar View** — Drag-and-drop calendar UI
- **Role-Based Access** — Admin, Manager, User roles
- **Redis Caching** — Cache frequently accessed task lists
- **Kubernetes Deployment** — Helm charts for K8s orchestration

---

## 📜 Commands Reference

```bash
# Build and start all services
docker-compose up -d --build

# View running containers
docker ps

# View app logs
docker logs cloudpulse-app -f

# View MongoDB data
docker exec -it cloudpulse-mongo mongosh cloudpulse --eval "db.tasks.find().pretty()"

# Stop all services
docker-compose down

# Stop and delete all data
docker-compose down -v

# Run tests locally
mvn test

# Build JAR locally
mvn clean package -DskipTests
```

---

## 🤝 Tools Used

| Tool | Version | Purpose |
|------|---------|---------|
| Java | 17 | Application language |
| Spring Boot | 3.2.0 | Backend framework |
| MongoDB | 7.x | Document database |
| Docker | Latest | Containerization |
| Docker Compose | 3.8 | Multi-container orchestration |
| Prometheus | Latest | Metrics collection |
| Grafana | Latest | Dashboard visualization |
| Jenkins | LTS | Continuous deployment |
| GitHub Actions | v4 | Continuous integration |
| Maven | 3.x | Build & dependency management |
| JUnit 5 | 5.x | Unit testing |
| Micrometer | Latest | Metrics instrumentation |
| Three.js | r128 | 3D WebGL rendering |

---

<p align="center">
  Built with ☕ Java + 🍃 Spring Boot + 🐳 Docker + 📊 Prometheus + 📈 Grafana
  <br>
  <strong>CloudPulse</strong> — Intelligent Task Orchestration Platform
</p>
