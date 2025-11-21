import { useState, useCallback, useEffect } from 'react';
import { employeeApi } from '../api';
import type { Employee } from '../types';

export const useEmployee = (employeeId: number) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Employee>>({});

  const loadEmployee = useCallback(async () => {
    try {
      setLoading(true);
      const response = await employeeApi.getById(employeeId);
      setEmployee(response.data);
      setEditData(response.data);
      setError('');
    } catch (err: any) {
      setError('Failed to load employee profile');
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    loadEmployee();
  }, [loadEmployee]);

  const handleSave = useCallback(async () => {
    try {
      await employeeApi.update(employeeId, editData);
      setEditing(false);
      await loadEmployee();
    } catch (err: any) {
      throw new Error('Failed to update profile');
    }
  }, [employeeId, editData, loadEmployee]);

  return {
    employee,
    loading,
    error,
    editing,
    setEditing,
    editData,
    setEditData,
    handleSave,
    refreshEmployee: loadEmployee,
  };
};

