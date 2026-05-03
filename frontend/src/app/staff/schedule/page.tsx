'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../utils/api';
import { Schedule } from '../../../types';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths
} from 'date-fns';

export default function StaffSchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'list'>('month');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const { data: schedules = [], isLoading } = useQuery<Schedule[]>({
    queryKey: ['my-schedules', format(monthStart, 'yyyy-MM')],
    queryFn: () => api.get('/schedules/me', {
      params: {
        startDate: format(calStart, 'yyyy-MM-dd'),
        endDate: format(calEnd, 'yyyy-MM-dd'),
      }
    }).then(r => r.data),
  });

  const getShiftsForDay = (day: Date) =>
    schedules.filter(s => isSameDay(new Date(s.date), day));

  const upcomingList = schedules
    .filter(s => new Date(s.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">My Schedule</h1>
          <p className="text-sm text-gray-500 mt-1">{schedules.length} shifts assigned</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(['month', 'list'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${view === v ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => setCurrentDate(d => subMonths(d, 1))} className="btn-secondary p-2">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 min-w-[160px] text-center">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <button onClick={() => setCurrentDate(d => addMonths(d, 1))} className="btn-secondary p-2">
          <ChevronRight className="w-4 h-4" />
        </button>
        <button onClick={() => setCurrentDate(new Date())} className="btn-secondary text-xs">
          Today
        </button>
      </div>

      {view === 'month' ? (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-100">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="p-2 text-center text-xs font-medium text-gray-400">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              const shifts = getShiftsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);
              return (
                <div
                  key={i}
                  className={`min-h-[80px] p-2 border-b border-r border-gray-50 ${!isCurrentMonth ? 'bg-gray-50/50' : ''}`}
                >
                  <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-medium mb-1 ${
                    isCurrentDay ? 'bg-indigo-600 text-white' : isCurrentMonth ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {shifts.map(s => (
                    <div key={s.id} className="text-xs bg-indigo-100 text-indigo-700 rounded px-1.5 py-0.5 mb-0.5 truncate">
                      {s.startTime}–{s.endTime}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {isLoading ? (
            <div className="card p-8 text-center text-sm text-gray-400">Loading...</div>
          ) : upcomingList.length === 0 ? (
            <div className="card p-12 text-center">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No upcoming shifts</p>
            </div>
          ) : (
            upcomingList.map(s => (
              <div key={s.id} className="card p-4 flex items-center gap-4">
                <div className="text-center bg-indigo-50 rounded-xl px-3 py-2 min-w-[56px]">
                  <p className="text-xs text-indigo-400 font-medium">{format(new Date(s.date), 'EEE')}</p>
                  <p className="text-lg font-bold text-indigo-700">{format(new Date(s.date), 'd')}</p>
                  <p className="text-xs text-indigo-400">{format(new Date(s.date), 'MMM')}</p>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{s.startTime} — {s.endTime}</p>
                  {s.note && <p className="text-xs text-gray-500 mt-0.5">{s.note}</p>}
                </div>
                {isToday(new Date(s.date)) && (
                  <span className="text-xs bg-indigo-600 text-white px-2.5 py-0.5 rounded-full">Today</span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
