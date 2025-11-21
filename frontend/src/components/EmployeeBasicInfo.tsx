import type { Employee } from '../types';

interface EmployeeBasicInfoProps {
  employee: Employee;
  editing: boolean;
  editData: Partial<Employee>;
  onEditChange: (data: Partial<Employee>) => void;
}

export const EmployeeBasicInfo = ({ employee, editing, editData, onEditChange }: EmployeeBasicInfoProps) => {
  return (
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
                onChange={(e) => onEditChange({ ...editData, department: e.target.value })}
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
  );
};

