import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Search, Filter, Download, Eye, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getStudents(search?: string, classId?: string) {
  const where: any = { deletedAt: null };
  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { admissionNumber: { contains: search } },
      { fatherName: { contains: search } },
    ];
  }
  if (classId) where.classId = classId;

  const [students, total, classes] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        class: true,
        section: true,
      },
      orderBy: [{ class: { order: "asc" } }, { rollNumber: "asc" }],
      take: 50,
    }),
    prisma.student.count({ where }),
    prisma.class.findMany({ orderBy: { order: "asc" } }),
  ]);

  return { students, total, classes };
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; class?: string }>;
}) {
  const params = await searchParams;
  const { students, total, classes } = await getStudents(params.search, params.class);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Students</h1>
          <p className="text-slate-500 text-sm mt-1">{total} students registered</p>
        </div>
        <Link href="/dashboard/students/new" className="btn-primary">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Student
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <form className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              name="search"
              defaultValue={params.search}
              placeholder="Search by name, admission no, father name..."
              className="input-field pl-9"
            />
          </div>
          <select name="class" defaultValue={params.class || ""} className="input-field w-full sm:w-48">
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button type="submit" className="btn-secondary">
            <Filter className="w-4 h-4 mr-1.5" />
            Filter
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Admission No</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Father Name</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Class</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Section</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Gender</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    No students found.{" "}
                    <Link href="/dashboard/students/new" className="text-indigo-600 hover:underline">
                      Add the first student
                    </Link>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {student.admissionNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold">
                          {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-900">
                          {student.firstName} {student.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{student.fatherName || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{student.class?.name || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{student.section?.name || "—"}</td>
                    <td className="px-4 py-3 text-slate-600 capitalize">
                      {student.gender.toLowerCase()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          student.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/students/${student.id}`}
                          className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/dashboard/students/${student.id}/edit`}
                          className="p-1.5 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
