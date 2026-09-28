# 🚀 ServiceFlow
### Full-Stack IT Service & Incident Management Platform

<p align="center">

  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-24-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-Backend-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Mongoose-ODM-880000?style=for-the-badge&logo=mongoose&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />

</p>

<p align="center">

  <img src="https://img.shields.io/badge/Vite-Frontend-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Axios-API_Client-5A29E4?style=for-the-badge&logo=axios&logoColor=white" />
  <img src="https://img.shields.io/badge/Recharts-Analytics-22B5BF?style=for-the-badge" />
  <img src="https://img.shields.io/badge/bcrypt-Password_Security-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/REST-API-FF6F00?style=for-the-badge" />

</p>

<p align="center">

  <strong>A practical IT Service Management platform for managing incidents from creation to resolution.</strong>

</p>

---

## 📌 Overview

**ServiceFlow** is a full-stack IT Service Management (ITSM) and Incident Management platform designed to simulate an internal enterprise IT support environment.

The platform allows employees to report incidents, support agents to investigate and resolve them, and administrators to manage assignments, users, workflows, SLAs, notifications, audit history, and operational analytics.

Instead of being a simple CRUD application, ServiceFlow models the **complete lifecycle of an IT incident** with backend-enforced business rules.

```text
Employee
   │
   │ Create Incident
   ▼
┌───────────────┐
│     OPEN      │
└───────┬───────┘
        │
        ▼
┌───────────────────┐
│   IN PROGRESS     │
└─────────┬─────────┘
          │
       ┌──┴───────────────┐
       │                  │
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│   ON HOLD   │    │   RESOLVED  │
└──────┬──────┘    └──────┬──────┘
       │                   │
       └──────►            ▼
             ┌──────────────────┐
             │      CLOSED      │
             └──────────────────┘
