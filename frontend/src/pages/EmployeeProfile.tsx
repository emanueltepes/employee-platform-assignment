import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { employeeApi, absenceApi, feedbackApi } from '../api';
import type { Employee, AbsenceRequest, FeedbackRequest } from '../types';
import { useAuth } from '../AuthContext';

const EmployeeProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Employee>>({});
  const { user } = useAuth();

  // Absence form state
  const [showAbsenceForm, setShowAbsenceForm] = useState(false);
  const [absenceData, setAbsenceData] = useState<AbsenceRequest>({
    startDate: '',
    endDate: '',
    type: 'VACATION',
    reason: '',
  });
  const [submittingAbsence, setSubmittingAbsence] = useState(false);

  // Feedback form state
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackData, setFeedbackData] = useState<FeedbackRequest>({
    content: '',
    useAiPolish: false,
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [deletingFeedbackId, setDeletingFeedbackId] = useState<number | null>(null);

  const loadEmployee = useCallback(async () => {
    try {
      const response = await employeeApi.getById(Number(id));
      setEmployee(response.data);
      setEditData(response.data);
    } catch (err: any) {
      setError('Failed to load employee profile');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadEmployee();
  }, [loadEmployee]);

  const handleSave = useCallback(async () => {
    try {
      await employeeApi.update(Number(id), editData);
      setEditing(false);
      loadEmployee();
    } catch (err: any) {
      alert('Failed to update profile');
    }
  }, [id, editData]);

  const handleAbsenceSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend validation
    const start = new Date(absenceData.startDate);
    const end = new Date(absenceData.endDate);
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
    
    setSubmittingAbsence(true);
    try {
      await absenceApi.create(Number(id), absenceData);
      setShowAbsenceForm(false);
      setAbsenceData({ startDate: '', endDate: '', type: 'VACATION', reason: '' });
      loadEmployee();
      alert('Absence request submitted successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit absence request');
    } finally {
      setSubmittingAbsence(false);
    }
  }, [id, absenceData, loadEmployee]);

  const handleFeedbackSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      await feedbackApi.create(Number(id), feedbackData);
      setShowFeedbackForm(false);
      setFeedbackData({ content: '', useAiPolish: false });
      loadEmployee();
      alert('Feedback submitted successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  }, [id, feedbackData, loadEmployee]);

  const handleDeleteFeedback = useCallback(async (feedbackId: number) => {
    if (!confirm('Are you sure you want to delete this feedback?')) {
      return;
    }
    
    setDeletingFeedbackId(feedbackId);
    try {
      await feedbackApi.delete(feedbackId);
      loadEmployee();
      alert('Feedback deleted successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete feedback');
    } finally {
      setDeletingFeedbackId(null);
    }
  }, [loadEmployee]);

  // Memoize permission checks to prevent recalculation on every render
  const canEdit = useMemo(() => user?.role === 'MANAGER' || user?.employeeId === Number(id), [user, id]);
  const canRequestAbsence = useMemo(() => user?.employeeId === Number(id), [user, id]);
  const isViewingOwnProfile = useMemo(() => user?.employeeId === Number(id), [user, id]);
  const canLeaveFeedback = useMemo(() => (user?.role === 'COWORKER' || user?.role === 'MANAGER') && !isViewingOwnProfile, [user, isViewingOwnProfile]);
  const showSensitiveData = useMemo(() => user?.role === 'MANAGER' || user?.employeeId === Number(id), [user, id]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error || !employee) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-600">
                {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {employee.firstName} {employee.lastName}
              </h1>
              <p className="text-lg text-gray-600">{employee.position}</p>
            </div>
          </div>
          {canEdit && (
            <button
              onClick={() => editing ? handleSave() : setEditing(true)}
              className="btn btn-primary"
            >
              {editing ? 'Save' : 'Edit'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Department</dt>
                <dd className="text-sm text-gray-900">
                  {editing ? (
                    <input
                      className="input"
                      value={editData.department || ''}
                      onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                    />
                  ) : (
                    employee.department || 'N/A'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="text-sm text-gray-900">{employee.phone || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Office Location</dt>
                <dd className="text-sm text-gray-900">{employee.officeLocation || 'N/A'}</dd>
              </div>
            </dl>
          </div>

          {showSensitiveData && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Sensitive Information</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Salary</dt>
                  <dd className="text-sm text-gray-900">
                    {employee.salary ? `$${employee.salary.toLocaleString()}` : 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                  <dd className="text-sm text-gray-900">{employee.dateOfBirth || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Hire Date</dt>
                  <dd className="text-sm text-gray-900">{employee.hireDate || 'N/A'}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>

      {canRequestAbsence && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Request Absence</h2>
            <button
              onClick={() => setShowAbsenceForm(!showAbsenceForm)}
              className="btn btn-primary"
            >
              {showAbsenceForm ? 'Cancel' : 'New Request'}
            </button>
          </div>

          {showAbsenceForm && (
            <form onSubmit={handleAbsenceSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    className="input"
                    value={absenceData.startDate}
                    onChange={(e) => setAbsenceData({ ...absenceData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    className="input"
                    value={absenceData.endDate}
                    onChange={(e) => setAbsenceData({ ...absenceData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  className="input"
                  value={absenceData.type}
                  onChange={(e) => setAbsenceData({ ...absenceData, type: e.target.value as any })}
                >
                  <option value="VACATION">Vacation</option>
                  <option value="SICK_LEAVE">Sick Leave</option>
                  <option value="PERSONAL_LEAVE">Personal Leave</option>
                  <option value="MATERNITY_PATERNITY">Maternity/Paternity</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  className="input"
                  rows={3}
                  value={absenceData.reason}
                  onChange={(e) => setAbsenceData({ ...absenceData, reason: e.target.value })}
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submittingAbsence}
              >
                {submittingAbsence ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          )}

          {employee.absences && employee.absences.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Absence History</h3>
              <div className="space-y-2">
                {employee.absences.map((absence) => (
                  <div key={absence.id} className="border rounded p-3">
                    <div className="flex justify-between">
                      <span className="font-medium">{absence.type}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        absence.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        absence.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {absence.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {absence.startDate} to {absence.endDate}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {canLeaveFeedback && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Feedback</h2>
            <button
              onClick={() => setShowFeedbackForm(!showFeedbackForm)}
              className="btn btn-primary"
            >
              {showFeedbackForm ? 'Cancel' : 'Leave Feedback'}
            </button>
          </div>

          {showFeedbackForm && (
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Feedback</label>
                <textarea
                  required
                  className="input"
                  rows={4}
                  value={feedbackData.content}
                  onChange={(e) => setFeedbackData({ ...feedbackData, content: e.target.value })}
                  placeholder="Share your thoughts about this colleague..."
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="aiPolish"
                  checked={feedbackData.useAiPolish}
                  onChange={(e) => setFeedbackData({ ...feedbackData, useAiPolish: e.target.checked })}
                  className="mr-2"
                  disabled={submittingFeedback}
                />
                <label htmlFor="aiPolish" className="text-sm text-gray-700">
                  Use AI to polish my feedback {feedbackData.useAiPolish && '(may take a few seconds)'}
                </label>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submittingFeedback}
              >
                {submittingFeedback ? (feedbackData.useAiPolish ? 'Polishing...' : 'Submitting...') : 'Submit Feedback'}
              </button>
            </form>
          )}

          {employee.feedbacks && employee.feedbacks.length > 0 && (
            <div className="mt-6 space-y-3">
              {employee.feedbacks.map((feedback) => (
                <div key={feedback.id} className="border rounded p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{feedback.authorName}</span>
                      {feedback.isPolished && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                          AI Polished
                        </span>
                      )}
                    </div>
                    {feedback.authorName === user?.username && (
                      <button
                        onClick={() => handleDeleteFeedback(feedback.id)}
                        disabled={deletingFeedbackId === feedback.id}
                        className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete feedback"
                      >
                        {deletingFeedbackId === feedback.id ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700">
                    {feedback.isPolished && feedback.polishedContent
                      ? feedback.polishedContent
                      : feedback.originalContent}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(feedback.createdAt!).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeProfile;

