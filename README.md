# AI ATS Resume Builder

A full-stack AI-powered resume builder with ATS (Applicant Tracking System) scoring, job description analysis, and intelligent content optimization.

## Features

- **Multi-Step Resume Builder** — Create professional resumes with a guided 7-step form
- **AI Content Generation** — Generate summaries, enhance bullet points, and categorize skills using OpenAI
- **ATS Scoring** — Score resumes against job descriptions with detailed breakdowns
- **Job Description Analyzer** — Extract skills, keywords, and requirements from job postings
- **Skill Gap Analysis** — Identify missing skills and get recommendations
- **Resume Optimization** — AI-suggested improvements to boost your ATS score
- **Multiple Export Formats** — Download as PDF, DOCX, or plain text
- **Resume Templates** — Choose from 6 professional template styles
- **Live Preview** — See your resume update in real-time as you type
- **Version Control** — Duplicate and iterate on resume versions
- **Dashboard** — Manage all your resumes in one place

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- OpenAI API (GPT-4o-mini)
- JWT Authentication
- PDF generation (pdf-lib), DOCX generation (docx)

### Frontend
- Next.js 14 (App Router)
- React 18 + TypeScript
- TailwindCSS
- Custom ShadCN-style UI components

## Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key

## Setup

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Create `backend/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ats_resume_builder"
JWT_SECRET="your-secure-jwt-secret"
JWT_EXPIRES_IN="7d"
OPENAI_API_KEY="sk-your-openai-api-key"
PORT=5000
NODE_ENV=development
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Setup Database

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Run migrations (creates tables)
npx prisma db push

# (Optional) Open Prisma Studio to inspect data
npx prisma studio
```

### 4. Start Development Servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npx ts-node src/server.ts

# Terminal 2 — Frontend (port 3000)
cd frontend
npm run dev
```

Open http://localhost:3000 in your browser.

## Project Structure

```
ai-ats-resume-builder/
├── backend/
│   ├── prisma/schema.prisma       # Database schema
│   ├── src/
│   │   ├── server.ts              # Entry point
│   │   ├── app.ts                 # Express app config
│   │   ├── controllers/           # Route handlers
│   │   ├── middleware/            # Auth, validation, errors
│   │   ├── routes/               # API route definitions
│   │   ├── services/             # AI, scoring, export services
│   │   └── utils/                # Prisma client, validators
│   └── package.json
├── frontend/
│   ├── app/                      # Next.js pages
│   │   ├── page.tsx              # Home
│   │   ├── dashboard/            # Resume dashboard
│   │   ├── builder/              # New resume builder
│   │   ├── builder/[id]/         # Edit resume
│   │   ├── analyzer/             # Job description analyzer
│   │   ├── score/                # ATS scoring
│   │   └── templates/            # Template gallery
│   ├── components/               # UI components
│   ├── hooks/                    # Auth hook
│   ├── lib/                      # API client, utilities
│   └── types/                    # TypeScript interfaces
└── README.md
```

## API Endpoints

### Auth
- `POST /api/auth/signup` — Register
- `POST /api/auth/login` — Login
- `GET /api/auth/profile` — Get profile

### Resumes
- `POST /api/resumes` — Create resume
- `GET /api/resumes` — List resumes
- `GET /api/resumes/:id` — Get resume
- `PUT /api/resumes/:id` — Update resume
- `DELETE /api/resumes/:id` — Delete resume
- `POST /api/resumes/:id/duplicate` — Duplicate resume

### AI
- `POST /api/ai/generate-summary` — Generate professional summary
- `POST /api/ai/enhance-bullet` — Enhance bullet point
- `POST /api/ai/categorize-skills` — Categorize skills
- `POST /api/ai/score-resume` — Score against job description
- `POST /api/ai/optimize-resume` — Get optimization suggestions
- `POST /api/ai/skill-gap` — Skill gap analysis
- `POST /api/ai/career-suggestions` — Career suggestions

### Export
- `GET /api/export/:id/pdf` — Download PDF
- `GET /api/export/:id/docx` — Download DOCX
- `GET /api/export/:id/text` — Download plain text

### Jobs
- `POST /api/jobs/analyze` — Analyze job description
- `GET /api/jobs` — List saved analyses

## License

MIT
