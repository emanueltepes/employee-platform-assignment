import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { SystemMetrics } from './SystemMetrics';
import { useState, useEffect } from 'react';
import { absenceApi } from '../api';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState<number>(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fetch pending absences count for managers
  const fetchPendingCount = async () => {
    if (user?.role === 'MANAGER') {
      try {
        const response = await absenceApi.getPendingCount();
        setPendingCount(response.data);
      } catch (err) {
        console.error('Failed to fetch pending count:', err);
      }
    }
  };

  useEffect(() => {
    fetchPendingCount();
    
    if (user?.role === 'MANAGER') {
      // Refresh every 10 seconds (more responsive)
      const interval = setInterval(fetchPendingCount, 10000);
      
      // Listen for custom refresh event
      const handleRefresh = () => {
        console.log('🔔 Refreshing pending count badge...');
        fetchPendingCount();
      };
      window.addEventListener('refreshAbsenceCount', handleRefresh);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('refreshAbsenceCount', handleRefresh);
      };
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* System Metrics Bar */}
      <SystemMetrics />
      
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl font-bold text-primary-600">
                NEWWORK HR
              </Link>
              <div className="flex space-x-4">
                <Link 
                  to="/" 
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Employees
                </Link>
                {user?.role === 'MANAGER' && (
                  <Link 
                    to="/absences" 
                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors relative"
                  >
                    Absences
                    {pendingCount > 0 && (
                      <span className="absolute -top-2 -right-6 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                {user?.username} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

