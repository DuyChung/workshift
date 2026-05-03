import { PrismaClient, Role, Status } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.shiftAssignment.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash('Admin@123456', 12);
  const staffPassword = await bcrypt.hash('Staff@123456', 12);

  const admin = await prisma.user.create({
    data: {
      fullName: 'Admin WorkShift',
      email: 'admin@workshift.com',
      password: adminPassword,
      role: Role.ADMIN,
      status: Status.ACTIVE,
      salaryGrade: 'Grade 5',
      dateOfBirth: new Date('1985-01-01'),
    },
  });

  const staff1 = await prisma.user.create({
    data: {
      fullName: 'Nguyen Van An',
      email: 'an.nguyen@workshift.com',
      password: staffPassword,
      role: Role.STAFF,
      status: Status.ACTIVE,
      salaryGrade: 'Grade 2',
      dateOfBirth: new Date('1995-03-15'),
    },
  });

  const staff2 = await prisma.user.create({
    data: {
      fullName: 'Tran Thi Bich',
      email: 'bich.tran@workshift.com',
      password: staffPassword,
      role: Role.STAFF,
      status: Status.ACTIVE,
      salaryGrade: 'Grade 3',
      dateOfBirth: new Date('1997-07-22'),
    },
  });

  const staff3 = await prisma.user.create({
    data: {
      fullName: 'Le Van Cuong',
      email: 'cuong.le@workshift.com',
      password: staffPassword,
      role: Role.STAFF,
      status: Status.INACTIVE,
      salaryGrade: 'Grade 1',
      dateOfBirth: new Date('1999-11-08'),
    },
  });

  const today = new Date();
  const formatDate = (offset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const schedule1 = await prisma.schedule.create({
    data: {
      date: formatDate(1),
      startTime: '08:00',
      endTime: '12:00',
      note: 'Morning shift - Reception desk',
      assignments: { create: [{ userId: staff1.id }, { userId: staff2.id }] },
    },
  });

  await prisma.schedule.create({
    data: {
      date: formatDate(1),
      startTime: '13:00',
      endTime: '17:00',
      note: 'Afternoon shift - Customer service',
      assignments: { create: [{ userId: staff2.id }] },
    },
  });

  await prisma.schedule.create({
    data: {
      date: formatDate(2),
      startTime: '08:00',
      endTime: '17:00',
      note: 'Full day - Inventory check',
      assignments: { create: [{ userId: staff1.id }] },
    },
  });

  await prisma.schedule.create({
    data: {
      date: formatDate(5),
      startTime: '09:00',
      endTime: '18:00',
      note: 'Weekend shift - Special event',
      assignments: { create: [{ userId: staff1.id }, { userId: staff2.id }] },
    },
  });

  await prisma.notification.create({
    data: {
      userId: staff1.id,
      title: 'New Shift Assigned',
      message: `You have been assigned a new shift on ${formatDate(1).toLocaleDateString('vi-VN')}.`,
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: staff2.id,
      title: 'New Shift Assigned',
      message: `You have been assigned a new shift on ${formatDate(1).toLocaleDateString('vi-VN')}.`,
      isRead: false,
    },
  });

  console.log('✅ Seed completed!');
  console.log('');
  console.log('📧 Login credentials:');
  console.log('  Admin: admin@workshift.com / Admin@123456');
  console.log('  Staff: an.nguyen@workshift.com / Staff@123456');
  console.log('  Staff: bich.tran@workshift.com / Staff@123456');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
