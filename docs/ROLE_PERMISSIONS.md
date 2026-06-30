# Nyay Setu - Role Permission Matrix

This document provides a breakdown of the user roles within Nyay Setu and details which modules each role can access.

## Permission Matrix Table

| Module / Feature | Litigant | Lawyer | Judge | Police | Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Case Filing** | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Case Diary** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Hearing Details** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Document Upload** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **FIR Handling** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Admin Dashboard** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **AI Legal Assistant** | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Role Definitions & Permissions Overview

### 1. Litigant
* **Access Level:** Basic / End-user
* Can file new cases, track case history in the diary, view upcoming hearing details, and upload personal case documents.
* Has access to the AI Legal Assistant for basic guidance.

### 2. Lawyer
* **Access Level:** Professional User
* Can manage and file cases on behalf of clients, view detailed case history, and access hearing schedules.

### 3. Judge
* **Access Level:** Judicial / Reviewer
* Cannot file cases or handle FIRs directly. 
* Has full access to view case files, hearing records, and uploaded evidence to make rulings.

### 4. Police
* **Access Level:** Law Enforcement
* Primarily responsible for **FIR Handling** and updating relevant investigation documents.
* Can view hearing schedules and general case diaries.

### 5. Admin
* **Access Level:** Full Access
* Has overarching control across all modules, including the **Admin Dashboard** for system maintenance, user management, and auditing permissions.

---

> *Note: Fine-grained permissions and API-level restrictions may depend heavily on specific backend implementation details.*