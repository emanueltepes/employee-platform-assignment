import { useEffect, useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { employeeApi } from '../api';
import type { Employee, PageResponse } from '../types';
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
  const [pageData, setPageData] = useState<PageResponse<Employee> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(9); // 9 employees per page (3x3 grid)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageInputValue, setPageInputValue] = useState('1');
  const { user } = useAuth();

  useEffect(() => {
    loadEmployees();
    setPageInputValue(String(currentPage + 1)); // Update input when page changes
  }, [currentPage]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeApi.getAllPaginated(currentPage, pageSize);
      setPageData(response.data);
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

  const employees = pageData?.content || [];
  const totalPages = pageData?.totalPages || 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Employee Directory</h1>
        <p className="mt-2 text-gray-600">
          Manage and view employee profiles ({pageData?.totalElements || 0} total)
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-col items-center space-y-4">
          {/* Page Navigation */}
          <div className="flex items-center space-x-2">
            {/* First Page */}
            <button
              onClick={() => setCurrentPage(0)}
              disabled={pageData?.first}
              className="px-3 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="First page"
            >
              «
            </button>

            {/* Previous */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={pageData?.first}
              className="px-3 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ‹
            </button>
            
            {/* Page Numbers */}
            <div className="flex space-x-1">
              {(() => {
                const pages = [];
                let startPage = Math.max(0, currentPage - 1);
                let endPage = Math.min(totalPages - 1, currentPage + 1);
                
                // Adjust if we're near the start
                if (currentPage < 2) {
                  endPage = Math.min(totalPages - 1, 2);
                }
                
                // Adjust if we're near the end
                if (currentPage > totalPages - 3) {
                  startPage = Math.max(0, totalPages - 3);
                }
                
                // Show ellipsis at start if needed
                if (startPage > 0) {
                  pages.push(
                    <span key="start-ellipsis" className="px-2 py-2 text-gray-500">
                      ...
                    </span>
                  );
                }
                
                // Show page numbers
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`px-3 py-2 rounded ${
                        currentPage === i
                          ? 'bg-primary-600 text-white font-semibold'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                }
                
                // Show ellipsis at end if needed
                if (endPage < totalPages - 1) {
                  pages.push(
                    <span key="end-ellipsis" className="px-2 py-2 text-gray-500">
                      ...
                    </span>
                  );
                }
                
                return pages;
              })()}
            </div>

            {/* Next */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={pageData?.last}
              className="px-3 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ›
            </button>

            {/* Last Page */}
            <button
              onClick={() => setCurrentPage(totalPages - 1)}
              disabled={pageData?.last}
              className="px-3 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Last page"
            >
              »
            </button>
          </div>

          {/* Page Info & Jump */}
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <span>Page</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={pageInputValue}
              onChange={(e) => setPageInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const page = parseInt(pageInputValue) - 1;
                  if (page >= 0 && page < totalPages) {
                    setCurrentPage(page);
                  } else {
                    setPageInputValue(String(currentPage + 1)); // Reset to current if invalid
                  }
                }
              }}
              onBlur={() => {
                const page = parseInt(pageInputValue) - 1;
                if (page >= 0 && page < totalPages) {
                  setCurrentPage(page);
                } else {
                  setPageInputValue(String(currentPage + 1)); // Reset to current if invalid
                }
              }}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span>of {totalPages}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

