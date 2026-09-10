import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Users,
  GraduationCap,
  UserCog,
  UsersRound,
  School,
  CalendarCheck,
  CreditCard,
  TrendingUp,
  UserPlus,
  FileText,
  ClipboardList,
  Bell,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

async function getDashboardStats() {
  const [
    totalStudents,
    totalTeachers,
    totalStaff,
    totalParents,
    totalClasses,
    todayAttendance,
    pendingFees,
    monthlyRevenue,
  ] = await Promise.all([
    prisma.student.count({ where: { status: "ACTIVE", deletedAt: null } }),
    prisma.teacher.count({ where: { status: "ACTIVE" } }),
    prisma.staff.count({ where: { status: "ACTIVE" } }),
    prisma.parent.count({ where: { status: "ACTIVE" } }),
    prisma.class.count({ where: { status: "ACTIVE" } }),
    prisma.attendance.count({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
        status: "PRESENT",
      },
    }),
    prisma.invoice.aggregate({
      where: { status: { in: ["UNPAID", "PARTIALLY_PAID", "OVERDUE"] } },
      _sum: { remaining: true },
    }),
    prisma.payment.aggregate({
      where: {
        paymentDate: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { amount: true },
    }),
  ]);

  const recentActivities = await prisma.auditLog.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { firstName: true, lastName: true } } },
  });

  const upcomingEvents = await prisma.event.findMany({
    where: { startDate: { gte: new Date() } },
    take: 5,
    orderBy: { startDate: "asc" },
  });

  return {
    totalStudents,
    totalTeachers,
    totalStaff,
    totalParents,
    totalClasses,
    todayAttendance,
    pendingFees: pendingFees._sum.remaining || 0,
    monthlyRevenue: monthlyRevenue._sum.amount || 0,
    recentActivities,
    upcomingEvents,
  };
}

const statCards = [
  { key: "totalStudents", label: "Total Students", icon: Users, color: "bg-blue-500", href: "/dashboard/students" },
  { key: "totalTeachers", label: "Total Teachers", icon: GraduationCap, color: "bg-indigo-500", href: "/dashboard/teachers" },
  { key: "totalStaff", label: "Total Staff", icon: UserCog, color: "bg-violet-500", href: "/dashboard/staff" },
  { key: "totalParents", label: "Total Parents", icon: UsersRound, color: "bg-purple-500", href: "/dashboard/parents" },
  { key: "totalClasses", label: "Total Classes", icon: School, color: "bg-cyan-500", href: "/dashboard/classes" },
  { key: "todayAttendance", label: "Today's Present", icon: CalendarCheck, color: "bg-emerald-500", href: "/dashboard/attendance" },
  { key: "pendingFees", label: "Pending Fees", icon: CreditCard, color: "bg-amber-500", href: "/dashboard/invoices", isCurrency: true },
  { key: "monthlyRevenue", label: "Monthly Revenue", icon: TrendingUp, color: "bg-green-500", href: "/dashboard/payments", isCurrency: true },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {session?.user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 mt-1">
            Here&apos;s what&apos;s happening at The Smart Modern Public School today.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/students/new" className="btn-primary text-sm">
            <UserPlus className="w-4 h-4 mr-1.5" />
            Add Student
          </Link>
          <Link href="/dashboard/attendance" className="btn-secondary text-sm">
            <ClipboardList className="w-4 h-4 mr-1.5" />
            Mark Attendance
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const value = stats[card.key as keyof typeof stats] as number;
          const Icon = card.icon;
          return (
            <Link
              key={card.key}
              href={card.href}
              className="card p-5 hover:shadow-md transition group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {card.isCurrency ? formatCurrency(value) : value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl ${card.color} text-white group-hover:scale-110 transition`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Charts & Activity row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Add Student", href: "/dashboard/students/new", icon: UserPlus },
              { label: "Add Teacher", href: "/dashboard/teachers/new", icon: GraduationCap },
              { label: "Collect Fee", href: "/dashboard/payments/new", icon: CreditCard },
              { label: "Mark Attendance", href: "/dashboard/attendance", icon: CalendarCheck },
              { label: "Create Notice", href: "/dashboard/notices/new", icon: Bell },
              { label: "Create Exam", href: "/dashboard/exams/new", icon: FileText },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition text-center"
              >
                <action.icon className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-medium text-slate-700">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Recent Activities</h2>
          <div className="space-y-3">
            {stats.recentActivities.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No recent activities</p>
            ) : (
              stats.recentActivities.map((log) => (
                <div key={log.id} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-500 shrink-0" />
                  <div>
                    <p className="text-slate-700">
                      <span className="font-medium">
                        {log.user ? `${log.user.firstName} ${log.user.lastName}` : "System"}
                      </span>{" "}
                      {log.action.toLowerCase()} {log.module}
                    </p>
                    <p className="text-xs text-slate-400">{formatDate(log.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Upcoming Events</h2>
          <div className="space-y-3">
            {stats.upcomingEvents.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No upcoming events</p>
            ) : (
              stats.upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <div className="text-center shrink-0 w-12">
                    <p className="text-xs font-medium text-indigo-600 uppercase">
                      {new Date(event.startDate).toLocaleDateString("en", { month: "short" })}
                    </p>
                    <p className="text-lg font-bold text-slate-900">
                      {new Date(event.startDate).getDate()}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{event.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 capitalize">
                      {event.type.replace(/_/g, " ").toLowerCase()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
