import { useState, useCallback } from 'react';
import { absenceApi } from '../api';
import type { AbsenceRequest } from '../types';

export const useAbsence = (employeeId: number, onSuccess: () => void) => {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<AbsenceRequest>({
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
      alert('Absence request submitted successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit absence request');
    } finally {
      setSubmitting(false);
    }
  }, [employeeId, formData, onSuccess]);

  return {
    showForm,
    setShowForm,
    formData,
    setFormData,
    submitting,
    handleSubmit,
    getTodayString,
    getMinEndDate,
  };
};

