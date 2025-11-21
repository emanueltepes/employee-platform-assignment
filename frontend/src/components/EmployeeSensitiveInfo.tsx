import type { Employee } from '../types';

interface EmployeeSensitiveInfoProps {
  employee: Employee;
}

export const EmployeeSensitiveInfo = ({ employee }: EmployeeSensitiveInfoProps) => {
  return (
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
  );
};

