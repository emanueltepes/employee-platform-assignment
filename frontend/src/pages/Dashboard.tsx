import { useEffect, useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { employeeApi } from '../api';
import type { Employee } from '../types';
import { useAuth } from '../AuthContext';

// Memoized employee card component to prevent unnecessary re-renders
const EmployeeCard = memo(({ employee }: { employee: Employee }) => (
  <Link
    to={`/employee/${employee.id}`}
    className="card hover:shadow-lg transition-shadow"
  >
    <div className="flex items-center space-x-4">
      <div className="flex-shrink-0">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-primary-600">
            {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
          </span>
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">
          {employee.firstName} {employee.lastName}
        </h3>
        <p className="text-sm text-gray-600">{employee.position || 'N/A'}</p>
        <p className="text-sm text-gray-500">{employee.department || 'N/A'}</p>
      </div>
    </div>
  </Link>
));

EmployeeCard.displayName = 'EmployeeCard';

const Dashboard = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await employeeApi.getAll();
      setEmployees(response.data);
    } catch (err: any) {
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Employee Directory</h1>
        <p className="mt-2 text-gray-600">
          Manage and view employee profiles
        </p>
      </div>

      <div className="mb-6">
        <Link
          to={`/employee/${user?.employeeId}`}
          className="btn btn-primary inline-block"
        >
          View My Profile
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

