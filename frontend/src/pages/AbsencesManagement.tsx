import { useState, useEffect } from "react";
import { absenceApi, employeeApi } from "../api";
import type { Absence, Employee } from "../types";
import { useAuth } from "../AuthContext";

type FilterStatus = "ALL" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

const AbsencesManagement = () => {
  const { user } = useAuth();
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [employees, setEmployees] = useState<Map<number, Employee>>(new Map());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("PENDING");
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Redirect if not manager
  useEffect(() => {
    if (user?.role !== "MANAGER") {
      window.location.href = "/";
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch all absences and employees
      const [absencesRes, employeesRes] = await Promise.all([
        absenceApi.getAll(),
        employeeApi.getAll({ page: 0, size: 1000 }),
      ]);

      setAbsences(absencesRes.data);

      // Create a map of employee ID to employee for quick lookup
      const empMap = new Map<number, Employee>();
      const empList = Array.isArray(employeesRes.data)
        ? employeesRes.data
        : employeesRes.data.content || [];

      empList.forEach((emp: Employee) => {
        empMap.set(emp.id, emp);
      });
      setEmployees(empMap);
    } catch (err) {
      console.error("Failed to load data:", err);
      alert("Failed to load absences");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    absenceId: number,
    status: "APPROVED" | "REJECTED"
  ) => {
    console.log(
      `[AbsencesManagement] Updating absence ${absenceId} to ${status}`
    );
    setUpdatingStatusId(absenceId);
    try {
      const response = await absenceApi.updateStatus(absenceId, status);
      console.log(
        `[AbsencesManagement] Update successful, response:`,
        response.data
      );
      await loadData(); // Reload data
      console.log(`[AbsencesManagement] Data reloaded after status update`);
      alert(`Absence request ${status.toLowerCase()} successfully!`);
    } catch (err: any) {
      console.error(`[AbsencesManagement] Failed to update status:`, err);
      alert(err.response?.data?.message || "Failed to update absence status");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Filter and search absences
  const filteredAbsences = absences.filter((absence) => {
    // Status filter
    if (filter !== "ALL" && absence.status !== filter) {
      return false;
    }

    // Search filter (by employee name)
    if (searchTerm) {
      const employee = employees.get(absence.employeeId);
      if (employee) {
        const fullName =
          `${employee.firstName} ${employee.lastName}`.toLowerCase();
        if (!fullName.includes(searchTerm.toLowerCase())) {
          return false;
        }
      }
    }

    return true;
  });

  // Sort by date (most recent first)
  const sortedAbsences = [...filteredAbsences].sort((a, b) => {
    return (
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime()
    );
  });

  // Statistics
  const stats = {
    total: absences.length,
    pending: absences.filter((a) => a.status === "PENDING").length,
    approved: absences.filter((a) => a.status === "APPROVED").length,
    rejected: absences.filter((a) => a.status === "REJECTED").length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading absences...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Absence Management</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-blue-50 border-blue-200">
          <div className="text-sm text-blue-600 font-medium">
            Total Requests
          </div>
          <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
        </div>
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="text-sm text-yellow-600 font-medium">Pending</div>
          <div className="text-3xl font-bold text-yellow-900">
            {stats.pending}
          </div>
        </div>
        <div className="card bg-green-50 border-green-200">
          <div className="text-sm text-green-600 font-medium">Approved</div>
          <div className="text-3xl font-bold text-green-900">
            {stats.approved}
          </div>
        </div>
        <div className="card bg-red-50 border-red-200">
          <div className="text-sm text-red-600 font-medium">Rejected</div>
          <div className="text-3xl font-bold text-red-900">
            {stats.rejected}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === "ALL"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All ({absences.length})
            </button>
            <button
              onClick={() => setFilter("PENDING")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === "PENDING"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setFilter("APPROVED")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === "APPROVED"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Approved ({stats.approved})
            </button>
            <button
              onClick={() => setFilter("REJECTED")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === "REJECTED"
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Rejected ({stats.rejected})
            </button>
          </div>

          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search by employee name..."
              className="input w-full md:w-96"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Absences List */}
      <div className="space-y-3">
        {sortedAbsences.length === 0 ? (
          <div className="card text-center text-gray-500 py-8">
            No absence requests found for the selected filter.
          </div>
        ) : (
          sortedAbsences.map((absence) => {
            const employee = employees.get(absence.employeeId);
            return (
              <div
                key={absence.id}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Employee Info & Absence Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-primary-100 text-primary-700 font-bold text-lg rounded-full w-10 h-10 flex items-center justify-center">
                        {employee?.firstName?.[0]}
                        {employee?.lastName?.[0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {employee
                            ? `${employee.firstName} ${employee.lastName}`
                            : "Unknown Employee"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {employee?.position} • {employee?.department}
                        </p>
                      </div>
                    </div>

                    <div className="ml-13 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Type:</span>
                        <span className="text-gray-900">
                          {absence.type.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">
                          Dates:
                        </span>
                        <span className="text-gray-900">
                          {new Date(absence.startDate).toLocaleDateString()} →{" "}
                          {new Date(absence.endDate).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-gray-500">
                          (
                          {Math.ceil(
                            (new Date(absence.endDate).getTime() -
                              new Date(absence.startDate).getTime()) /
                              (1000 * 60 * 60 * 24)
                          ) + 1}{" "}
                          days)
                        </span>
                      </div>
                      {absence.reason && (
                        <div className="flex gap-2">
                          <span className="font-medium text-gray-700">
                            Reason:
                          </span>
                          <span className="text-gray-900">
                            {absence.reason}
                          </span>
                        </div>
                      )}
                      {absence.approvedBy && (
                        <div className="flex gap-2">
                          <span className="font-medium text-gray-700">
                            {absence.status === "APPROVED"
                              ? "Approved"
                              : "Rejected"}{" "}
                            by:
                          </span>
                          <span className="text-gray-900">
                            {absence.approvedBy}
                          </span>
                        </div>
                      )}
                      {absence.createdAt && (
                        <div className="text-xs text-gray-500 mt-1">
                          Requested:{" "}
                          {new Date(absence.createdAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Badge & Actions */}
                  <div className="flex flex-col items-end gap-3">
                    <span
                      className={`px-4 py-2 rounded-lg text-sm font-bold ${
                        absence.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : absence.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : absence.status === "CANCELLED"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {absence.status}
                    </span>

                    {absence.status === "PENDING" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleUpdateStatus(absence.id, "APPROVED")
                          }
                          disabled={updatingStatusId === absence.id}
                          className="btn bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-4 disabled:opacity-50"
                        >
                          {updatingStatusId === absence.id
                            ? "Updating..."
                            : "✓ Approve"}
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateStatus(absence.id, "REJECTED")
                          }
                          disabled={updatingStatusId === absence.id}
                          className="btn bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-4 disabled:opacity-50"
                        >
                          {updatingStatusId === absence.id
                            ? "Updating..."
                            : "✗ Reject"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AbsencesManagement;
