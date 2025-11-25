import type { Employee } from '../types';

interface EmployeeSensitiveInfoProps {
  employee: Employee;
  editing: boolean;
  editData: Partial<Employee>;
  onEditChange: (data: Partial<Employee>) => void;
  isManager: boolean;
}

export const EmployeeSensitiveInfo = ({ employee, editing, editData, onEditChange, isManager }: EmployeeSensitiveInfoProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Sensitive Information</h3>
      <dl className="space-y-2">
        <div>
          <dt className="text-sm font-medium text-gray-500">Salary</dt>
          <dd className="text-sm text-gray-900">
            {editing && isManager ? (
              <input
                type="number"
                className="input"
                value={editData.salary || ''}
                onChange={(e) => onEditChange({ ...editData, salary: parseFloat(e.target.value) || 0 })}
              />
            ) : (
              employee.salary ? `$${employee.salary.toLocaleString()}` : 'N/A'
            )}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
          <dd className="text-sm text-gray-900">
            {editing && isManager ? (
              <input
                type="date"
                className="input"
                value={editData.dateOfBirth || ''}
                onChange={(e) => onEditChange({ ...editData, dateOfBirth: e.target.value })}
              />
            ) : (
              employee.dateOfBirth || 'N/A'
            )}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Hire Date</dt>
          <dd className="text-sm text-gray-900">
            {editing && isManager ? (
              <input
                type="date"
                className="input"
                value={editData.hireDate || ''}
                onChange={(e) => onEditChange({ ...editData, hireDate: e.target.value })}
              />
            ) : (
              employee.hireDate || 'N/A'
            )}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Address</dt>
          <dd className="text-sm text-gray-900">
            {editing ? (
              <input
                className="input"
                value={editData.address || ''}
                onChange={(e) => onEditChange({ ...editData, address: e.target.value })}
                placeholder="Contact information - editable by all"
              />
            ) : (
              employee.address || 'N/A'
            )}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Emergency Contact</dt>
          <dd className="text-sm text-gray-900">
            {editing ? (
              <input
                className="input"
                value={editData.emergencyContact || ''}
                onChange={(e) => onEditChange({ ...editData, emergencyContact: e.target.value })}
                placeholder="Contact information - editable by all"
              />
            ) : (
              employee.emergencyContact || 'N/A'
            )}
          </dd>
        </div>
        {isManager && (
          <>
            <div>
              <dt className="text-sm font-medium text-gray-500">Social Security Number</dt>
              <dd className="text-sm text-gray-900">
                {editing ? (
                  <input
                    className="input"
                    value={editData.socialSecurityNumber || ''}
                    onChange={(e) => onEditChange({ ...editData, socialSecurityNumber: e.target.value })}
                  />
                ) : (
                  employee.socialSecurityNumber || 'N/A'
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Bank Account</dt>
              <dd className="text-sm text-gray-900">
                {editing ? (
                  <input
                    className="input"
                    value={editData.bankAccount || ''}
                    onChange={(e) => onEditChange({ ...editData, bankAccount: e.target.value })}
                  />
                ) : (
                  employee.bankAccount || 'N/A'
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Contract Type</dt>
              <dd className="text-sm text-gray-900">
                {editing ? (
                  <input
                    className="input"
                    value={editData.contractType || ''}
                    onChange={(e) => onEditChange({ ...editData, contractType: e.target.value })}
                  />
                ) : (
                  employee.contractType || 'N/A'
                )}
              </dd>
            </div>
          </>
        )}
      </dl>
    </div>
  );
};

