import type { Employee } from '../types';

interface EmployeeHeaderProps {
  employee: Employee;
  canEdit: boolean;
  editing: boolean;
  onEditToggle: () => void;
}

export const EmployeeHeader = ({ employee, canEdit, editing, onEditToggle }: EmployeeHeaderProps) => {
  return (
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
          onClick={onEditToggle}
          className="btn btn-primary"
        >
          {editing ? 'Save' : 'Edit'}
        </button>
      )}
    </div>
  );
};

