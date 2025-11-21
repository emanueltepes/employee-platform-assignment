import { useState, useCallback } from 'react';
import { feedbackApi } from '../api';
import type { FeedbackRequest } from '../types';

export const useFeedback = (employeeId: number, onSuccess: () => void) => {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FeedbackRequest>({
    content: '',
    useAiPolish: false,
  });

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await feedbackApi.create(employeeId, formData);
      setShowForm(false);
      setFormData({ content: '', useAiPolish: false });
      onSuccess();
      alert('Feedback submitted successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  }, [employeeId, formData, onSuccess]);

  const handleDelete = useCallback(async (feedbackId: number) => {
    if (!confirm('Are you sure you want to delete this feedback?')) {
      return;
    }
    
    setDeletingId(feedbackId);
    try {
      await feedbackApi.delete(feedbackId);
      onSuccess();
      alert('Feedback deleted successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete feedback');
    } finally {
      setDeletingId(null);
    }
  }, [onSuccess]);

  return {
    showForm,
    setShowForm,
    formData,
    setFormData,
    submitting,
    deletingId,
    handleSubmit,
    handleDelete,
  };
};

