# Agile Mijau - Internship Management System

A full-stack application for managing student internships, built with React, NestJS, and PostgreSQL.

## 🏗️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** - Build tool
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - UI Components
- **React Router** - Navigation
- **Axios** - HTTP Client

### Backend
- **NestJS** - Node.js Framework
- **TypeORM** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password Hashing

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Orchestration

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose

### 1. Clone & Install

```bash
git clone https://github.com/Karloveliki/Agile-Mijau.git
cd Agile-Mijau

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Setup Environment

```bash
cd backend
cp .env.example .env
```

### 3. Start Database

```bash
cd backend

# Start PostgreSQL and pgAdmin
docker compose up -d

# Access pgAdmin at http://localhost:5050
# Email: admin@agile-mijau.com
# Password: admin123
```

### 4. Run Applications

**Backend:**
```bash
cd backend
npm run start:dev
# API at http://localhost:3000
```

**Frontend:**
```bash
cd frontend
npm run dev
# Opens at http://localhost:5173
```

---

## 📁 Project Structure

```
Agile-Mijau/
├── frontend/                 # React Frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   └── ui/          # shadcn/ui components
│   │   ├── pages/           # Page components
│   │   ├── lib/             # Utilities
│   │   └── services/        # API services
│   └── package.json
│
├── backend/                  # NestJS Backend
│   ├── src/
│   │   ├── modules/         # Feature modules
│   │   ├── database/        # Seeds & migrations
│   │   └── common/          # Shared code
│   ├── docker-compose.yml   # Docker services
│   ├── .env.example         # Environment template
│   └── package.json
│
└── README.md
```

---

## 🌱 Database Seeding

To seed the database with test data:

```bash
cd backend
npm run seed
```

### Test Users

#### Admin & Academic Mentor
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@oss.unist.hr | Admin123$ |
| Academic Mentor | mentor@oss.unist.hr | Mentor123$ |

#### Tech Firma d.o.o.
| Role | Email | Password |
|------|-------|----------|
| Employer | employer@techfirma.hr | Employer123$ |
| Company Mentor | mentor@techfirma.hr | MentorTvrtka123$ |

#### Infobip d.o.o.
| Role | Email | Password |
|------|-------|----------|
| Employer | employer@infobip.com | Employer123$ |
| Company Mentor | mentor@infobip.com | MentorTvrtka123$ |

#### Rimac Technology d.o.o.
| Role | Email | Password |
|------|-------|----------|
| Employer | employer@rimac.com | Employer123$ |
| Company Mentor | mentor@rimac.com | MentorTvrtka123$ |

#### Students (password: `Student123$`)
| Email | Name | Major |
|-------|------|-------|
| student1@oss.unist.hr | Ante Antić | IT |
| student2@oss.unist.hr | Marija Marić | IT |
| student3@oss.unist.hr | Ivan Ivanović | Računarstvo |
| student4@oss.unist.hr | Ana Anić | Računarstvo |
| student5@oss.unist.hr | Petra Petrić | IT |

---

## 👨‍💻 Team

- Ivan Lončar
- Miran Relić
- Marin Rančić
- Marin Visković
- Marin Prnić
- Karlo Perković

---

**Built for AVP Course 2025**
