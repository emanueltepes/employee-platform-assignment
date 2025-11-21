import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useEmployee } from '../hooks/useEmployee';
import { useAbsence } from '../hooks/useAbsence';
import { useFeedback } from '../hooks/useFeedback';
import { EmployeeHeader } from '../components/EmployeeHeader';
import { EmployeeBasicInfo } from '../components/EmployeeBasicInfo';
import { EmployeeSensitiveInfo } from '../components/EmployeeSensitiveInfo';
import { AbsenceSection } from '../components/AbsenceSection';
import { FeedbackSection } from '../components/FeedbackSection';

const EmployeeProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const employeeId = Number(id);

  // Custom hooks for data management
  const {
    employee,
    loading,
    error,
    editing,
    setEditing,
    editData,
    setEditData,
    handleSave,
    refreshEmployee,
  } = useEmployee(employeeId);

  const absence = useAbsence(employeeId, refreshEmployee);
  const feedback = useFeedback(employeeId, refreshEmployee);

  // Memoize permission checks to prevent recalculation on every render
  const canEdit = useMemo(() => user?.role === 'MANAGER' || user?.employeeId === employeeId, [user, employeeId]);
  const canRequestAbsence = useMemo(() => user?.employeeId === employeeId, [user, employeeId]);
  const isViewingOwnProfile = useMemo(() => user?.employeeId === employeeId, [user, employeeId]);
  const canLeaveFeedback = useMemo(() => (user?.role === 'COWORKER' || user?.role === 'MANAGER') && !isViewingOwnProfile, [user, isViewingOwnProfile]);
  const showSensitiveData = useMemo(() => user?.role === 'MANAGER' || user?.employeeId === employeeId, [user, employeeId]);

  const handleEditToggle = async () => {
    if (editing) {
      try {
        await handleSave();
      } catch (err) {
        alert('Failed to update profile');
      }
    } else {
      setEditing(true);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error || !employee) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <EmployeeHeader
          employee={employee}
          canEdit={canEdit}
          editing={editing}
          onEditToggle={handleEditToggle}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EmployeeBasicInfo
            employee={employee}
            editing={editing}
            editData={editData}
            onEditChange={setEditData}
          />

          {showSensitiveData && (
            <EmployeeSensitiveInfo employee={employee} />
          )}
        </div>
      </div>

      {canRequestAbsence && (
        <AbsenceSection
          absences={employee.absences}
          showForm={absence.showForm}
          formData={absence.formData}
          submitting={absence.submitting}
          onToggleForm={() => absence.setShowForm(!absence.showForm)}
          onFormChange={absence.setFormData}
          onSubmit={absence.handleSubmit}
          getTodayString={absence.getTodayString}
          getMinEndDate={absence.getMinEndDate}
        />
      )}

      {canLeaveFeedback && (
        <FeedbackSection
          feedbacks={employee.feedbacks}
          showForm={feedback.showForm}
          formData={feedback.formData}
          submitting={feedback.submitting}
          deletingId={feedback.deletingId}
          currentUsername={user?.username}
          onToggleForm={() => feedback.setShowForm(!feedback.showForm)}
          onFormChange={feedback.setFormData}
          onSubmit={feedback.handleSubmit}
          onDelete={feedback.handleDelete}
        />
      )}
    </div>
  );
};

export default EmployeeProfile;

