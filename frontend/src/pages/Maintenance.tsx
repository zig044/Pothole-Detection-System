import { useEffect, useState } from "react";
import api from "../services/api";

type Report = {
  id: number;
  image_path: string;
  description: string | null;
  severity: string;
  latitude: number | null;
  longitude: number | null;
  confidence: number;
  priority_score: number | null;
  priority_level: string | null;
  status: string;
  created_at: string;
};

function Maintenance() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState<
    Record<number, string>
  >({});

  const [updatingId, setUpdatingId] = useState<number | null>(null);

  async function loadReports() {
    try {
      setRefreshing(true);

      const response = await api.get(
        `/reports/?t=${Date.now()}`
      );

      const data: Report[] = response.data;

      console.log(
        "Maintenance reports received:",
        data.length
      );

      const sortedReports = [...data].sort((a, b) => {
        if (
          a.priority_score !== null &&
          b.priority_score === null
        ) {
          return -1;
        }

        if (
          a.priority_score === null &&
          b.priority_score !== null
        ) {
          return 1;
        }

        if (
          a.priority_score !== null &&
          b.priority_score !== null
        ) {
          return b.priority_score - a.priority_score;
        }

        return (
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
        );
      });

      setReports(sortedReports);

      const statusValues: Record<number, string> = {};

      data.forEach((report) => {
        statusValues[report.id] = report.status;
      });

      setSelectedStatus(statusValues);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function updateStatus(reportId: number) {
    const newStatus = selectedStatus[reportId];

    if (!newStatus) {
      return;
    }

    try {
      setUpdatingId(reportId);

      await api.put(
        `/reports/${reportId}/status`,
        null,
        {
          params: {
            status: newStatus,
          },
        }
      );

      await loadReports();
    } catch (error) {
      console.error(
        "Error updating report status:",
        error
      );

      alert("Failed to update report status.");
    } finally {
      setUpdatingId(null);
    }
  }

  const criticalCount = reports.filter(
    (report) =>
      report.priority_level?.toLowerCase() === "critical"
  ).length;

  const highCount = reports.filter(
    (report) =>
      report.priority_level?.toLowerCase() === "high"
  ).length;

  const pendingCount = reports.filter(
    (report) =>
      report.status?.toLowerCase() === "pending"
  ).length;

  const getPriorityStyle = (
    level: string | null
  ) => {
    switch (level?.toLowerCase()) {
      case "critical":
        return {
          badge:
            "bg-red-50 text-red-700 border-red-200",
          dot: "bg-red-500",
          score: "text-red-600",
          bar: "bg-red-500",
        };

      case "high":
        return {
          badge:
            "bg-orange-50 text-orange-700 border-orange-200",
          dot: "bg-orange-500",
          score: "text-orange-600",
          bar: "bg-orange-500",
        };

      case "medium":
        return {
          badge:
            "bg-yellow-50 text-yellow-700 border-yellow-200",
          dot: "bg-yellow-500",
          score: "text-yellow-600",
          bar: "bg-yellow-500",
        };

      case "low":
        return {
          badge:
            "bg-green-50 text-green-700 border-green-200",
          dot: "bg-green-500",
          score: "text-green-600",
          bar: "bg-green-500",
        };

      default:
        return {
          badge:
            "bg-slate-50 text-slate-600 border-slate-200",
          dot: "bg-slate-400",
          score: "text-slate-600",
          bar: "bg-slate-400",
        };
    }
  };

  const getSeverityStyle = (
    severity: string
  ) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "bg-red-50 text-red-700";

      case "medium":
        return "bg-yellow-50 text-yellow-700";

      case "low":
        return "bg-green-50 text-green-700";

      default:
        return "bg-slate-50 text-slate-600";
    }
  };

  const getStatusStyle = (
    status: string
  ) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-blue-50 text-blue-700";

      case "verified":
        return "bg-cyan-50 text-cyan-700";

      case "resolved":
        return "bg-green-50 text-green-700";

      case "in_progress":
        return "bg-purple-50 text-purple-700";

      case "rejected":
        return "bg-red-50 text-red-700";

      default:
        return "bg-slate-50 text-slate-600";
    }
  };

  const formatStatus = (
    status: string
  ) => {
    return status
      .replace("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">

            <div className="h-8 w-64 bg-slate-200 rounded mb-3" />

            <div className="h-4 w-96 bg-slate-200 rounded mb-8" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-28 bg-white rounded-2xl border border-slate-200"
                />
              ))}
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">

          <div>
            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center">
                <span className="text-white text-xl">
                  ⚒
                </span>
              </div>

              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Maintenance
                </h1>

                <p className="text-slate-500 mt-1">
                  Prioritize potholes based on urgency and maintenance needs.
                </p>
              </div>

            </div>
          </div>

          <button
            onClick={loadReports}
            disabled={refreshing}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition disabled:opacity-50"
          >
            {refreshing
              ? "Refreshing..."
              : "↻ Refresh"}
          </button>

        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

          {/* TOTAL */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Reports
                </p>

                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {reports.length}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <span className="text-xl">
                  📋
                </span>
              </div>

            </div>

            <p className="text-xs text-slate-400 mt-3">
              All reported potholes
            </p>

          </div>

          {/* CRITICAL */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Critical
                </p>

                <p className="text-3xl font-bold text-red-600 mt-2">
                  {criticalCount}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
                <span className="text-xl">
                  ⚠
                </span>
              </div>

            </div>

            <p className="text-xs text-slate-400 mt-3">
              Highest priority
            </p>

          </div>

          {/* HIGH */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  High Priority
                </p>

                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {highCount}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
                <span className="text-xl">
                  !
                </span>
              </div>

            </div>

            <p className="text-xs text-slate-400 mt-3">
              Requires attention
            </p>

          </div>

          {/* PENDING */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Pending
                </p>

                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {pendingCount}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <span className="text-xl">
                  ◷
                </span>
              </div>

            </div>

            <p className="text-xs text-slate-400 mt-3">
              Awaiting maintenance
            </p>

          </div>

        </div>

        {/* PRIORITY QUEUE */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

          <div className="px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Priority Queue
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Reports are ordered from highest to lowest priority score.
              </p>
            </div>

            <div className="text-sm text-slate-500">
              {reports.length} reports
            </div>

          </div>

          {/* REPORT LIST */}
          <div className="divide-y divide-slate-100">

            {reports.length === 0 ? (
              <div className="p-10 text-center">

                <div className="text-4xl mb-3">
                  📭
                </div>

                <h3 className="font-semibold text-slate-900">
                  No reports found
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Pothole reports will appear here.
                </p>

              </div>
            ) : (
              reports.map((report, index) => {

                const priority =
                  getPriorityStyle(
                    report.priority_level
                  );

                const currentStatus =
                  selectedStatus[report.id] ??
                  report.status;

                const statusChanged =
                  currentStatus !== report.status;

                return (
                  <div
                    key={report.id}
                    className="p-6 hover:bg-slate-50 transition"
                  >

                    <div className="flex flex-col xl:flex-row xl:items-center gap-6">

                      {/* RANK */}
                      <div className="flex items-center gap-4 xl:w-16">

                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                          #{index + 1}
                        </div>

                      </div>

                      {/* MAIN INFO */}
                      <div className="flex-1 min-w-0">

                        <div className="flex flex-wrap items-center gap-3 mb-2">

                          <h3 className="text-lg font-bold text-slate-900">
                            Report #{report.id}
                          </h3>

                          <span
                            className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wide ${priority.badge}`}
                          >
                            <span
                              className={`inline-block w-1.5 h-1.5 rounded-full ${priority.dot} mr-1.5`}
                            />

                            {report.priority_level ||
                              "Not Available"}
                          </span>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getSeverityStyle(
                              report.severity
                            )}`}
                          >
                            {report.severity} severity
                          </span>

                        </div>

                        <p className="text-sm text-slate-500 mb-4 truncate">
                          {report.description ||
                            "No description provided"}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                          <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wide">
                              YOLO Confidence
                            </p>

                            <p className="font-semibold text-slate-800 mt-1">
                              {(
                                report.confidence *
                                100
                              ).toFixed(1)}
                              %
                            </p>
                          </div>

                          {/* CURRENT STATUS */}
                          <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wide">
                              Current Status
                            </p>

                            <span
                              className={`inline-block mt-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusStyle(
                                report.status
                              )}`}
                            >
                              {formatStatus(
                                report.status
                              )}
                            </span>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wide">
                              Location
                            </p>

                            <p className="font-semibold text-slate-800 mt-1">
                              {report.latitude !==
                                null &&
                              report.longitude !==
                                null
                                ? `${report.latitude.toFixed(
                                    3
                                  )}, ${report.longitude.toFixed(
                                    3
                                  )}`
                                : "Not available"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wide">
                              Reported
                            </p>

                            <p className="font-semibold text-slate-800 mt-1">
                              {new Date(
                                report.created_at
                              ).toLocaleDateString()}
                            </p>
                          </div>

                        </div>

                        {/* STATUS UPDATE */}
                        <div className="mt-5 pt-5 border-t border-slate-100">

                          <div className="flex flex-col sm:flex-row sm:items-end gap-3">

                            <div className="flex-1 max-w-xs">

                              <label className="block text-xs font-semibold text-slate-500 mb-2">
                                Update Status
                              </label>

                              <select
                                value={currentStatus}
                                onChange={(event) =>
                                  setSelectedStatus(
                                    (previous) => ({
                                      ...previous,
                                      [report.id]:
                                        event.target.value,
                                    })
                                  )
                                }
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="pending">
                                  Pending
                                </option>

                                <option value="verified">
                                  Verified
                                </option>

                                <option value="in_progress">
                                  In Progress
                                </option>

                                <option value="resolved">
                                  Resolved
                                </option>

                                <option value="rejected">
                                  Rejected
                                </option>
                              </select>

                            </div>

                            <button
                              onClick={() =>
                                updateStatus(
                                  report.id
                                )
                              }
                              disabled={
                                updatingId ===
                                  report.id ||
                                !statusChanged
                              }
                              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {updatingId ===
                              report.id
                                ? "Updating..."
                                : "Update Status"}
                            </button>

                            {statusChanged && (
                              <span className="text-xs text-orange-600 font-medium pb-2">
                                Unsaved change
                              </span>
                            )}

                          </div>

                        </div>

                      </div>

                      {/* PRIORITY SCORE */}
                      <div className="xl:w-44 xl:border-l xl:border-slate-200 xl:pl-6">

                        <div className="flex items-end justify-between xl:block">

                          <div>

                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                              Priority Score
                            </p>

                            <p
                              className={`text-4xl font-extrabold mt-1 ${priority.score}`}
                            >
                              {report.priority_score !==
                              null
                                ? report.priority_score.toFixed(
                                    1
                                  )
                                : "N/A"}
                            </p>

                          </div>

                          <p className="text-xs text-slate-400 xl:mt-1">
                            out of 100
                          </p>

                        </div>

                        {report.priority_score !==
                          null && (
                          <div className="mt-3">

                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">

                              <div
                                className={`h-full rounded-full ${priority.bar}`}
                                style={{
                                  width: `${Math.min(
                                    report.priority_score,
                                    100
                                  )}%`,
                                }}
                              />

                            </div>

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

        {/* FOOTER */}
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-400">

          <p>
            Priority is calculated using severity, pothole size,
            YOLO confidence, road importance and repeat reports.
          </p>

          <p>
            Last refreshed:{" "}
            {new Date().toLocaleTimeString()}
          </p>

        </div>

      </div>
    </div>
  );
}

export default Maintenance;