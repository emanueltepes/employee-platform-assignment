import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi, metricsApi } from "../api";
import { useAuth } from "../AuthContext";
import { SystemMetrics } from "../components/SystemMetrics";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendWaking, setBackendWaking] = useState(true);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Wake up the backend as soon as the login page loads
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 60; 

    const wakeUpBackend = async () => {
      attempts++;
      try {
        console.log(`🌅 Attempt ${attempts}: Waking up backend (free tier)...`);

        
        await metricsApi.getHealth();

        console.log("✅ Backend is ready!");
        setBackendWaking(false);
      } catch (err) {
        console.log(
          `⏳ Attempt ${attempts}/${maxAttempts}: Backend still waking up...`
        );

        if (attempts < maxAttempts) {
          // Keep retrying every 3 seconds
          setTimeout(wakeUpBackend, 3000);
        } else {
          console.log(
            "⚠️ Backend wake-up timeout. User may need to manually refresh."
          );
          setBackendWaking(false); // Allow login attempt anyway
        }
      }
    };

    wakeUpBackend();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authApi.login({ username, password });
      login(response.data);
      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Hidden iframe to wake up backend - bypasses CORS issues */}
      <iframe
        src={
          import.meta.env.VITE_API_URL
            ? `${import.meta.env.VITE_API_URL}/actuator/health`
            : "http://localhost:8080/actuator/health"
        }
        style={{ display: "none" }}
        title="Backend Wake-up"
      />

      <SystemMetrics />

      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Backend Status Banner */}
          {backendWaking && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                  <p className="text-sm text-yellow-800">
                    Waking up backend (free tier)... This may take a while...
                  </p>
                </div>
                <a
                  href="https://employee-platform-assignment.onrender.com/actuator/health"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-yellow-700 hover:text-yellow-900 underline"
                >
                  Check backend status directly →
                </a>
              </div>
            </div>
          )}

          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              HR Platform
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sign in to your account
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  required
                  className="input"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="input"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || backendWaking}
                className="w-full btn btn-primary disabled:opacity-75"
              >
                {backendWaking
                  ? "Waiting for backend..."
                  : loading
                  ? "Signing in..."
                  : "Sign in"}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Register here
                </Link>
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm font-semibold text-blue-800 mb-2">
                Test Credentials:
              </p>
              <div className="text-xs text-blue-700 space-y-1">
                <p>
                  Manager: username:{" "}
                  <code className="bg-blue-100 px-1 rounded">manager</code>,
                  password:{" "}
                  <code className="bg-blue-100 px-1 rounded">password123</code>
                </p>
                <p>
                  Employee: username:{" "}
                  <code className="bg-blue-100 px-1 rounded">employee</code>,
                  password:{" "}
                  <code className="bg-blue-100 px-1 rounded">password123</code>
                </p>
                <p>
                  Coworker: username:{" "}
                  <code className="bg-blue-100 px-1 rounded">coworker</code>,
                  password:{" "}
                  <code className="bg-blue-100 px-1 rounded">password123</code>
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-xs text-blue-600">
                  <span className="font-medium">Backend API:</span>{" "}
                  <a
                    href="https://employee-platform-assignment.onrender.com/actuator/health"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-800"
                  >
                    Health Endpoint
                  </a>
                  {" • "}
                  <a
                    href="https://employee-platform-assignment.onrender.com/actuator/metrics"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-800"
                  >
                    Metrics
                  </a>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
