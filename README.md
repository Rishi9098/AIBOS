# AI Board Examination Operating System (AIBOS)

> **AIBOS** is an enterprise-grade digital public infrastructure designed to replace traditional board exams (State Boards, CBSE, ICSE, Universities, Government Recruitment) with an autonomous AI examination, edge proctoring, multi-agent evaluation, and cryptographic credential ecosystem for 10+ million students.

---

## Key Modules Implemented (Milestone 1)

1. **Identity & Access Management (IAM):** Multi-role RBAC authorization (`STUDENT`, `TEACHER`, `SCHOOL_ADMIN`, `BOARD_OFFICIAL`, `SUPER_ADMIN`), OAuth2 / JWT authentication, password hashing with salted `bcrypt`.
2. **Student & School Management:** Institutional mapping, candidate roll number verification, and student profile registry.
3. **Question Bank Engine:** Bloom's Taxonomy tagging, difficulty scoring ($0.0 - 1.0$), model answers, LaTeX equations, vector diagrams, step-wise grading rubrics, and version history.
4. **Secure Exam Terminal:** Next.js + React + TypeScript + TailwindCSS application featuring:
   - Live Countdown Timer
   - Auto-save status feedback
   - Edge Proctoring warning triggers
   - Interactive Question Palette
   - LaTeX Formula Builder (`MathLive`)
   - Vector Diagram Canvas (`Fabric.js`)
5. **Cryptographic Submission Protocol:**
   - SHA-256 Hash Chain Checksum generation
   - ECDSA Digital Signatures
   - Immutable Submission Receipt view

---

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, TailwindCSS, MathLive, Fabric.js, Lucide Icons
- **Backend:** Python 3.11, FastAPI, SQLAlchemy 2, Pydantic v2, PostgreSQL, Redis, MinIO S3
- **Containerization & Dev Tools:** Docker, Docker Compose, Pytest, Uvicorn

---

## Quick Start

### 1. Backend Setup
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt

# Run backend API
PYTHONPATH=backend uvicorn app.main:app --host 0.0.0.0 --port 8000
```
API Documentation available at: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Exam Terminal available at: `http://localhost:3000/exam/demo-exam-1`

### 3. Docker Compose Infrastructure
```bash
docker-compose up -d
```

---

## Testing

```bash
# Run backend pytest suite
PYTHONPATH=backend .venv/bin/pytest backend/tests/

# Run frontend TypeScript check
cd frontend && npx tsc --noEmit
```

---

## License

Enterprise Licensed • Government Digital Public Infrastructure
