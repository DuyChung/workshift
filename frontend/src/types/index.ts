export type Role = 'ADMIN' | 'STAFF';
export type Status = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  fullName: string;
  email: string;
  dateOfBirth?: string;
  salaryGrade?: string;
  role: Role;
  status: Status;
  createdAt: string;
}

export interface Schedule {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  note?: string;
  createdAt: string;
  assignments: ShiftAssignment[];
}

export interface ShiftAssignment {
  id: string;
  userId: string;
  scheduleId: string;
  user: Pick<User, 'id' | 'fullName' | 'email'>;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
