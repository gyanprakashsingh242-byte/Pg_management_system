# 🌿 Living Peace Residencies — Enterprise PG Management Platform

An enterprise-grade, full-stack PG management and automated utility billing platform built with **React** and **Java Spring Boot**. Designed for high-capacity operational workflows across 54 executive residencies (3 floors, 18 rooms each), featuring dynamic electricity billing calculations, automated one-click WhatsApp invoicing, and role-based tracking.

---

## 🚀 Key Features

* **Real-time 54-Room Operations Grid:** Visual tracking of room allocation, occupancy status, and rent clearances across 3 dedicated floors.
* **Dynamic Utility Billing Engine:** Instant delta calculation (`Current Meter - Previous Meter`) with runtime dynamic unit rates (₹/unit) and integrated base rent reconciliation.
* **Automated WhatsApp Invoice Dispatch:** One-click and bulk queue dispatch mechanism generating pre-formatted payment invoices with direct UPI integration.
* **Dual-Verification Sub-Meter Auditing:** Verification workflow designed for sub-meter readings to prevent operational revenue leakage.
* **Monorepo Architecture:** Clean separation of concerns with decoupled React client and Spring Boot REST API services.

---

## 🛠️ Tech Stack

### **Frontend**
* **Framework:** React.js (Vite)
* **Styling:** Tailwind CSS (Glassmorphism & Ambient UI)
* **State Management:** React Hooks (`useState`, `useEffect`, Custom Handlers)
* **HTTP Client:** Axios / Native Fetch

### **Backend**
* **Language & Framework:** Java 25, Spring Boot 3.x
* **Database & ORM:** PostgreSQL, Spring Data JPA (Hibernate)
* **Security & Auth:** Spring Security, JWT (JSON Web Tokens)
* **Architecture:** Controller-Service-Repository Pattern with DTO Validation

---

## 📁 Repository Structure

```text
Pg_management_System/
├── frontend/             # React (Vite) UI Application
│   ├── src/
│   │   ├── components/   # Modular UI components (Stats, Filters, RoomCard, Modals)
│   │   ├── data/         # Mock state generators & configurations
│   │   └── RoomList.jsx  # Main interactive dashboard container
│   └── package.json
└── backend/              # Java Spring Boot REST API Service
    ├── src/main/java/    # Controllers, Services, Repositories, Entities
    ├── src/main/resources/
    │   └── application.properties
    └── pom.xml
