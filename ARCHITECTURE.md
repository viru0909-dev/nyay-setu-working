# Nyay Setu - Architecture Guide

## Overview
Nyay Setu is a digitalization platform for the Indian Judiciary System. 
This document helps new contributors understand how the project is structured.

## Project Structure

nyay-setu-working/
├── frontend/          # React.js frontend application
├── backend/           # Spring Boot backend services
├── nlp-orchestrator/  # NLP and AI services
├── docs/              # Documentation files
├── assets/            # Images and static files
├── lawgpt-service/    # AI-related legal services
├── signaling-server/  # Real-time communication services
└── infra/scripts/     # Infrastructure and deployment scripts

## Three Main Services

### 1. Frontend (frontend/nyaysetu-frontend)
- Built with React.js and Vite
- User interface for citizens and lawyers
- Communicates with backend services
  
### 2. Backend (backend/nyaysetu-backend)
- Built with Spring Boot (Java)
- Handles all business logic
- REST API endpoints

### 3. NLP Orchestrator (nlp-orchestrator/)
- FastAPI-based service
- Handles AI and NLP processing
- Supports legal assistance features

### Additional Components
- assets/ : README banners and static assets
- docs/ : Project documentation
- .github/ : GitHub workflows and templates
- lawgpt-service/ : AI-related legal services
- signaling-server/ : Real-time communication services 

## Getting Started
For local setup, refer to LOCAL_RUN.md
For contribution guidelines, refer to CONTRIBUTING.md
