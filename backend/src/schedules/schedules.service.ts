import {
  Injectable, NotFoundException, BadRequestException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    return this.prisma.schedule.findMany({
      where,
      include: {
        assignments: {
          include: { user: { select: { id: true, fullName: true, email: true } } },
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findMySchedules(userId: string, startDate?: string, endDate?: string) {
    const where: any = { assignments: { some: { userId } } };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    return this.prisma.schedule.findMany({
      where,
      include: {
        assignments: {
          where: { userId },
          include: { user: { select: { id: true, fullName: true, email: true } } },
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findOne(id: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: {
        assignments: {
          include: { user: { select: { id: true, fullName: true, email: true } } },
        },
      },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');
    return schedule;
  }

  async create(dto: CreateScheduleDto) {
    const { userIds, ...scheduleData } = dto;

    const schedule = await this.prisma.schedule.create({
      data: {
        ...scheduleData,
        date: new Date(scheduleData.date),
        assignments: userIds?.length
          ? { create: userIds.map((userId) => ({ userId })) }
          : undefined,
      },
      include: {
        assignments: {
          include: { user: { select: { id: true, fullName: true, email: true } } },
        },
      },
    });

    if (userIds?.length) {
      await this.notificationsService.notifyUsers(
        userIds,
        'New Shift Assigned',
        `You have been assigned a new shift on ${new Date(dto.date).toLocaleDateString('vi-VN')} from ${dto.startTime} to ${dto.endTime}.`,
        schedule.id,
      );
    }

    return schedule;
  }

  async update(id: string, dto: UpdateScheduleDto) {
    await this.findOne(id);
    const { userIds, ...scheduleData } = dto;
    const data: any = { ...scheduleData };
    if (scheduleData.date) data.date = new Date(scheduleData.date);

    let schedule;
    if (userIds !== undefined) {
      await this.prisma.shiftAssignment.deleteMany({ where: { scheduleId: id } });
      schedule = await this.prisma.schedule.update({
        where: { id },
        data: {
          ...data,
          assignments: userIds.length
            ? { create: userIds.map((userId) => ({ userId })) }
            : undefined,
        },
        include: {
          assignments: {
            include: { user: { select: { id: true, fullName: true, email: true } } },
          },
        },
      });

      if (userIds.length) {
        await this.notificationsService.notifyUsers(
          userIds,
          'Shift Updated',
          `Your shift on ${new Date(schedule.date).toLocaleDateString('vi-VN')} has been updated.`,
          schedule.id,
        );
      }
    } else {
      schedule = await this.prisma.schedule.update({
        where: { id },
        data,
        include: {
          assignments: {
            include: { user: { select: { id: true, fullName: true, email: true } } },
          },
        },
      });
    }

    return schedule;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.schedule.delete({ where: { id } });
    return { message: 'Schedule deleted' };
  }
}
