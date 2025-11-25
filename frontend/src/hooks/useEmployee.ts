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
      const timestamp = Date.now();
      console.log(`[useEmployee] Loading employee ${employeeId} at ${timestamp}...`);
      const response = await employeeApi.getById(employeeId);
      console.log(`[useEmployee] Loaded employee ${employeeId} at ${timestamp}`);
      console.log(`[useEmployee] Absences count:`, response.data.absences?.length);
      console.log(`[useEmployee] Full absences data:`, response.data.absences);
      
      // Force completely new object references to trigger React re-render
      const freshEmployee = {
        ...response.data,
        absences: response.data.absences ? [...response.data.absences] : []
      };
      
      console.log(`[useEmployee] Setting employee state with timestamp ${timestamp}`);
      setEmployee(freshEmployee);
      setEditData(freshEmployee);
      setError('');
    } catch (err: any) {
      console.error(`[useEmployee] Failed to load employee ${employeeId}:`, err);
      setError('Failed to load employee profile');
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    console.log(`[useEmployee] Initial load or employeeId changed to: ${employeeId}`);
    loadEmployee();
  }, [loadEmployee, employeeId]); // Add employeeId as explicit dependency

  // Refresh employee data when window gains focus OR tab becomes visible
  useEffect(() => {
    const handleFocus = () => {
      console.log('[useEmployee] Window gained focus, refreshing employee data');
      loadEmployee();
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[useEmployee] Tab became visible, refreshing employee data');
        loadEmployee();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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

