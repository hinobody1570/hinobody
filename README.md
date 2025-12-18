# HiNobody

A full-stack application built with Next.js (frontend) and NestJS (backend), both using TypeScript.

## Project Structure

```
hinobody/
├── frontend/          # Next.js application
├── backend/           # NestJS application
└── package.json       # Root package.json with workspace scripts
```

## Prerequisites

- Node.js 18+ 
- npm or yarn

## Installation

1. Install root dependencies:
```bash
npm install
```

2. Install frontend dependencies:
```bash
cd frontend && npm install
```

3. Install backend dependencies:
```bash
cd backend && npm install
```

## Development

### Run both frontend and backend:
```bash
npm run dev
```

### Run separately:

**Frontend (Next.js):**
```bash
npm run dev:frontend
# or
cd frontend && npm run dev
```
Frontend runs on: http://localhost:3000

**Backend (NestJS):**
```bash
npm run dev:backend
# or
cd backend && npm run start:dev
```
Backend runs on: http://localhost:3001

## Build

Build both applications:
```bash
npm run build
```

Build separately:
```bash
npm run build:frontend
npm run build:backend
```

## Production

Start production servers:
```bash
npm run start:frontend
npm run start:backend
```

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: NestJS 10, TypeScript
- **Package Manager**: npm workspaces

## API Endpoints

- `GET /` - Hello message
- `GET /health` - Health check endpoint

