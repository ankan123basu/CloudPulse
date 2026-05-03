<p align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.2.0-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/GitHub%20Actions-CI-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" />
  <img src="https://img.shields.io/badge/Jenkins-CD-D24939?style=for-the-badge&logo=jenkins&logoColor=white" />
  <img src="https://img.shields.io/badge/Prometheus-Monitoring-E6522C?style=for-the-badge&logo=prometheus&logoColor=white" />
  <img src="https://img.shields.io/badge/Grafana-Dashboard-F46800?style=for-the-badge&logo=grafana&logoColor=white" />
  <img src="https://img.shields.io/badge/JUnit%205-Testing-25A162?style=for-the-badge&logo=junit5&logoColor=white" />
  <img src="https://img.shields.io/badge/Maven-Build-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white" />
</p>

<h1 align="center">☁️ CloudPulse</h1>
<h3 align="center">Automated Full-Stack DevOps Pipeline with Live Observability</h3>

<p align="center">
  <i>A complete CI/CD pipeline using Docker, Maven, GitHub Actions, Jenkins, Prometheus & Grafana with JUnit Testing — Everything runs in Docker.</i>
</p>

<p align="center">
  <b>Submitted in partial fulfillment of INT332 — DevOps Engineering</b>
</p>

---

## 📋 Table of Contents

