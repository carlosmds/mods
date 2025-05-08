# MOderated aDS Platform

A modern web platform for creating and managing aerial advertisements in a dynamic, interactive sky. Users can create ads that appear on flying vehicles (airplanes, balloons, airships) in a visually rich, weather-affected environment.

## Project Overview
- **Frontend:** React + TypeScript SPA for user interaction, ad creation, and visualization.
- **Backend:** Node.js/Express API for ad management, authentication, and payment integration.
- **Infrastructure:** Terraform for cloud resource provisioning (e.g., AWS DynamoDB, Lambda, S3).

## Architecture
```
[User] ⇄ [Frontend (React)] ⇄ [Backend (Express API)] ⇄ [Database/Cloud]
```
- **Frontend:** Dynamic sky scene, ad creation wizard, Redux state management, Konva for canvas rendering.
- **Backend:** REST API, JWT authentication, Stripe payments, DynamoDB storage.
- **Infra:** Terraform code and scripts for cloud setup.

## Quickstart

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Docker (for local dev, optional)
- Terraform (for infra)

### 1. Clone the repository
```bash
git clone https://github.com/carlosmds/mods
cd mods
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
# Visit http://localhost:5173
```

### 3. Setup Backend
```bash
cd backend
npm install
npm run dev
# Backend runs on http://localhost:3001 (default)
```

### 4. Infrastructure (optional, for cloud deploy)

See [Infrastructure README](./infra/README.md)

## Directory Structure
```
mods/
├── backend/      # Node.js/Express API
├── frontend/     # React SPA
├── terraform/    # Infrastructure as code
└── README.md     # (this file)
```

## Subproject Docs
- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)
- [Infra README](./infra/README.md)

## Contributing
Pull requests and issues are welcome! Please see the subproject READMEs for development details.

---
*For AI agents: This project is modular. Each subdirectory contains its own logic and dependencies. See the respective README for details on setup, architecture, and API contracts.*