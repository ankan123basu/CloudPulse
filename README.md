# 🚀 CloudPulse — Automated Full-Stack DevOps Pipeline with Live Observability

> **INT332 — DevOps Engineering Project**  
> A complete CI/CD pipeline using Docker, Maven, GitHub Actions, Jenkins, Prometheus & Grafana with JUnit Testing — Everything Runs in Docker.

---

## 📋 Project Summary

| Component | Technology |
|-----------|-----------|
| Application | Student Record Manager (Java Spring Boot REST API) |
| Build Tool | Apache Maven |
| Version Control | GitHub |
| CI Tool | GitHub Actions |
| CD Tool | Jenkins (Docker container) |
| Containerization | Docker + Docker Compose |
| Monitoring | Prometheus + Grafana (Dashboard ID 4701) |
| Testing | JUnit 5 + Spring Boot Test (3 automated tests) |
| **Install Required** | **Docker Desktop ONLY** |

---

## 🏗️ Architecture

```
Developer → git push → GitHub → GitHub Actions (Build & Test)
                                       ↓
                              Docker Hub (Image Push)
                                       ↓
                              Jenkins (Pull & Deploy)
                                       ↓
                              Docker Container (App Running)
                                       ↓
                              Prometheus → Grafana (Live Metrics)
```

### Services (docker-compose.yml)

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| `cloudpulse-app` | Built from Dockerfile | `8080` | Spring Boot REST API |
| `cloudpulse-jenkins` | `jenkins/jenkins:lts` | `8090` | CD Pipeline Server |
| `cloudpulse-prometheus` | `prom/prometheus` | `9090` | Metrics Collector |
| `cloudpulse-grafana` | `grafana/grafana` | `3000` | Dashboard Visualization |

---

## 🚀 Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Git](https://git-scm.com/) installed

### 1. Clone the Repository
```bash
git clone https://github.com/ankan123basu/cloudpulse-devops.git
cd cloudpulse-devops
```

### 2. Start All Services
```bash
docker-compose up -d
```

### 3. Verify Everything is Running
```bash
docker ps
```

### 4. Test the API
```bash
# Get all students
curl http://localhost:8080/students

# Health check
curl http://localhost:8080/actuator/health

# Prometheus metrics
curl http://localhost:8080/actuator/prometheus
```

---

## 🔗 Service URLs

| Service | URL | Login |
|---------|-----|-------|
| Spring Boot App | http://localhost:8080 | — |
| Jenkins | http://localhost:8090 | admin / (initialAdminPassword) |
| Prometheus | http://localhost:9090 | — |
| Grafana | http://localhost:3000 | admin / admin |

### Jenkins Initial Password
```bash
docker exec cloudpulse-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

---

## 🧪 Testing

Three JUnit 5 unit tests run automatically in the CI pipeline:

| Test | What it Verifies | Expected |
|------|-----------------|----------|
| `getAllStudents_shouldReturn200` | GET /students returns HTTP 200 | ✅ PASS |
| `getAllStudents_shouldReturnList` | Response is JSON array | ✅ PASS |
| `healthEndpoint_shouldBeUp` | Actuator health is UP | ✅ PASS |

Run tests locally:
```bash
mvn test
```

---

## 📊 Grafana Dashboard Setup

1. Open http://localhost:3000 (login: `admin` / `admin`)
2. Go to **Configuration → Data Sources → Add Prometheus**
3. Set URL: `http://prometheus:9090` → Save & Test
4. Click **+ → Import → Dashboard ID: 4701 → Load**
5. Select Prometheus data source → Import

---

## 🛑 Stop Everything

```bash
docker-compose down
```

---

## 📁 Project Structure

```
cloudpulse-devops/
├── src/
│   ├── main/
│   │   ├── java/com/cloudpulse/
│   │   │   ├── CloudPulseApplication.java
│   │   │   ├── Student.java
│   │   │   └── StudentController.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       └── java/com/cloudpulse/
│           └── StudentControllerTest.java
├── landing/
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── .github/workflows/
│   └── ci.yml
├── pom.xml
├── Dockerfile
├── docker-compose.yml
├── prometheus.yml
├── Jenkinsfile
└── README.md
```

---

## 📄 License

This project was built for **INT332 — DevOps Engineering** coursework.
