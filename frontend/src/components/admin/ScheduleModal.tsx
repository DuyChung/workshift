'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import { Schedule, User } from '../../types';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time required'),
  endTime: z.string().min(1, 'End time required'),
  note: z.string().optional(),
  userIds: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props { open: boolean; onClose: () => void; schedule: Schedule | null; }

export default function ScheduleModal({ open, onClose, schedule }: Props) {
  const qc = useQueryClient();
  const isEdit = !!schedule;

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then(r => r.data),
    enabled: open,
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { userIds: [] },
  });

  const selectedUserIds = watch('userIds') || [];

  useEffect(() => {
    if (schedule) {
      reset({
        date: schedule.date.split('T')[0],
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        note: schedule.note || '',
        userIds: schedule.assignments.map(a => a.userId),
      });
    } else {
      reset({ date: '', startTime: '', endTime: '', note: '', userIds: [] });
    }
  }, [schedule, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEdit
        ? api.patch(`/schedules/${schedule!.id}`, data)
        : api.post('/schedules', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedules'] });
      toast.success(isEdit ? 'Shift updated' : 'Shift created');
      onClose();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error occurred'),
  });

  const toggleUser = (id: string) => {
    const current = selectedUserIds;
    if (current.includes(id)) {
      setValue('userIds', current.filter(u => u !== id));
    } else {
      setValue('userIds', [...current, id]);
    }
  };

  const activeUsers = users.filter(u => u.status === 'ACTIVE' && u.role === 'STAFF');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? 'Edit Shift' : 'Create New Shift'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="p-6 space-y-4">
          <div>
            <label className="label">Date *</label>
            <input {...register('date')} type="date" className="input" />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Time *</label>
              <input {...register('startTime')} type="time" className="input" />
              {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime.message}</p>}
            </div>
            <div>
              <label className="label">End Time *</label>
              <input {...register('endTime')} type="time" className="input" />
              {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime.message}</p>}
            </div>
          </div>

          <div>
            <label className="label">Note</label>
            <textarea {...register('note')} className="input resize-none" rows={2} placeholder="Optional notes about this shift..." />
          </div>

          <div>
            <label className="label">Assign Staff</label>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {activeUsers.length === 0 ? (
                <p className="text-sm text-gray-400 p-3 text-center">No active staff available</p>
              ) : (
                <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto">
                  {activeUsers.map(u => (
                    <label key={u.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(u.id)}
                        onChange={() => toggleUser(u.id)}
                        className="rounded border-gray-300 text-indigo-600"
                      />
                      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                        {u.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.fullName}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {selectedUserIds.length > 0 && (
              <p className="text-xs text-indigo-600 mt-1">{selectedUserIds.length} staff selected</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1 justify-center">
              {mutation.isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Shift'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
