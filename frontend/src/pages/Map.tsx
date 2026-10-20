import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import api from "../services/api";

import "leaflet/dist/leaflet.css";

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

const defaultIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapCenter({ reports }: { reports: Report[] }) {
  const map = useMap();

  useEffect(() => {
    const locations = reports.filter(
      (report) =>
        report.latitude !== null &&
        report.longitude !== null
    );

    if (locations.length === 0) return;

    const bounds = L.latLngBounds(
      locations.map((report) => [
        report.latitude as number,
        report.longitude as number,
      ])
    );

    map.fitBounds(bounds, {
      padding: [40, 40],
    });
  }, [reports, map]);

  return null;
}

function Map() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const [severityFilter, setSeverityFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  useEffect(() => {
    getReports();
  }, []);

  async function getReports() {
    try {
      const response = await api.get("/reports/");
      setReports(response.data);
    } catch (error) {
      console.error("Failed to load map reports:", error);
    } finally {
      setLoading(false);
    }
  }

  const reportsWithLocation = reports.filter(
    (report) =>
      report.latitude !== null &&
      report.longitude !== null
  );

  const filteredReports = reportsWithLocation.filter(
    (report) => {
      const severityMatch =
        severityFilter === "all" ||
        report.severity.toLowerCase() === severityFilter;

      const statusMatch =
        statusFilter === "all" ||
        report.status.toLowerCase() === statusFilter;

      return severityMatch && statusMatch;
    }
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Pothole Map
          </h1>

          <p className="text-slate-500 mt-2">
            View reported potholes by location.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={severityFilter}
            onChange={(e) =>
              setSeverityFilter(e.target.value)
            }
            className="border border-slate-300 rounded-lg px-4 py-2 bg-white"
          >
            <option value="all">
              All Severity
            </option>

            <option value="high">
              High
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="low">
              Low
            </option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="border border-slate-300 rounded-lg px-4 py-2 bg-white"
          >
            <option value="all">
              All Status
            </option>

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
      </div>

      {/* Info */}
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-sm text-slate-600">
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {filteredReports.length}
            </span>{" "}
            pothole locations
          </p>

          <p className="text-sm text-slate-500">
            {reports.length} total reports
          </p>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="h-[600px] flex items-center justify-center">
            <p className="text-slate-500">
              Loading map...
            </p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="h-[600px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-slate-700 font-semibold">
                No reports found
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Try changing the filters or add a report
                with location data.
              </p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={[
              filteredReports[0].latitude as number,
              filteredReports[0].longitude as number,
            ]}
            zoom={13}
            scrollWheelZoom={true}
            className="h-[600px] w-full"
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapCenter reports={filteredReports} />

            {filteredReports.map((report) => (
              <Marker
                key={report.id}
                position={[
                  report.latitude as number,
                  report.longitude as number,
                ]}
                icon={defaultIcon}
              >
                <Popup>
                  <div className="min-w-[190px]">
                    <h3 className="font-bold text-slate-900">
                      Report #{report.id}
                    </h3>

                    <p className="text-sm text-slate-600 mt-2">
                      {report.description ||
                        "No description"}
                    </p>

                    <div className="mt-3 space-y-1 text-sm">
                      <p>
                        <strong>Severity:</strong>{" "}
                        <span className="capitalize">
                          {report.severity}
                        </span>
                      </p>

                      <p>
                        <strong>Status:</strong>{" "}
                        <span className="capitalize">
                          {report.status.replace(
                            "_",
                            " "
                          )}
                        </span>
                      </p>

                      <p>
                        <strong>Confidence:</strong>{" "}
                        {(report.confidence * 100).toFixed(
                          1
                        )}
                        %
                      </p>
                    </div>

                    <Link
                      to={`/reports/${report.id}`}
                      className="inline-block mt-3 text-blue-600 font-medium hover:underline"
                    >
                      View Report
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}

export default Map;