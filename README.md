# The Smart Modern Public School — School Management System

A modern, professional, role-based School Management System (SMS / School ERP) built for schools in Pakistan.

**School Name:** The Smart Modern Public School

## Features Implemented (Foundation)

- Complete Prisma schema covering Students, Teachers, Parents, Staff, Classes, Sections, Subjects, Attendance, Timetable, Exams, Marks, Fees, Invoices, Payments, Expenses, Payroll, Homework, Assignments, Notices, Events, Library, Transport, Hostel, Inventory, Admissions, Audit Logs
- Secure authentication with NextAuth (Credentials) + JWT sessions
- Role-based access control (Super Admin, School Admin, Principal, Teacher, Accountant, Receptionist, Parent, Student)
- Professional responsive UI (Sidebar + Header, indigo/blue theme)
- Admin Dashboard with live statistics, quick actions, recent activities, upcoming events
- Students module (list, search, filter by class)
- Login page with demo accounts
- Seed data with realistic Pakistani school records

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes / Server Components
- **Database:** SQLite (easy local) / ready for PostgreSQL
- **ORM:** Prisma
- **Auth:** NextAuth.js
- **Forms & Validation:** React Hook Form + Zod (ready to extend)
- **Charts:** Recharts (ready)
- **Icons:** Lucide React
- **Toasts:** Sonner

## Getting Started

### 1. Install dependencies

```bash
cd school-management
npm install
```

### 2. Setup environment

```bash
cp .env.example .env
# Edit .env if needed
```

### 3. Database

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Accounts

| Role     | Email                     | Password    |
|----------|---------------------------|-------------|
| Admin    | admin@smartschool.pk      | admin123    |
| Teacher  | teacher@smartschool.pk    | teacher123  |
| Parent   | parent@smartschool.pk     | parent123   |
| Student  | student@smartschool.pk    | student123  |

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (dashboard)/           # Protected dashboard routes
│   │   ├── dashboard/         # Main admin dashboard
│   │   ├── students/          # Student management
│   │   └── ...
│   └── api/auth/[...nextauth] # Auth API
├── components/
│   ├── layout/                # Sidebar, Header
│   └── providers/
├── lib/
│   ├── auth.ts                # NextAuth config + RBAC
│   ├── prisma.ts
│   └── utils.ts
└── types/
prisma/
├── schema.prisma              # Full database schema
└── seed.ts                    # Demo data
```

## Extending the System

The database schema already supports all modules requested (Fees, Attendance, Exams, Library, Transport, etc.).

To add a new module:

1. Use the existing models in `prisma/schema.prisma`
2. Create pages under `src/app/(dashboard)/...`
3. Add navigation items in `src/components/layout/Sidebar.tsx`
4. Protect with role checks using `hasPermission()` from `lib/auth.ts`

## Production Notes

- Change `NEXTAUTH_SECRET` to a strong random value
- Switch `DATABASE_URL` to PostgreSQL for production
- Configure file storage (local or S3) for documents
- Add SMTP / SMS providers via environment variables
- Enable HTTPS and proper CORS
- Add rate limiting on auth routes

## License

Private / Educational use.
