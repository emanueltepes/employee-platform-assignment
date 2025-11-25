import { useState, useCallback } from 'react';
import { feedbackApi } from '../api';
import type { FeedbackRequest } from '../types';

export const useFeedback = (employeeId: number, onSuccess: () => void) => {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);
  const [formData, setFormData] = useState<FeedbackRequest>({
    content: '',
    useAiPolish: false,
  });

  const handleGetSuggestions = useCallback(async () => {
    if (!formData.content.trim()) {
      alert('Please enter some feedback first');
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await feedbackApi.getSuggestions({ content: formData.content });
      setSuggestions(response.data.suggestions);
      setSelectedSuggestion(null); // Reset selection
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate suggestions');
    } finally {
      setLoadingSuggestions(false);
    }
  }, [formData.content]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If there are suggestions and one is selected, use that
    let contentToSubmit = formData.content;
    if (suggestions.length > 0 && selectedSuggestion !== null) {
      contentToSubmit = suggestions[selectedSuggestion];
    }

    setSubmitting(true);
    try {
      await feedbackApi.create(employeeId, {
        content: contentToSubmit,
        useAiPolish: false, // We're not using the old flow anymore
      });
      setShowForm(false);
      setFormData({ content: '', useAiPolish: false });
      setSuggestions([]);
      setSelectedSuggestion(null);
      onSuccess();
      console.log('✅ Feedback submitted successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  }, [employeeId, formData.content, suggestions, selectedSuggestion, onSuccess]);

  const handleDelete = useCallback(async (feedbackId: number) => {
    if (!confirm('Are you sure you want to delete this feedback?')) {
      return;
    }
    
    setDeletingId(feedbackId);
    try {
      await feedbackApi.delete(feedbackId);
      onSuccess();
      console.log('✅ Feedback deleted successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete feedback');
    } finally {
      setDeletingId(null);
    }
  }, [onSuccess]);

  const handleClearSuggestions = useCallback(() => {
    setSuggestions([]);
    setSelectedSuggestion(null);
  }, []);

  return {
    showForm,
    setShowForm,
    formData,
    setFormData,
    submitting,
    deletingId,
    loadingSuggestions,
    suggestions,
    selectedSuggestion,
    setSelectedSuggestion,
    handleSubmit,
    handleDelete,
    handleGetSuggestions,
    handleClearSuggestions,
  };
};

