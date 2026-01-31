import { PrismaClient } from '.prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
  console.log('Starting seed...');

  const hashedPassword = await bcrypt.hash('Admin@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@vu.edu' },
    update: {},
    create: {
      email: 'admin@vu.edu',
      name: 'System Administrator',
      hashedPassword,
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  console.log('Created admin user:', admin.email);

  const staff = await prisma.user.upsert({
    where: { email: 'librarian@vu.edu' },
    update: {},
    create: {
      email: 'librarian@vu.edu',
      name: 'Library Staff',
      hashedPassword,
      role: 'STAFF',
      emailVerified: true,
    },
  });

  console.log('Created staff user:', staff.email);

  const student = await prisma.user.upsert({
    where: { email: 'student@vu.edu' },
    update: {},
    create: {
      email: 'student@vu.edu',
      name: 'Test Student',
      hashedPassword,
      role: 'STUDENT',
      emailVerified: true,
    },
  });

  console.log('Created student user:', student.email);

  const courses = [
    { code: 'CS101', name: 'Introduction to Computer Science', department: 'Computer Science' },
    { code: 'CS201', name: 'Data Structures and Algorithms', department: 'Computer Science' },
    { code: 'CS301', name: 'Database Systems', department: 'Computer Science' },
    { code: 'MATH101', name: 'Calculus I', department: 'Mathematics' },
    { code: 'MATH201', name: 'Linear Algebra', department: 'Mathematics' },
    { code: 'ENG101', name: 'Academic Writing', department: 'English' },
    { code: 'BUS101', name: 'Introduction to Business', department: 'Business Administration' },
    { code: 'PHY101', name: 'Physics I', department: 'Physics' },
  ];

  for (const course of courses) {
    await prisma.course.upsert({
      where: { code: course.code },
      update: {},
      create: course,
    });
  }

  console.log('Created courses:', courses.length);

  const resources = [
    {
      title: 'Introduction to Algorithms',
      authors: ['Thomas H. Cormen', 'Charles E. Leiserson', 'Ronald L. Rivest'],
      description: 'A comprehensive introduction to the modern study of computer algorithms.',
      category: 'BOOK' as const,
      department: 'Computer Science',
      publicationYear: 2022,
      accessType: 'DOWNLOADABLE' as const,
      tags: ['algorithms', 'computer science', 'programming'],
      uploadedById: staff.id,
    },
    {
      title: 'Database System Concepts',
      authors: ['Abraham Silberschatz', 'Henry F. Korth', 'S. Sudarshan'],
      description: 'The definitive guide to database management systems.',
      category: 'BOOK' as const,
      department: 'Computer Science',
      publicationYear: 2021,
      accessType: 'DOWNLOADABLE' as const,
      tags: ['database', 'SQL', 'data management'],
      uploadedById: staff.id,
    },
    {
      title: 'Research Methods in Social Sciences',
      authors: ['John W. Creswell'],
      description: 'A guide to research design and methodology.',
      category: 'JOURNAL' as const,
      department: 'Social Sciences',
      publicationYear: 2023,
      accessType: 'VIEW_ONLY' as const,
      tags: ['research', 'methodology', 'social science'],
      uploadedById: admin.id,
    },
    {
      title: 'Machine Learning: A Probabilistic Perspective',
      authors: ['Kevin P. Murphy'],
      description: 'A comprehensive introduction to machine learning.',
      category: 'BOOK' as const,
      department: 'Computer Science',
      publicationYear: 2022,
      accessType: 'DOWNLOADABLE' as const,
      tags: ['machine learning', 'AI', 'statistics'],
      uploadedById: staff.id,
    },
    {
      title: 'Calculus: Early Transcendentals',
      authors: ['James Stewart'],
      description: 'The most widely used calculus textbook in university courses.',
      category: 'BOOK' as const,
      department: 'Mathematics',
      publicationYear: 2020,
      accessType: 'DOWNLOADABLE' as const,
      tags: ['calculus', 'mathematics', 'analysis'],
      uploadedById: staff.id,
    },
  ];

  for (const resource of resources) {
    await prisma.resource.create({
      data: resource,
    });
  }

  console.log('Created resources:', resources.length);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