- [Abstract](#-abstract)
- [Architecture](#-architecture)
- [Tools & Technologies](#-tools--technologies)
- [Project Structure](#-project-structure)
- [Application Endpoints](#-application-endpoints)
- [CI/CD Pipeline Flow](#-cicd-pipeline-flow)
- [Monitoring & Observability](#-monitoring--observability)
- [Automated Testing](#-automated-testing)
- [Setup & Commands](#-setup--commands)
- [Service URLs](#-service-urls)
- [Screenshots](#-screenshots)
- [Scope & Future Work](#-scope--future-work)
- [Key Viva Q&A](#-key-viva-qa)

---

## 📖 Abstract

**CloudPulse** is a production-grade DevOps project that demonstrates the complete software delivery lifecycle — from writing code to automated deployment and real-time monitoring. The project builds a **Java Spring Boot REST API** (a Student Record Manager) and surrounds it with a fully automated CI/CD pipeline using industry-standard tools.

Every tool in this pipeline runs as a **Docker container** — no manual software installation is required beyond Docker Desktop itself. The pipeline is triggered automatically on every `git push`, runs unit tests, builds a Docker image, pushes it to Docker Hub, and monitors the running application with live JVM metrics.

> **Why is the application simple?** The application is intentionally minimal because the focus of this project is the **DevOps pipeline layer**, not business logic. In a real company, you swap the application — the pipeline stays identical. That's the entire point of DevOps.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DEVELOPER WORKSTATION                     │
│                                                                  │
│  git push ──► GitHub Repository (ankan123basu/CloudPulse)        │
│                        │                                         │
│                        ▼                                         │
│  ┌──────────────────────────────────┐                            │
│  │      GITHUB ACTIONS (CI)         │                            │
│  │  ┌────────────┐  ┌────────────┐  │                            │
│  │  │ Build &    │  │ Docker     │  │                            │
│  │  │ Test       │──│ Build &    │  │                            │
│  │  │ (Maven +   │  │ Push       │  │                            │
│  │  │ JUnit 5)   │  │ (Hub)      │  │                            │
│  │  └────────────┘  └────────────┘  │                            │
│  └──────────────────────────────────┘                            │
│                        │                                         │
│                        ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │              DOCKER COMPOSE (4 Containers)                │    │
│  │                                                           │    │
│  │  ┌─────────────┐  ┌──────────┐  ┌────────────────────┐   │    │
│  │  │ CloudPulse  │  │Prometheus│  │     Grafana        │   │    │
│  │  │ Spring Boot │◄─│ Scrapes  │──│  Live Dashboard    │   │    │
│  │  │ App :8081   │  │ :9090    │  │  :3000             │   │    │
│  │  └─────────────┘  └──────────┘  └────────────────────┘   │    │
│  │  ┌─────────────┐                                          │    │
│  │  │  Jenkins    │  (Self-hosted CD — ready for webhook)    │    │
│  │  │  :8090      │                                          │    │
│  │  └─────────────┘                                          │    │
│  └──────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tools & Technologies

| Category | Tool | Version | Purpose |
|----------|------|---------|---------|
| **Language** | Java | 17 | Application runtime |
| **Framework** | Spring Boot | 3.2.0 | REST API framework |
| **Build Tool** | Apache Maven | 3.9.x | Dependency management & build automation |
| **Testing** | JUnit 5 + MockMvc | 5.10.1 | Unit testing & HTTP endpoint validation |
| **Containerization** | Docker | Latest | Application packaging & isolation |
| **Orchestration** | Docker Compose | v2 | Multi-container management |
| **CI (Cloud)** | GitHub Actions | v4 | Automated build, test & image push |
| **CD (Self-hosted)** | Jenkins | LTS | Continuous deployment pipeline |
| **Metrics Collection** | Prometheus | Latest | Time-series metric scraping (every 15s) |
| **Visualization** | Grafana | Latest | Real-time dashboards with 20+ panels |
| **Metrics Library** | Micrometer | 1.12.x | JVM metrics instrumentation |
| **Actuator** | Spring Boot Actuator | 3.2.0 | Health checks & metrics endpoints |
| **Registry** | Docker Hub | - | Container image registry |
| **VCS** | Git + GitHub | - | Version control & collaboration |

---

## 📁 Project Structure

```
CloudPulse/
├── .github/
│   └── workflows/
│       └── ci.yml                          ← GitHub Actions CI pipeline (2 jobs)
├── src/
│   ├── main/
│   │   ├── java/com/cloudpulse/
│   │   │   ├── CloudPulseApplication.java  ← @SpringBootApplication entry point
│   │   │   ├── Student.java               ← POJO model (id, name, course)
│   │   │   └── StudentController.java     ← REST controller (GET, POST endpoints)
│   │   └── resources/
│   │       └── application.properties      ← Actuator + Prometheus config
│   └── test/
│       └── java/com/cloudpulse/
│           └── StudentControllerTest.java  ← 3 JUnit 5 tests with MockMvc
├── grafana/
│   ├── dashboards/
│   │   ├── jvm-micrometer.json            ← Standard JVM dashboard (ID: 4701)
│   │   └── cloudpulse-custom.json         ← Custom 20+ panel dashboard
│   └── provisioning/
│       ├── dashboards/
│       │   └── dashboard.yml              ← Auto-load dashboards on startup
│       └── datasources/
│           └── datasource.yml             ← Auto-configure Prometheus source
├── landing/
│   ├── index.html                         ← 3D landing page (Three.js)
│   ├── styles.css                         ← Glassmorphism + animations
│   └── script.js                          ← Three.js starfield + parallax
├── .dockerignore                          ← Docker build exclusions
├── .gitignore                             ← Git exclusions
├── Dockerfile                             ← Multi-stage Docker build
├── Jenkinsfile                            ← Jenkins CD pipeline definition
├── README.md                              ← This file
├── docker-compose.yml                     ← 4-service orchestration
├── pom.xml                                ← Maven build configuration
└── prometheus.yml                         ← Prometheus scrape config
```

---

## 🌐 Application Endpoints

### REST API (Student Record Manager)

| Method | Endpoint | Description | Example Response |
|--------|----------|-------------|-----------------|
| `GET` | `/students` | Get all students | `[{"id":1,"name":"Ankan","course":"CSE"}, ...]` |
| `GET` | `/students/{id}` | Get student by ID | `{"id":1,"name":"Ankan","course":"CSE"}` |
| `POST` | `/students` | Add new student | Returns added student JSON |

### Actuator Endpoints (Monitoring)

| Endpoint | Description |
|----------|-------------|
| `/actuator/health` | Application health status (UP/DOWN) |
| `/actuator/prometheus` | Raw Prometheus metrics (JVM, HTTP, system) |
| `/actuator/metrics` | List of all available metric names |
| `/actuator/info` | Application info |

---

## 🔄 CI/CD Pipeline Flow

### GitHub Actions — Continuous Integration (`.github/workflows/ci.yml`)

The CI pipeline triggers **automatically on every `git push` to `main`** and runs 2 jobs:

```
Job 1: build-and-test
  ├── Checkout code
  ├── Setup JDK 17
  ├── Run: mvn clean test        ← Executes 3 JUnit 5 tests
  └── Run: mvn package           ← Builds cloudpulse-1.0.0.jar

Job 2: docker-build-push (runs only if Job 1 passes)
  ├── Checkout code
  ├── Login to Docker Hub        ← Uses DOCKER_USERNAME & DOCKER_PASSWORD secrets
  ├── Run: docker build           ← Multi-stage Dockerfile
  └── Run: docker push            ← Pushes to ankan0210/cloudpulse:latest
```

### Jenkins — Continuous Deployment (`Jenkinsfile`)

Jenkins is configured for self-hosted CD with a 4-stage pipeline:

```
Stage 1: Checkout       ← Pulls from GitHub (ankan123basu/CloudPulse)
Stage 2: Build          ← mvn clean package -DskipTests
Stage 3: Docker Build   ← docker build -t ankan0210/cloudpulse
Stage 4: Deploy         ← docker push + docker run
```

### Dockerfile — Multi-Stage Build

```dockerfile
# Stage 1: Build with Maven (full JDK + dependencies)
FROM maven:3.9.5-eclipse-temurin-17 AS build
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run with minimal JRE (lightweight, secure)
FROM eclipse-temurin:17-jre-alpine
COPY --from=build /app/target/cloudpulse-1.0.0.jar app.jar
HEALTHCHECK CMD curl -f http://localhost:8080/actuator/health
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Why multi-stage?** The build stage uses ~800MB (Maven + JDK). The runtime stage uses ~200MB (JRE only). This reduces attack surface and image size by 75%.

---

## 📊 Monitoring & Observability

### How It Works

```
Spring Boot App                  Prometheus                    Grafana
    │                                │                            │
    │  /actuator/prometheus          │                            │
    │  (exposes 100+ JVM metrics)    │                            │
    │◄───────────────────────────────│  scrapes every 15 seconds  │
    │                                │                            │
    │                                │  stores time-series data   │
    │                                │────────────────────────────►│
    │                                │                            │  renders 20+ panels
    │                                │                            │  in real-time
```

### Prometheus Configuration (`prometheus.yml`)

```yaml
global:
  scrape_interval: 15s              # Scrape metrics every 15 seconds

scrape_configs:
  - job_name: 'cloudpulse-app'
    metrics_path: '/actuator/prometheus'
    honor_labels: true
    static_configs:
      - targets: ['app:8080']       # Docker internal DNS
```

### Grafana Dashboards

**Two dashboards are auto-provisioned on startup:**

1. **JVM (Micrometer)** — Standard dashboard (ID: 4701) with JVM internals
2. **CloudPulse — Live DevOps Dashboard** — Custom dashboard with 20+ panels:
   - 🟢 Application Status (ONLINE/DOWN indicator)
   - ⏱️ Uptime counter with color thresholds
   - 🧠 Heap Memory gauge (green→yellow→red)
   - ⚡ CPU Usage gauge with continuous color
   - 💾 Disk Usage gauge
   - 🧵 Thread bar gauges & donut chart
   - 📈 Real-time heap memory trends (smooth gradient lines)
   - 📊 CPU utilization with threshold zones
   - 🌐 HTTP endpoint performance tracking
   - 🗑️ Garbage collection activity bars
   - 📦 Class loading trends
   - 📡 Tomcat session monitoring

### Key Metrics Tracked

| Metric | Type | Description |
|--------|------|-------------|
| `jvm_memory_used_bytes` | Gauge | Current heap/non-heap memory usage |
| `jvm_memory_max_bytes` | Gauge | Maximum memory pool size |
| `process_cpu_usage` | Gauge | JVM process CPU utilization (0-1) |
| `system_cpu_usage` | Gauge | Total system CPU utilization |
| `jvm_threads_live_threads` | Gauge | Current live thread count |
| `jvm_threads_states_threads` | Gauge | Threads by state (runnable, waiting, etc.) |
| `http_server_requests_seconds` | Summary | HTTP request count, duration, errors |
| `jvm_gc_pause_seconds` | Summary | GC pause time and frequency |
| `disk_free_bytes` | Gauge | Available disk space |
| `process_uptime_seconds` | Gauge | Application uptime in seconds |
| `jvm_classes_loaded_classes` | Gauge | Number of loaded Java classes |

---

## 🧪 Automated Testing

### JUnit 5 Test Suite (`StudentControllerTest.java`)

3 tests run automatically in GitHub Actions on every push:

```java
@Test void shouldReturnStudentList()
// Verifies GET /students returns HTTP 200 and valid JSON array

@Test void shouldReturnJsonContentType()
// Verifies response Content-Type is application/json

@Test void healthEndpointShouldReturn200()
// Verifies GET /actuator/health returns HTTP 200 (app is alive)
```

### Test Execution

Tests are executed in two places:
1. **GitHub Actions** — `mvn clean test` in the `build-and-test` job
2. **Docker Build** — `mvn clean package` compiles and validates code

```
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

## ⚙️ Setup & Commands

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git installed

### Step 1 — Clone the Repository

```bash
git clone https://github.com/ankan123basu/CloudPulse.git
cd CloudPulse
```

### Step 2 — Start All Services (One Command)

```bash
docker-compose up -d
```

This single command:
- Builds the Spring Boot app using the multi-stage Dockerfile
- Downloads and starts Prometheus, Grafana, and Jenkins containers
- Creates a shared Docker bridge network
- Auto-provisions Grafana data sources and dashboards

### Step 3 — Verify Everything is Running

```bash
docker ps
```

Expected output:
```
CONTAINER ID   IMAGE              STATUS                    PORTS
xxxxxxxxxxxx   cloudpulse-app     Up X minutes (healthy)    0.0.0.0:8081->8080/tcp
xxxxxxxxxxxx   prom/prometheus    Up X minutes              0.0.0.0:9090->9090/tcp
xxxxxxxxxxxx   grafana/grafana    Up X minutes              0.0.0.0:3000->3000/tcp
xxxxxxxxxxxx   jenkins/jenkins    Up X minutes              0.0.0.0:8090->8080/tcp
```

### Step 4 — Test the API

```bash
curl http://localhost:8081/students
curl http://localhost:8081/actuator/health
curl http://localhost:8081/actuator/prometheus
```

### Step 5 — View Grafana Dashboard

Open http://localhost:3000 → Login: `admin` / `admin` → Navigate to "CloudPulse — Live DevOps Dashboard"

### Useful Docker Commands

| Command | Description |
|---------|-------------|
| `docker-compose up -d` | Start all 4 containers |
| `docker-compose down` | Stop and remove all containers |
| `docker-compose up -d --build` | Rebuild app and restart |
| `docker ps` | List running containers |
| `docker logs cloudpulse-app` | View app logs |
| `docker logs cloudpulse-prometheus` | View Prometheus logs |
| `docker restart cloudpulse-grafana` | Restart Grafana |
| `docker exec cloudpulse-jenkins cat /var/jenkins_home/secrets/initialAdminPassword` | Get Jenkins initial password |

---

## 🔗 Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| **Spring Boot API** | http://localhost:8081/students | — |
| **Health Check** | http://localhost:8081/actuator/health | — |
| **Prometheus Metrics** | http://localhost:8081/actuator/prometheus | — |
| **Prometheus UI** | http://localhost:9090 | — |
| **Prometheus Targets** | http://localhost:9090/targets | — |
| **Grafana Dashboard** | http://localhost:3000 | admin / admin |
| **Jenkins** | http://localhost:8090 | (initial setup required) |
| **Landing Page** | Open `landing/index.html` in browser | — |

---

## 📸 Screenshots

### 1. GitHub Actions — CI Pipeline (Green ✅)
> GitHub automatically runs `mvn clean test` (3 JUnit tests) and `docker build & push` on every commit.

![GitHub Actions](screenshots/github-actions.png)

### 2. Docker Containers — All Running
> 4 containers orchestrated via Docker Compose on a shared bridge network.

![Docker PS](screenshots/docker-ps.png)

### 3. REST API Response
> GET /students returns JSON array of student records.

![API Response](screenshots/api-response.png)

### 4. Prometheus Targets — Scraping Active
> Prometheus scrapes JVM metrics from the Spring Boot app every 15 seconds.

![Prometheus Targets](screenshots/prometheus-targets.png)

### 5. Grafana — Live DevOps Dashboard
> Custom 20+ panel dashboard showing real-time JVM metrics with gauges, graphs, and charts.

![Grafana Dashboard](screenshots/grafana-dashboard.png)

### 6. Grafana — JVM Micrometer Dashboard
> Industry-standard JVM monitoring dashboard (ID: 4701) with heap, CPU, threads, and GC.

![JVM Dashboard](screenshots/jvm-dashboard.png)

### 7. Landing Page — 3D Interactive
> Three.js powered landing page with starfield, glassmorphism, and parallax effects.

![Landing Page](screenshots/landing-page.png)

---

## 🔮 Scope & Future Work

### Current Scope
- ✅ REST API with CRUD operations (GET all, GET by ID, POST)
- ✅ Automated unit testing with JUnit 5 and MockMvc
- ✅ Multi-stage Docker containerization with health checks
- ✅ CI pipeline via GitHub Actions (build → test → docker push)
- ✅ CD pipeline ready via Jenkins (Jenkinsfile configured)
- ✅ Real-time monitoring with Prometheus (15s scrape interval)
- ✅ Live visualization with Grafana (20+ panels, auto-provisioned)
- ✅ Docker Compose orchestration (4 services, 1 command)
- ✅ 3D interactive landing page (Three.js + glassmorphism)

### Future Enhancements
- 🔄 **Database Integration** — Replace in-memory storage with PostgreSQL/MySQL
- 🔐 **Security** — Add Spring Security with JWT authentication
- 📧 **Alerting** — Configure Prometheus AlertManager for email/Slack notifications
- 🔀 **Blue-Green Deployment** — Zero-downtime deployment with Docker Swarm/K8s
- 📝 **API Documentation** — Add Swagger/OpenAPI for auto-generated docs
- 🧪 **Integration Tests** — Add end-to-end tests with Testcontainers
- 📊 **Custom Metrics** — Track business metrics (students created, API errors)
- 🌍 **Cloud Deployment** — Deploy to AWS ECS / Google Cloud Run
- 🔁 **GitOps** — Implement ArgoCD for declarative deployment

---

## 💡 Key Viva Q&A

**Q1: Why is the application so simple?**
> The application is intentionally minimal. DevOps is about the pipeline, not business logic. In production, you swap the app — the pipeline stays identical.

**Q2: What happens when you `git push`?**
> GitHub Actions triggers automatically → runs 3 JUnit tests → builds JAR with Maven → creates Docker image → pushes to Docker Hub. Zero manual intervention.

**Q3: Why use both GitHub Actions and Jenkins?**
> GitHub Actions handles cloud-based CI (test + build + push). Jenkins handles self-hosted CD (deploy). Companies use one or both depending on infrastructure needs.

**Q4: Why multi-stage Docker build?**
> Stage 1 uses Maven (~800MB) to build. Stage 2 uses JRE Alpine (~200MB) to run. This reduces the final image size by 75% and minimizes attack surface.

**Q5: How does monitoring work?**
> Spring Boot Actuator exposes 100+ JVM metrics at `/actuator/prometheus`. Prometheus scrapes this every 15 seconds. Grafana queries Prometheus to render real-time dashboards.

**Q6: What does `docker-compose up -d` do?**
> Starts 4 containers (App, Prometheus, Grafana, Jenkins) on a shared Docker network in detached mode. Grafana auto-provisions its data source and dashboards via mounted YAML files.

**Q7: Why Docker Compose instead of individual `docker run`?**
> Compose manages multi-container apps as a single unit — networking, volumes, dependencies, and startup order are all defined in one `docker-compose.yml` file.

**Q8: What metrics are being tracked?**
> JVM heap/non-heap memory, CPU usage, live threads, HTTP request rate/latency, garbage collection, disk usage, class loading — all via Micrometer + Spring Boot Actuator.

**Q9: Are the Grafana graphs showing real data?**
> Yes, 100% real. Every metric comes from the live running Spring Boot JVM. Hit the API endpoints and watch the HTTP graphs spike in real-time.

**Q10: What is the role of Prometheus vs Grafana?**
> Prometheus is the data engine — it collects and stores time-series metrics. Grafana is the visualization layer — it reads from Prometheus and renders beautiful dashboards. You need both.

---

## 👤 Author

**Ankan Basu**
- GitHub: [@ankan123basu](https://github.com/ankan123basu)
- Docker Hub: [ankan0210](https://hub.docker.com/u/ankan0210)

---

<p align="center">
  <b>Built with ❤️ for INT332 — DevOps Engineering</b>
</p>
