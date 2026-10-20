import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

type Report = {
  id: number;
  image_path: string;
  description: string | null;
  severity: string;
  latitude: number | null;
  longitude: number | null;
  confidence: number;
  status: string;
  created_at: string;
};

function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getReports();
  }, []);

  async function getReports() {
    try {
      const response = await api.get("/reports/");
      setReports(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Reports
        </h1>

        <p className="text-slate-500 mt-2">
          View all reported potholes.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          Loading reports...
        </div>
      )}

      {/* Error */}
      {message && (
        <div className="bg-red-50 text-red-700 rounded-xl p-4 mb-5">
          {message}
        </div>
      )}

      {/* No reports */}
      {!loading && reports.length === 0 && !message && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <p className="text-slate-500">
            No reports found.
          </p>
        </div>
      )}

      {/* Reports */}
      {!loading && reports.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

          {/* Desktop table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    ID
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Description
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Severity
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Confidence
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Status
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Location
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-slate-50 transition"
                  >
                    <td className="px-6 py-4">
                      <Link
                        to={`/reports/${report.id}`}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        #{report.id}
                      </Link>
                    </td>

                    <td className="px-6 py-4 text-slate-700">
                      {report.description || "No description"}
                    </td>

                    <td className="px-6 py-4">
                      <span className="capitalize">
                        {report.severity}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-700">
                      {(report.confidence * 100).toFixed(1)}%
                    </td>

                    <td className="px-6 py-4">
                      <span className="capitalize">
                        {report.status.replace("_", " ")}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {report.latitude !== null &&
                      report.longitude !== null
                        ? `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`
                        : "Not available"}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;