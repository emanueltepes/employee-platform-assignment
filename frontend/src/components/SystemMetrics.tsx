import { useState, useEffect } from 'react';
import { metricsApi } from '../api';
import type { SystemHealth, MetricValue } from '../types';

export const SystemMetrics = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [apiCalls, setApiCalls] = useState<number>(0);
  const [error, setError] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchMetrics = async () => {
    try {
      // Fetch health status
      const healthRes = await metricsApi.getHealth();
      setHealth(healthRes.data);
      setError(false);

      // Fetch HuggingFace API call count with cache busting
      try {
        const apiCallsRes = await metricsApi.getMetric('huggingface.api.calls');
        const metric = apiCallsRes.data as MetricValue;
        const count = metric.measurements.find(m => m.statistic === 'COUNT')?.value || 0;
        const roundedCount = Math.round(count);
        
        console.log('📊 Metrics Update:', {
          timestamp: new Date().toLocaleTimeString(),
          aiCalls: roundedCount,
          rawValue: count,
          previousCount: apiCalls
        });
        
        setApiCalls(roundedCount);
        setLastUpdate(new Date());
      } catch (err) {
        console.log('AI calls metric not available yet:', err);
        setApiCalls(0);
      }
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
      setError(true);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Refresh every 5 seconds for more responsive updates
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  // Show header even if there's an error, with fallback values
  const healthStatus = health?.status || (error ? 'DOWN' : 'LOADING');
  
  // Extract circuit breaker state - handle both string and object responses
  const getCBState = () => {
    try {
      const cbData = health?.components?.circuitBreakers?.details?.huggingface;
      if (!cbData) return 'CLOSED';
      if (typeof cbData === 'string') return cbData;
      // Handle object response
      if (typeof cbData === 'object') {
        const objData = cbData as any;
        return String(objData.status || objData.state || 'CLOSED');
      }
      return 'CLOSED';
    } catch {
      return 'CLOSED';
    }
  };
  const cbState = getCBState();
  
  const dbStatus = health?.components?.db?.status || 'UP';
  const redisStatus = health?.components?.redis?.status || 'UNKNOWN';

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left: System Status */}
          <div className="flex items-center space-x-6">
            {/* Health Status */}
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  healthStatus === 'UP' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}
              />
              <span className="text-sm font-medium text-gray-700">
                System: <span className={healthStatus === 'UP' ? 'text-green-600' : 'text-red-600'}>
                  {healthStatus}
                </span>
              </span>
            </div>

            {/* Database Status */}
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
              <span className="text-sm text-gray-600">
                DB: <span className={dbStatus === 'UP' ? 'text-green-600' : 'text-red-600'}>
                  {dbStatus}
                </span>
              </span>
            </div>

            {/* Redis Cache Status */}
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              <span className="text-sm text-gray-600">
                Cache: <span className={
                  redisStatus === 'UP' ? 'text-green-600' : 
                  redisStatus === 'UNKNOWN' ? 'text-gray-400' : 
                  'text-red-600'
                }>
                  {redisStatus}
                </span>
              </span>
            </div>

            {/* Circuit Breaker Status */}
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-sm text-gray-600">
                Circuit Breaker: <span className={
                  cbState === 'CLOSED' ? 'text-green-600' : 
                  cbState === 'OPEN' ? 'text-red-600' : 
                  'text-yellow-600'
                }>
                  {cbState}
                </span>
              </span>
            </div>

            {/* API Call Counter */}
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm text-gray-600">
                AI Calls: <span 
                  className={`font-semibold transition-colors ${apiCalls > 0 ? 'text-purple-600' : 'text-indigo-600'}`}
                  title={`Last updated: ${lastUpdate.toLocaleTimeString()}`}
                >
                  {apiCalls}
                </span>
                <span className="text-xs text-gray-400 ml-1">
                  (updates every 5s)
                </span>
              </span>
            </div>
          </div>

          {/* Right: Refresh button */}
          <button
            onClick={fetchMetrics}
            className="text-sm text-gray-600 hover:text-gray-700 p-1 rounded hover:bg-white/50"
            title="Refresh metrics"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

