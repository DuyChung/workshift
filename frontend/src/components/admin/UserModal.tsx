'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import { User } from '../../types';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).optional().or(z.literal('')),
  dateOfBirth: z.string().optional(),
  salaryGrade: z.string().optional(),
  role: z.enum(['ADMIN', 'STAFF']),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props { open: boolean; onClose: () => void; user: User | null; }

export default function UserModal({ open, onClose, user }: Props) {
  const qc = useQueryClient();
  const isEdit = !!user;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'STAFF', status: 'ACTIVE' },
  });

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName,
        email: user.email,
        dateOfBirth: user.dateOfBirth?.split('T')[0],
        salaryGrade: user.salaryGrade || '',
        role: user.role,
        status: user.status,
        password: '',
      });
    } else {
      reset({ role: 'STAFF', status: 'ACTIVE', fullName: '', email: '', password: '' });
    }
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEdit
        ? api.patch(`/users/${user!.id}`, data)
        : api.post('/users', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success(isEdit ? 'Employee updated' : 'Employee created');
      onClose();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error occurred'),
  });

  const onSubmit = (data: FormData) => {
    const payload: any = { ...data };
    if (!payload.password) delete payload.password;
    mutation.mutate(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? 'Edit Employee' : 'Add New Employee'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Full Name *</label>
              <input {...register('fullName')} className="input" placeholder="Nguyen Van A" />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
            </div>
            <div className="col-span-2">
              <label className="label">Email *</label>
              <input {...register('email')} type="email" className="input" placeholder="email@company.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div className="col-span-2">
              <label className="label">{isEdit ? 'New Password (leave blank to keep)' : 'Password *'}</label>
              <input {...register('password')} type="password" className="input" placeholder="Min 8 characters" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="label">Date of Birth</label>
              <input {...register('dateOfBirth')} type="date" className="input" />
            </div>
            <div>
              <label className="label">Salary Grade</label>
              <input {...register('salaryGrade')} className="input" placeholder="Grade 1-5" />
            </div>
            <div>
              <label className="label">Role</label>
              <select {...register('role')} className="input">
                <option value="STAFF">Staff</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            {isEdit && (
              <div>
                <label className="label">Status</label>
                <select {...register('status')} className="input">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1 justify-center">
              {mutation.isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
