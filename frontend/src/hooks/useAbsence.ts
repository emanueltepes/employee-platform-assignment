import { useState, useCallback } from 'react';
import { absenceApi } from '../api';
import type { AbsenceRequest } from '../types';

export const useAbsence = (employeeId: number, onSuccess: () => void) => {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [formData, setFormData] = useState<AbsenceRequest>({
    startDate: '',
    endDate: '',
    type: 'VACATION',
    reason: '',
  });
  const [editFormData, setEditFormData] = useState<AbsenceRequest>({
    startDate: '',
    endDate: '',
    type: 'VACATION',
    reason: '',
  });

  // Get today's date in YYYY-MM-DD format for min date
  const getTodayString = useCallback(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }, []);

  // Get the minimum date for end date (either today or start date, whichever is later)
  const getMinEndDate = useCallback(() => {
    if (!formData.startDate) return getTodayString();
    const startDate = formData.startDate;
    const today = getTodayString();
    return startDate > today ? startDate : today;
  }, [formData.startDate, getTodayString]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend validation
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (start > end) {
      alert('Start date must be before or equal to end date');
      return;
    }
    
    if (start < today) {
      alert('Cannot request absence for past dates');
      return;
    }
    
    setSubmitting(true);
    try {
      await absenceApi.create(employeeId, formData);
      setShowForm(false);
      setFormData({ startDate: '', endDate: '', type: 'VACATION', reason: '' });
      onSuccess();
      
      // Notify Layout to refresh pending count
      window.dispatchEvent(new Event('refreshAbsenceCount'));
      
      console.log('✅ Absence request submitted successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit absence request');
    } finally {
      setSubmitting(false);
    }
  }, [employeeId, formData, onSuccess]);

  const handleUpdateStatus = useCallback(async (absenceId: number, status: 'APPROVED' | 'REJECTED') => {
    setUpdatingStatusId(absenceId);
    try {
      await absenceApi.updateStatus(absenceId, status);
      
      // Small delay to ensure backend transaction completes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await onSuccess();
      
      // Notify Layout to refresh pending count
      window.dispatchEvent(new Event('refreshAbsenceCount'));
    } catch (err: any) {
      console.error(`Failed to update absence status:`, err);
      alert(err.response?.data?.message || 'Failed to update absence status');
    } finally {
      setUpdatingStatusId(null);
    }
  }, [onSuccess]);

  const handleEdit = useCallback((absence: { id: number; startDate: string; endDate: string; type: any; reason?: string }) => {
    setEditingId(absence.id);
    setEditFormData({
      startDate: absence.startDate,
      endDate: absence.endDate,
      type: absence.type,
      reason: absence.reason || '',
    });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditFormData({
      startDate: '',
      endDate: '',
      type: 'VACATION',
      reason: '',
    });
  }, []);

  const handleUpdateSubmit = useCallback(async (absenceId: number, e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend validation
    const start = new Date(editFormData.startDate);
    const end = new Date(editFormData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (start > end) {
      alert('Start date must be before or equal to end date');
      return;
    }
    
    if (start < today) {
      alert('Cannot set absence dates in the past');
      return;
    }
    
    setSubmitting(true);
    try {
      await absenceApi.update(absenceId, editFormData);
      setEditingId(null);
      onSuccess();
      console.log('✅ Absence request updated successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update absence request');
    } finally {
      setSubmitting(false);
    }
  }, [editFormData, onSuccess]);

  const handleDelete = useCallback(async (absenceId: number) => {
    if (!confirm('Are you sure you want to delete this absence request?')) {
      return;
    }
    
    setDeletingId(absenceId);
    try {
      await absenceApi.delete(absenceId);
      onSuccess();
      
      // Notify Layout to refresh pending count
      window.dispatchEvent(new Event('refreshAbsenceCount'));
      
      console.log('✅ Absence request deleted successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete absence request');
    } finally {
      setDeletingId(null);
    }
  }, [onSuccess]);

  return {
    showForm,
    setShowForm,
    formData,
    setFormData,
    editFormData,
    setEditFormData,
    submitting,
    editingId,
    deletingId,
    updatingStatusId,
    handleSubmit,
    handleEdit,
    handleCancelEdit,
    handleUpdateSubmit,
    handleUpdateStatus,
    handleDelete,
    getTodayString,
    getMinEndDate,
  };
};

