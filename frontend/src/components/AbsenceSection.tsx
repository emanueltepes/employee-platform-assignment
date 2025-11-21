import type { Absence, AbsenceRequest } from '../types';

interface AbsenceSectionProps {
  absences?: Absence[];
  showForm: boolean;
  formData: AbsenceRequest;
  submitting: boolean;
  onToggleForm: () => void;
  onFormChange: (data: AbsenceRequest) => void;
  onSubmit: (e: React.FormEvent) => void;
  getTodayString: () => string;
  getMinEndDate: () => string;
}

export const AbsenceSection = ({
  absences,
  showForm,
  formData,
  submitting,
  onToggleForm,
  onFormChange,
  onSubmit,
  getTodayString,
  getMinEndDate,
}: AbsenceSectionProps) => {
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Request Absence</h2>
        <button
          onClick={onToggleForm}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : 'New Request'}
        </button>
      </div>

      {showForm && (
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

      {absences && absences.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-3">Absence History</h3>
          <div className="space-y-2">
            {absences.map((absence) => (
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
  );
};

