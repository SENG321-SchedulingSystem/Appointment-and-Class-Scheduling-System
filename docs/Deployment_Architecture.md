# C4 Deployment Architecture (Diagram 4)

## 1. Overview
This document defines the **C4 Level 4 (Deployment) Architecture** for the **Appointment and Class Scheduling System**. It maps the system's software containers (React Frontend, Node.js/Express REST API, and Firebase Firestore) to physical/cloud execution environments, outlining **Production** and **Staging** isolation, network protocols, and CI/CD automation.

## 2. Deployment Topology Diagram

```mermaid
flowchart TB
    subgraph Client_Layer["Client Devices (End Users)"]
        Browser["Web Browser<br/>[React SPA - Admin / Instructor / Student]"]
    end

    subgraph DevOps_Layer["CI/CD & Source Control (GitHub)"]
        Repo["GitHub Repository<br/>[Git-Flow: main & develop]"]
        Actions["GitHub Actions CI/CD<br/>[OpenAPI Lint, Docs & YAML Validation]"]
        Repo --> Actions
    end

    subgraph Prod_Env["Production Environment (main branch)"]
        subgraph Prod_Edge["Frontend Hosting (Vercel / Firebase Hosting)"]
            Prod_FE["Static Assets & Global CDN<br/>[HTTPS / TLS 1.3]"]
        end

        subgraph Prod_Compute["Backend Compute (Render / Google Cloud Run)"]
            Prod_API["Node.js / Express REST API<br/>[Stateless Container, JWT Middleware]"]
        end

        subgraph Prod_Data["Managed Cloud Services (Google Firebase - Prod)"]
            Prod_Auth["Firebase Authentication<br/>[Identity & Custom Role Claims]"]
            Prod_DB[("Cloud Firestore - Prod<br/>[NoSQL DB - ACID Transactions]")]
        end

        Prod_FE -->|"HTTPS / REST JSON<br/>Bearer JWT"| Prod_API
        Prod_API -->|"Verify ID Token"| Prod_Auth
        Prod_API -->|"Firebase Admin SDK (gRPC/TLS)<br/>Transactional Locks"| Prod_DB
    end

    subgraph Stage_Env["Staging / Test Environment (develop branch)"]
        Stage_FE["Preview Frontend<br/>[Vercel Preview Deployment]"]
        Stage_API["Staging Express API / Prism Mock<br/>[Contract & Integration Testing]"]
        Stage_DB[("Firebase Staging Project<br/>[Isolated Test Auth & Firestore]")]

        Stage_FE -->|"HTTPS / REST JSON"| Stage_API
        Stage_API -->|"Isolated Test Credentials"| Stage_DB
    end

    Browser -->|"HTTPS (TLS 1.3)"| Prod_FE
    Browser -.->|"QA / UAT Verification"| Stage_FE
    Actions -->|"Release Pipeline (main)"| Prod_FE
    Actions -->|"Release Pipeline (main)"| Prod_API
    Actions -.->|"Auto-Deploy on Merge (develop)"| Stage_FE
    Actions -.->|"Auto-Deploy on Merge (develop)"| Stage_API