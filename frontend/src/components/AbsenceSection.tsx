import type { Absence, AbsenceRequest } from '../types';

interface AbsenceSectionProps {
  absences?: Absence[];
  showForm: boolean;
  formData: AbsenceRequest;
  editFormData: AbsenceRequest;
  submitting: boolean;
  editingId: number | null;
  deletingId: number | null;
  updatingStatusId: number | null;
  isManager: boolean;
  isOwnProfile: boolean;
  onToggleForm: () => void;
  onFormChange: (data: AbsenceRequest) => void;
  onEditFormChange: (data: AbsenceRequest) => void;
  onSubmit: (e: React.FormEvent) => void;
  onEdit: (absence: Absence) => void;
  onCancelEdit: () => void;
  onUpdateSubmit: (absenceId: number, e: React.FormEvent) => void;
  onUpdateStatus: (absenceId: number, status: 'APPROVED' | 'REJECTED') => void;
  onDelete: (absenceId: number) => void;
  getTodayString: () => string;
  getMinEndDate: () => string;
}

export const AbsenceSection = ({
  absences,
  showForm,
  formData,
  editFormData,
  submitting,
  editingId,
  deletingId,
  updatingStatusId,
  isManager,
  isOwnProfile,
  onToggleForm,
  onFormChange,
  onEditFormChange,
  onSubmit,
  onEdit,
  onCancelEdit,
  onUpdateSubmit,
  onUpdateStatus,
  onDelete,
  getTodayString,
  getMinEndDate,
}: AbsenceSectionProps) => {
  // Helper function to get minimum end date for editing
  const getMinEndDateForEdit = (startDate: string) => {
    if (!startDate) return getTodayString();
    const start = startDate;
    const today = getTodayString();
    return start > today ? start : today;
  };
  
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {isOwnProfile ? 'Request Absence' : 'Absence Requests'}
        </h2>
        {isOwnProfile && (
          <button
            onClick={onToggleForm}
            className="btn btn-primary"
          >
            {showForm ? 'Cancel' : 'New Request'}
          </button>
        )}
      </div>

      {showForm && isOwnProfile && (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                className="input"
                value={formData.startDate}
                min={getTodayString()}
                onChange={(e) => onFormChange({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                required
                className="input"
                value={formData.endDate}
                min={getMinEndDate()}
                onChange={(e) => onFormChange({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              className="input"
              value={formData.type}
              onChange={(e) => onFormChange({ ...formData, type: e.target.value as any })}
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
              value={formData.reason}
              onChange={(e) => onFormChange({ ...formData, reason: e.target.value })}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      )}

      <div className="mt-6">
        <h3 className="font-semibold mb-3">Absence History</h3>
        {absences && absences.length > 0 ? (
          <div className="space-y-3">
            {absences.map((absence) => (
              <div key={absence.id} className="border rounded p-4 bg-gray-50">
                {/* Editing Mode */}
                {editingId === absence.id ? (
                  <form onSubmit={(e) => onUpdateSubmit(absence.id, e)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          required
                          className="input"
                          value={editFormData.startDate}
                          min={getTodayString()}
                          onChange={(e) => onEditFormChange({ ...editFormData, startDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          required
                          className="input"
                          value={editFormData.endDate}
                          min={getMinEndDateForEdit(editFormData.startDate)}
                          onChange={(e) => onEditFormChange({ ...editFormData, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        className="input"
                        value={editFormData.type}
                        onChange={(e) => onEditFormChange({ ...editFormData, type: e.target.value as any })}
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
                        value={editFormData.reason}
                        onChange={(e) => onEditFormChange({ ...editFormData, reason: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        type="submit" 
                        className="btn btn-primary text-sm py-1 px-3"
                        disabled={submitting}
                      >
                        {submitting ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button 
                        type="button"
                        onClick={onCancelEdit}
                        className="btn bg-gray-500 hover:bg-gray-600 text-white text-sm py-1 px-3"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  /* View Mode */
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-medium text-lg">{absence.type.replace(/_/g, ' ')}</span>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(absence.startDate).toLocaleDateString()} to {new Date(absence.endDate).toLocaleDateString()}
                        </p>
                        {absence.reason && (
                          <p className="text-sm text-gray-700 mt-2">
                            <span className="font-medium">Reason:</span> {absence.reason}
                          </p>
                        )}
                        {absence.approvedBy && (
                          <p className="text-xs text-gray-500 mt-1">
                            {absence.status === 'APPROVED' ? 'Approved' : 'Rejected'} by {absence.approvedBy}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded text-sm font-medium ${
                          absence.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          absence.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          absence.status === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {absence.status}
                        </span>
                      </div>
                    </div>

                    {/* Manager Actions */}
                    {isManager && absence.status === 'PENDING' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t">
                        <button
                          onClick={() => onUpdateStatus(absence.id, 'APPROVED')}
                          disabled={updatingStatusId === absence.id}
                          className="btn bg-green-600 hover:bg-green-700 text-white text-sm py-1 px-3 disabled:opacity-50"
                        >
                          {updatingStatusId === absence.id ? 'Updating...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => onUpdateStatus(absence.id, 'REJECTED')}
                          disabled={updatingStatusId === absence.id}
                          className="btn bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 disabled:opacity-50"
                        >
                          {updatingStatusId === absence.id ? 'Updating...' : 'Reject'}
                        </button>
                      </div>
                    )}

                    {/* Employee Actions (own profile only, pending requests only, not managers) */}
                    {isOwnProfile && absence.status === 'PENDING' && !isManager && (
                      <div className="flex gap-2 mt-3 pt-3 border-t">
                        <button
                          onClick={() => onEdit(absence)}
                          className="btn bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(absence.id)}
                          disabled={deletingId === absence.id}
                          className="btn bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 disabled:opacity-50"
                        >
                          {deletingId === absence.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-600 font-medium">No absence requests yet</p>
            <p className="text-sm text-gray-500 mt-1">
              {isOwnProfile ? "Click 'New Request' to create your first absence request" : "This employee hasn't requested any absences"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

