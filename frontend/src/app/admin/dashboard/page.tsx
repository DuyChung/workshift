'use client';
import { useQuery } from '@tanstack/react-query';
import api from '../../../utils/api';
import { Users, Calendar, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: () => api.get('/users').then(r => r.data) });
  const { data: schedules = [] } = useQuery({ queryKey: ['schedules'], queryFn: () => api.get('/schedules').then(r => r.data) });

  const today = new Date();
  const todaySchedules = schedules.filter((s: any) =>
    format(new Date(s.date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  );
  const activeUsers = users.filter((u: any) => u.status === 'ACTIVE');
  const upcomingSchedules = schedules.filter((s: any) => new Date(s.date) >= today).slice(0, 5);

  const stats = [
    { label: 'Total Employees', value: users.length, icon: Users, color: 'bg-blue-50 text-blue-700' },
    { label: 'Active Staff', value: activeUsers.length, icon: TrendingUp, color: 'bg-green-50 text-green-700' },
    { label: "Today's Shifts", value: todaySchedules.length, icon: Clock, color: 'bg-amber-50 text-amber-700' },
    { label: 'Total Schedules', value: schedules.length, icon: Calendar, color: 'bg-indigo-50 text-indigo-700' },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">{format(today, 'EEEE, MMMM d, yyyy')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className={`inline-flex p-2 rounded-lg ${color} mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Upcoming Shifts</h2>
          {upcomingSchedules.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No upcoming shifts</p>
          ) : (
            <div className="space-y-3">
              {upcomingSchedules.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(s.date), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-gray-500">{s.startTime} — {s.endTime}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                      {s.assignments.length} staff
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Recent Employees</h2>
          <div className="space-y-3">
            {users.slice(0, 5).map((u: any) => (
              <div key={u.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0">
                  {u.fullName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{u.fullName}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                <span className={u.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}>
                  {u.status.toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
