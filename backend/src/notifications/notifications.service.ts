import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private gateway: NotificationsGateway,
  ) {}

  async notifyUsers(
    userIds: string[],
    title: string,
    message: string,
    scheduleId?: string,
  ) {
    const notifications = await this.prisma.$transaction(
      userIds.map((userId) =>
        this.prisma.notification.create({
          data: { userId, title, message },
        }),
      ),
    );

    userIds.forEach((userId, i) => {
      this.gateway.sendToUser(userId, {
        id: notifications[i].id,
        title,
        message,
        isRead: false,
        createdAt: notifications[i].createdAt,
        scheduleId,
      });
    });

    return notifications;
  }

  async getMyNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }
}
