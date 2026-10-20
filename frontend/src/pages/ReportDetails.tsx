import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
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

function ReportDetails() {
  const { id } = useParams();

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    getReport();
  }, [id]);

  async function getReport() {
    try {
      const response = await api.get(`/reports/${id}`);

      setReport(response.data);
      setNewStatus(response.data.status);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load report.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus() {
    if (!id || !newStatus) return;

    setUpdating(true);
    setMessage("");

    try {
      const response = await api.put(
        `/reports/${id}/status`,
        null,
        {
          params: {
            status: newStatus,
          },
        }
      );

      setReport(response.data);
      setNewStatus(response.data.status);

      setMessage("Status updated successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Report Details
        </h1>

        <p className="text-slate-500 mt-2">
          Loading report...
        </p>
      </div>
    );
  }

  if (!report) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Report Details
        </h1>

        <p className="text-red-600 mt-4">
          {message || "Report not found."}
        </p>

        <Link
          to="/reports"
          className="inline-flex items-center gap-2 mt-6 text-blue-600"
        >
          <ArrowLeft size={18} />
          Back to Reports
        </Link>
      </div>
    );
  }

  const imageUrl = `http://127.0.0.1:8000/${report.image_path.replace(
    /\\/g,
    "/"
  )}`;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Report #{report.id}
          </h1>

          <p className="text-slate-500 mt-2">
            Pothole report details
          </p>
        </div>

        <Link
          to="/reports"
          className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-white transition"
        >
          <ArrowLeft size={18} />
          Back
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Image */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Uploaded Image
          </h2>

          <div className="bg-slate-100 rounded-xl overflow-hidden">
            <img
              src={imageUrl}
              alt={`Pothole report ${report.id}`}
              className="w-full h-80 object-cover"
              onError={() => {
                setMessage("Unable to load the uploaded image.");
              }}
            />
          </div>
        </div>

        {/* Information */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Report Information
          </h2>

          <div className="space-y-5">

            {/* Description */}
            <div>
              <p className="text-sm text-slate-500">
                Description
              </p>

              <p className="font-medium text-slate-900 mt-1">
                {report.description || "No description"}
              </p>
            </div>

            {/* Severity */}
            <div>
              <p className="text-sm text-slate-500">
                Severity
              </p>

              <p className="font-medium text-slate-900 capitalize mt-1">
                {report.severity}
              </p>
            </div>

            {/* Confidence */}
            <div>
              <p className="text-sm text-slate-500">
                YOLO Confidence
              </p>

              <p className="font-medium text-slate-900 mt-1">
                {(report.confidence * 100).toFixed(1)}%
              </p>
            </div>

            {/* Current Status */}
            <div>
              <p className="text-sm text-slate-500">
                Current Status
              </p>

              <p className="font-medium text-slate-900 capitalize mt-1">
                {report.status.replace("_", " ")}
              </p>
            </div>

            {/* Location */}
            <div>
              <p className="text-sm text-slate-500">
                Location
              </p>

              <div className="flex items-center gap-2 mt-1">
                <MapPin
                  size={18}
                  className="text-slate-500"
                />

                <p className="font-medium text-slate-900">
                  {report.latitude !== null &&
                  report.longitude !== null
                    ? `${report.latitude}, ${report.longitude}`
                    : "Location not available"}
                </p>
              </div>
            </div>

            {/* Date */}
            <div>
              <p className="text-sm text-slate-500">
                Reported On
              </p>

              <p className="font-medium text-slate-900 mt-1">
                {new Date(report.created_at).toLocaleString()}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Status Update */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mt-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Update Status
        </h2>

        <div className="flex flex-col sm:flex-row gap-3">

          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="flex-1 border border-slate-300 rounded-lg px-4 py-3"
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

          <button
            onClick={updateStatus}
            disabled={
              updating ||
              newStatus === report.status
            }
            className="px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updating
              ? "Updating..."
              : "Update Status"}
          </button>
        </div>

        {message && (
          <div className="mt-4 bg-slate-100 rounded-lg px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportDetails;