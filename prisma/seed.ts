import { PrismaClient, Role, Gender, StudentStatus, AttendanceStatus, InvoiceStatus, PaymentMethod, ExamType, SubjectType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding The Smart Modern Public School database...");

  // Clear existing (careful in production)
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.mark.deleteMany();
  await prisma.examSubject.deleteMany();
  await prisma.examClass.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.homeworkSubmission.deleteMany();
  await prisma.homework.deleteMany();
  await prisma.timetableSlot.deleteMany();
  await prisma.classSubject.deleteMany();
  await prisma.studentParent.deleteMany();
  await prisma.studentDocument.deleteMany();
  await prisma.student.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.section.deleteMany();
  await prisma.class.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.feeStructure.deleteMany();
  await prisma.feeCategory.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.event.deleteMany();
  await prisma.academicSession.deleteMany();
  await prisma.schoolSetting.deleteMany();
  await prisma.user.deleteMany();

  // School Settings
  await prisma.schoolSetting.create({
    data: {
      schoolName: "The Smart Modern Public School",
      address: "123 Education Boulevard, Model Town",
      city: "Lahore",
      province: "Punjab",
      phone: "+92-42-1234567",
      email: "info@smartschool.pk",
      website: "https://smartschool.pk",
      registrationNumber: "SMPS-LHR-2015",
      academicYear: "2025-2026",
      currency: "PKR",
      timezone: "Asia/Karachi",
    },
  });

  // Academic Session
  const session = await prisma.academicSession.create({
    data: {
      name: "2025-2026",
      startDate: new Date("2025-04-01"),
      endDate: new Date("2026-03-31"),
      isCurrent: true,
    },
  });

  // Grades
  const grades = [
    { name: "A+", minPercentage: 90, maxPercentage: 100, gpa: 4.0, order: 1 },
    { name: "A", minPercentage: 80, maxPercentage: 89.99, gpa: 3.7, order: 2 },
    { name: "B", minPercentage: 70, maxPercentage: 79.99, gpa: 3.0, order: 3 },
    { name: "C", minPercentage: 60, maxPercentage: 69.99, gpa: 2.3, order: 4 },
    { name: "D", minPercentage: 50, maxPercentage: 59.99, gpa: 1.7, order: 5 },
    { name: "F", minPercentage: 0, maxPercentage: 49.99, gpa: 0, order: 6 },
  ];
  for (const g of grades) {
    await prisma.grade.create({ data: g });
  }

  // Users
  const passwordHash = await bcrypt.hash("admin123", 12);
  const teacherHash = await bcrypt.hash("teacher123", 12);
  const parentHash = await bcrypt.hash("parent123", 12);
  const studentHash = await bcrypt.hash("student123", 12);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@smartschool.pk",
      passwordHash,
      firstName: "School",
      lastName: "Administrator",
      role: Role.SUPER_ADMIN,
      phone: "+92-300-1234567",
    },
  });

  const teacherUser = await prisma.user.create({
    data: {
      email: "teacher@smartschool.pk",
      passwordHash: teacherHash,
      firstName: "Ali",
      lastName: "Khan",
      role: Role.TEACHER,
      phone: "+92-300-2345678",
    },
  });

  const parentUser = await prisma.user.create({
    data: {
      email: "parent@smartschool.pk",
      passwordHash: parentHash,
      firstName: "Ahmed",
      lastName: "Raza",
      role: Role.PARENT,
      phone: "+92-300-3456789",
    },
  });

  const studentUser = await prisma.user.create({
    data: {
      email: "student@smartschool.pk",
      passwordHash: studentHash,
      firstName: "Hassan",
      lastName: "Raza",
      role: Role.STUDENT,
    },
  });

  // Teacher
  const teacher = await prisma.teacher.create({
    data: {
      userId: teacherUser.id,
      employeeId: "TCH-001",
      firstName: "Ali",
      lastName: "Khan",
      gender: Gender.MALE,
      phone: "+92-300-2345678",
      email: "teacher@smartschool.pk",
      qualification: "M.Sc Mathematics, B.Ed",
      experience: 8,
      joiningDate: new Date("2018-08-15"),
      salary: 85000,
      status: "ACTIVE",
    },
  });

  // Create more teachers
  const teacherNames = [
    { first: "Fatima", last: "Siddiqui", sub: "English" },
    { first: "Usman", last: "Malik", sub: "Science" },
    { first: "Ayesha", last: "Noor", sub: "Urdu" },
    { first: "Bilal", last: "Ahmed", sub: "Computer" },
  ];
  for (let i = 0; i < teacherNames.length; i++) {
    const t = teacherNames[i];
    await prisma.teacher.create({
      data: {
        employeeId: `TCH-00${i + 2}`,
        firstName: t.first,
        lastName: t.last,
        gender: i % 2 === 0 ? Gender.FEMALE : Gender.MALE,
        qualification: "Masters + B.Ed",
        experience: 3 + i,
        joiningDate: new Date(2019 + i, 7, 1),
        salary: 60000 + i * 5000,
        status: "ACTIVE",
      },
    });
  }

  // Classes
  const classNames = [
    "Play Group", "Nursery", "KG",
    "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
    "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
  ];
  const classes = [];
  for (let i = 0; i < classNames.length; i++) {
    const cls = await prisma.class.create({
      data: {
        name: classNames[i],
        code: `C${i + 1}`,
        order: i + 1,
      },
    });
    classes.push(cls);

    // Sections A & B
    await prisma.section.create({
      data: {
        name: "A",
        classId: cls.id,
        classTeacherId: i === 5 ? teacher.id : null, // Class 5A has Ali Khan
        capacity: 40,
      },
    });
    await prisma.section.create({
      data: {
        name: "B",
        classId: cls.id,
        capacity: 40,
      },
    });
  }

  // Subjects
  const subjectsData = [
    { name: "English", code: "ENG", type: SubjectType.CORE },
    { name: "Urdu", code: "URD", type: SubjectType.CORE },
    { name: "Mathematics", code: "MATH", type: SubjectType.CORE },
    { name: "Science", code: "SCI", type: SubjectType.CORE },
    { name: "Islamiat", code: "ISL", type: SubjectType.CORE },
    { name: "Pakistan Studies", code: "PST", type: SubjectType.CORE },
    { name: "Computer Science", code: "CS", type: SubjectType.ELECTIVE },
    { name: "Arts", code: "ART", type: SubjectType.OPTIONAL },
  ];
  const subjects = [];
  for (const s of subjectsData) {
    const sub = await prisma.subject.create({ data: s });
    subjects.push(sub);
  }

  // Assign subjects to Class 5
  const class5 = classes[5]; // Class 5
  for (const sub of subjects.slice(0, 6)) {
    await prisma.classSubject.create({
      data: {
        classId: class5.id,
        subjectId: sub.id,
        teacherId: teacher.id,
        totalMarks: 100,
        passingMarks: 40,
      },
    });
  }

  // Parent
  const parent = await prisma.parent.create({
    data: {
      userId: parentUser.id,
      firstName: "Ahmed",
      lastName: "Raza",
      relation: "Father",
      phone: "+92-300-3456789",
      email: "parent@smartschool.pk",
      occupation: "Businessman",
      city: "Lahore",
    },
  });

  // Students
  const firstNames = ["Hassan", "Ayesha", "Omar", "Zainab", "Ibrahim", "Maryam", "Yusuf", "Sara", "Hamza", "Fatima"];
  const lastNames = ["Raza", "Khan", "Ahmed", "Malik", "Siddiqui", "Noor", "Ali", "Hussain", "Shah", "Butt"];
  const sectionA = await prisma.section.findFirst({ where: { classId: class5.id, name: "A" } });

  // Main student linked to parent
  const mainStudent = await prisma.student.create({
    data: {
      userId: studentUser.id,
      admissionNumber: "ADM-2025-001",
      studentId: "SMPS-2025-001",
      firstName: "Hassan",
      lastName: "Raza",
      gender: Gender.MALE,
      dateOfBirth: new Date("2014-05-12"),
      bloodGroup: "B+",
      religion: "Islam",
      nationality: "Pakistani",
      fatherName: "Ahmed Raza",
      motherName: "Sana Ahmed",
      fatherPhone: "+92-300-3456789",
      parentEmail: "parent@smartschool.pk",
      currentAddress: "House 45, Street 7, Model Town, Lahore",
      city: "Lahore",
      province: "Punjab",
      admissionDate: new Date("2025-04-01"),
      academicSessionId: session.id,
      classId: class5.id,
      sectionId: sectionA!.id,
      rollNumber: "01",
      status: StudentStatus.ACTIVE,
    },
  });

  await prisma.studentParent.create({
    data: {
      studentId: mainStudent.id,
      parentId: parent.id,
      isPrimary: true,
    },
  });

  // More students for Class 5
  for (let i = 1; i < 25; i++) {
    const gender = i % 2 === 0 ? Gender.FEMALE : Gender.MALE;
    const student = await prisma.student.create({
      data: {
        admissionNumber: `ADM-2025-${String(i + 1).padStart(3, "0")}`,
        studentId: `SMPS-2025-${String(i + 1).padStart(3, "0")}`,
        firstName: firstNames[i % firstNames.length],
        lastName: lastNames[i % lastNames.length],
        gender,
        dateOfBirth: new Date(2013 + (i % 3), (i % 12), (i % 28) + 1),
        fatherName: `${lastNames[i % lastNames.length]} Father`,
        fatherPhone: `+92-300-${1000000 + i}`,
        city: "Lahore",
        province: "Punjab",
        admissionDate: new Date("2025-04-01"),
        academicSessionId: session.id,
        classId: class5.id,
        sectionId: sectionA!.id,
        rollNumber: String(i + 1).padStart(2, "0"),
        status: StudentStatus.ACTIVE,
      },
    });
  }

  // Students for other classes (sample)
  for (let c = 0; c < 5; c++) {
    const cls = classes[c];
    const sec = await prisma.section.findFirst({ where: { classId: cls.id, name: "A" } });
    for (let i = 0; i < 15; i++) {
      await prisma.student.create({
        data: {
          admissionNumber: `ADM-2025-${cls.code}-${String(i + 1).padStart(2, "0")}`,
          studentId: `SMPS-${cls.code}-${String(i + 1).padStart(3, "0")}`,
          firstName: firstNames[i % firstNames.length],
          lastName: lastNames[(i + c) % lastNames.length],
          gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
          dateOfBirth: new Date(2015 + c, i % 12, (i % 28) + 1),
          fatherName: "Parent Name",
          city: "Lahore",
          province: "Punjab",
          admissionDate: new Date("2025-04-01"),
          academicSessionId: session.id,
          classId: cls.id,
          sectionId: sec!.id,
          rollNumber: String(i + 1).padStart(2, "0"),
          status: StudentStatus.ACTIVE,
        },
      });
    }
  }

  // Fee Categories
  const feeCats = [
    { name: "Tuition Fee", isRecurring: true },
    { name: "Admission Fee", isRecurring: false },
    { name: "Exam Fee", isRecurring: false },
    { name: "Transport Fee", isRecurring: true },
    { name: "Lab Fee", isRecurring: true },
  ];
  for (const fc of feeCats) {
    await prisma.feeCategory.create({ data: fc });
  }

  // Sample attendance for today
  const allStudents = await prisma.student.findMany({ take: 30 });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (const st of allStudents) {
    const statuses: AttendanceStatus[] = ["PRESENT", "PRESENT", "PRESENT", "PRESENT", "ABSENT", "LATE"];
    await prisma.attendance.create({
      data: {
        studentId: st.id,
        sectionId: st.sectionId,
        date: today,
        status: statuses[Math.floor(Math.random() * statuses.length)],
      },
    });
  }

  // Sample notice
  await prisma.notice.create({
    data: {
      title: "Welcome to Academic Year 2025-2026",
      description: "Dear parents and students, we welcome you to the new academic session. Classes will commence from 7th April 2025.",
      targetAudience: "EVERYONE",
      isPublished: true,
      createdById: adminUser.id,
      publishDate: new Date(),
    },
  });

  // Sample events
  await prisma.event.create({
    data: {
      title: "Parent-Teacher Meeting",
      description: "Quarterly PTM for all classes",
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      type: "PARENT_MEETING",
      createdById: adminUser.id,
    },
  });
  await prisma.event.create({
    data: {
      title: "Sports Day",
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      type: "SPORTS_DAY",
      createdById: adminUser.id,
    },
  });

  // Audit
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: "SEED",
      module: "system",
      details: "Database seeded with demo data",
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log("");
  console.log("Demo Accounts:");
  console.log("  Admin:    admin@smartschool.pk / admin123");
  console.log("  Teacher:  teacher@smartschool.pk / teacher123");
  console.log("  Parent:   parent@smartschool.pk / parent123");
  console.log("  Student:  student@smartschool.pk / student123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
