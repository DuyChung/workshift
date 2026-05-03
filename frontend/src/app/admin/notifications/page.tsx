'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';
import { Notification } from '../../../types';
import { Bell, CheckCheck, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data),
  });

  const markAllMutation = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markOneMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">{unread} unread</p>
        </div>
        {unread > 0 && (
          <button onClick={() => markAllMutation.mutate()} className="btn-secondary text-xs">
            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="card p-8 text-center text-gray-400 text-sm">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="card p-12 text-center">
          <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No notifications yet</p>
        </div>
      ) : (
        <div className="card divide-y divide-gray-50 overflow-hidden">
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => !n.isRead && markOneMutation.mutate(n.id)}
              className={`flex items-start gap-4 p-4 transition-colors cursor-pointer hover:bg-gray-50 ${!n.isRead ? 'bg-indigo-50/30' : ''}`}
            >
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.isRead ? 'bg-indigo-500' : 'bg-gray-200'}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${!n.isRead ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </div>
              </div>
              {!n.isRead && (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full flex-shrink-0">New</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
