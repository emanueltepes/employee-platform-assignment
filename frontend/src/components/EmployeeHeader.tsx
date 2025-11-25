import type { Employee } from '../types';

interface EmployeeHeaderProps {
  employee: Employee;
  canEdit: boolean;
  editing: boolean;
  editData: Partial<Employee>;
  onEditToggle: () => void;
  onEditChange: (data: Partial<Employee>) => void;
  isManager: boolean;
}

export const EmployeeHeader = ({ employee, canEdit, editing, editData, onEditToggle, onEditChange, isManager }: EmployeeHeaderProps) => {
  return (
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-center space-x-4">
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
          <span className="text-3xl font-bold text-primary-600">
            {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
          </span>
        </div>
        <div className="flex-1">
          {editing && isManager ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  className="input text-3xl font-bold"
                  value={editData.firstName || ''}
                  onChange={(e) => onEditChange({ ...editData, firstName: e.target.value })}
                  placeholder="First Name"
                />
                <input
                  className="input text-3xl font-bold"
                  value={editData.lastName || ''}
                  onChange={(e) => onEditChange({ ...editData, lastName: e.target.value })}
                  placeholder="Last Name"
                />
              </div>
              <input
                className="input text-lg w-full"
                value={editData.position || ''}
                onChange={(e) => onEditChange({ ...editData, position: e.target.value })}
                placeholder="Position"
              />
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900">
                {employee.firstName} {employee.lastName}
              </h1>
              <p className="text-lg text-gray-600">{employee.position}</p>
            </>
          )}
        </div>
      </div>
      {canEdit && (
        <button
          onClick={onEditToggle}
          className="btn btn-primary"
        >
          {editing ? 'Save' : 'Edit'}
        </button>
      )}
    </div>
  );
};

