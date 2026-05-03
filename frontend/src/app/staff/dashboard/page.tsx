'use client';
import { useQuery } from '@tanstack/react-query';
import api from '../../../utils/api';
import { useAuthStore } from '../../../store/auth.store';
import { Schedule, Notification } from '../../../types';
import { Calendar, Clock, Bell, CheckCircle } from 'lucide-react';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';

export default function StaffDashboard() {
  const { user } = useAuthStore();

  const { data: schedules = [] } = useQuery<Schedule[]>({
    queryKey: ['my-schedules'],
    queryFn: () => api.get('/schedules/me').then(r => r.data),
  });

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data),
  });

  const today = new Date();
  const todayShifts = schedules.filter(s => isToday(new Date(s.date)));
  const tomorrowShifts = schedules.filter(s => isTomorrow(new Date(s.date)));
  const weekShifts = schedules.filter(s => isThisWeek(new Date(s.date), { weekStartsOn: 1 }));
  const unread = notifications.filter(n => !n.isRead).length;

  const getDateLabel = (s: Schedule) => {
    const d = new Date(s.date);
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    return format(d, 'EEE, MMM d');
  };

  const upcomingShifts = schedules
    .filter(s => new Date(s.date) >= today)
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Good {today.getHours() < 12 ? 'morning' : today.getHours() < 17 ? 'afternoon' : 'evening'}, {user?.fullName?.split(' ')[0]}!
        </h1>
        <p className="text-sm text-gray-500 mt-1">{format(today, 'EEEE, MMMM d, yyyy')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Shifts", value: todayShifts.length, icon: Clock, color: 'bg-blue-50 text-blue-700' },
          { label: 'Tomorrow', value: tomorrowShifts.length, icon: Calendar, color: 'bg-indigo-50 text-indigo-700' },
          { label: 'This Week', value: weekShifts.length, icon: CheckCircle, color: 'bg-green-50 text-green-700' },
          { label: 'Unread Alerts', value: unread, icon: Bell, color: 'bg-amber-50 text-amber-700' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className={`inline-flex p-2 rounded-lg ${color} mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {todayShifts.length > 0 && (
        <div className="card p-6 border-l-4 border-l-indigo-500">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            Today's Shifts
          </h2>
          <div className="space-y-3">
            {todayShifts.map(s => (
              <div key={s.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.startTime} — {s.endTime}</p>
                  {s.note && <p className="text-xs text-gray-500">{s.note}</p>}
                </div>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full">Today</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Upcoming Shifts</h2>
          {upcomingShifts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No upcoming shifts assigned</p>
          ) : (
            <div className="space-y-3">
              {upcomingShifts.map(s => (
                <div key={s.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="text-center bg-gray-50 rounded-lg px-2.5 py-1.5 min-w-[52px]">
                    <p className="text-xs text-gray-400">{format(new Date(s.date), 'EEE')}</p>
                    <p className="text-base font-bold text-gray-700">{format(new Date(s.date), 'd')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.startTime} — {s.endTime}</p>
                    <p className="text-xs text-gray-400">{getDateLabel(s)}{s.note ? ` · ${s.note}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Recent Notifications</h2>
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No notifications</p>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 4).map(n => (
                <div key={n.id} className={`flex items-start gap-3 py-2 border-b border-gray-50 last:border-0 ${!n.isRead ? 'opacity-100' : 'opacity-60'}`}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.isRead ? 'bg-indigo-500' : 'bg-gray-300'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-500">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
