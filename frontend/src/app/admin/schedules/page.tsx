'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';
import { Schedule } from '../../../types';
import { Plus, Pencil, Trash2, Calendar, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import ScheduleModal from '../../../components/admin/ScheduleModal';

export default function SchedulesPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editSchedule, setEditSchedule] = useState<Schedule | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });

  const { data: schedules = [], isLoading } = useQuery<Schedule[]>({
    queryKey: ['schedules', weekOffset],
    queryFn: () => api.get('/schedules', {
      params: { startDate: format(weekStart, 'yyyy-MM-dd'), endDate: format(weekEnd, 'yyyy-MM-dd') }
    }).then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/schedules/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['schedules'] }); toast.success('Schedule deleted'); },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Schedules</h1>
          <p className="text-sm text-gray-500 mt-1">{schedules.length} shifts this week</p>
        </div>
        <button onClick={() => { setEditSchedule(null); setModalOpen(true); }} className="btn-primary">
          <Plus className="w-4 h-4" /> New Shift
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => setWeekOffset(w => w - 1)} className="btn-secondary px-3">←</button>
        <div className="card px-4 py-2 text-sm font-medium text-gray-700 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          {format(weekStart, 'MMM d')} — {format(weekEnd, 'MMM d, yyyy')}
        </div>
        <button onClick={() => setWeekOffset(0)} className="btn-secondary text-xs px-3 py-2">Today</button>
        <button onClick={() => setWeekOffset(w => w + 1)} className="btn-secondary px-3">→</button>
      </div>

      {isLoading ? (
        <div className="card p-8 text-center text-gray-400 text-sm">Loading schedules...</div>
      ) : schedules.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No shifts scheduled for this week</p>
          <button onClick={() => setModalOpen(true)} className="btn-primary mt-4 mx-auto">Create First Shift</button>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((s) => (
            <div key={s.id} className="card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="text-center bg-indigo-50 rounded-xl px-3 py-2 min-w-[60px]">
                    <p className="text-xs text-indigo-500 font-medium">{format(new Date(s.date), 'EEE')}</p>
                    <p className="text-xl font-bold text-indigo-700">{format(new Date(s.date), 'd')}</p>
                    <p className="text-xs text-indigo-400">{format(new Date(s.date), 'MMM')}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{s.startTime} — {s.endTime}</p>
                    {s.note && <p className="text-sm text-gray-500 mt-0.5">{s.note}</p>}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {s.assignments.map(a => (
                        <span key={a.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {a.user.fullName}
                        </span>
                      ))}
                      {s.assignments.length === 0 && (
                        <span className="text-xs text-gray-400 italic">No staff assigned</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => { setEditSchedule(s); setModalOpen(true); }} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => { if (confirm('Delete this shift?')) deleteMutation.mutate(s.id); }} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ScheduleModal open={modalOpen} onClose={() => setModalOpen(false)} schedule={editSchedule} />
    </div>
  );
}
