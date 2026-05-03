'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../store/auth.store';
import { useNotificationSocket } from '../../hooks/useNotificationSocket';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import { Calendar, Bell, LayoutDashboard, LogOut, Menu } from 'lucide-react';
import clsx from 'clsx';

const NAV = [
  { href: '/staff/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/staff/schedule', label: 'My Schedule', icon: Calendar },
  { href: '/staff/notifications', label: 'Notifications', icon: Bell },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const qc = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => api.get('/notifications/unread-count').then(r => r.data),
    refetchInterval: 30000,
  });

  useNotificationSocket(() => {
    qc.invalidateQueries({ queryKey: ['notifications'] });
  });

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-gray-100 transition-transform lg:translate-x-0 lg:static lg:z-auto',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex h-16 items-center gap-3 px-6 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900">WorkShift</span>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                'flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                {label}
              </span>
              {label === 'Notifications' && unreadData?.count > 0 && (
                <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadData.count}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3 px-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-400">Staff</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="h-16 flex items-center gap-4 px-6 bg-white border-b border-gray-100 lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="text-gray-500">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-gray-900">WorkShift</span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
    </div>
  );
}
