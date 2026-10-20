import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

function MapCenter({ reports }: { reports: Report[] }) {
  const map = useMap();

  useEffect(() => {
    const locations = reports
      .filter(
        (report) =>
          report.latitude !== null &&
          report.longitude !== null
      )
      .map((report) =>
        L.latLng(
          report.latitude as number,
          report.longitude as number
        )
      );

    if (locations.length === 0) {
      return;
    }

    if (locations.length === 1) {
      map.setView(locations[0], 13);
      return;
    }

    const bounds = L.latLngBounds(locations);

    map.fitBounds(bounds, {
      padding: [30, 30],
    });
  }, [reports, map]);

  return null;
}

const defaultIcon = new L.Icon({
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

function Dashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  async function getReports() {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/reports/?t=${Date.now()}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load reports");
      }

      const data: Report[] = await response.json();

      setReports(data);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getReports();
  }, []);

  const totalReports = reports.length;

  const pendingReports = reports.filter(
    (report) =>
      report.status.toLowerCase() === "pending"
  ).length;

  const resolvedReports = reports.filter(
    (report) =>
      report.status.toLowerCase() === "resolved"
  ).length;

  const highSeverity = reports.filter(
    (report) =>
      report.severity.toLowerCase() === "high"
  ).length;

  const mediumSeverity = reports.filter(
    (report) =>
      report.severity.toLowerCase() === "medium"
  ).length;

  const lowSeverity = reports.filter(
    (report) =>
      report.severity.toLowerCase() === "low"
  ).length;

  const mapReports = reports.filter(
    (report) =>
      report.latitude !== null &&
      report.longitude !== null
  );

  const recentReports = [...reports]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  function getPriorityClass(level: string | null) {
    switch (level?.toLowerCase()) {
      case "critical":
        return "bg-red-50 text-red-700";

      case "high":
        return "bg-orange-50 text-orange-700";

      case "medium":
        return "bg-yellow-50 text-yellow-700";

      case "low":
        return "bg-green-50 text-green-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  }

  function getSeverityClass(severity: string) {
    switch (severity.toLowerCase()) {
      case "high":
        return "bg-red-50 text-red-700";

      case "medium":
        return "bg-yellow-50 text-yellow-700";

      case "low":
        return "bg-green-50 text-green-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  }

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-slate-200 rounded mb-3" />

            <div className="h-4 w-96 bg-slate-200 rounded mb-8" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-32 bg-white rounded-2xl border border-slate-200"
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Dashboard
          </h1>

          <p className="text-slate-500 mt-2">
            Monitor pothole reports, detection results and maintenance priorities.
          </p>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Reports
                </p>

                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {totalReports}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <span className="text-xl">📋</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-3">
              All submitted reports
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Pending
                </p>

                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {pendingReports}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <span className="text-xl">◷</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-3">
              Awaiting maintenance
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Resolved
                </p>

                <p className="text-3xl font-bold text-green-600 mt-2">
                  {resolvedReports}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                <span className="text-xl">✓</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-3">
              Completed maintenance
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  High Severity
                </p>

                <p className="text-3xl font-bold text-red-600 mt-2">
                  {highSeverity}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                <span className="text-xl">⚠</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-3">
              Requires attention
            </p>
          </div>
        </div>

        {/* MAP */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8">

          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">
              Pothole Map
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Geographic distribution of reported potholes.
            </p>
          </div>

          <div className="h-[430px]">
            {mapReports.length === 0 ? (
              <div className="h-full flex items-center justify-center bg-slate-50">
                <div className="text-center">
                  <div className="text-4xl mb-3">
                    📍
                  </div>

                  <h3 className="font-semibold text-slate-900">
                    No locations available
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    Reports with coordinates will appear on the map.
                  </p>
                </div>
              </div>
            ) : (
              <MapContainer
                center={[28.6139, 77.209]}
                zoom={11}
                scrollWheelZoom={true}
                className="h-full w-full"
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapCenter reports={mapReports} />

                {mapReports.map((report) => (
                  <Marker
                    key={report.id}
                    position={[
                      report.latitude as number,
                      report.longitude as number,
                    ]}
                    icon={defaultIcon}
                  >
                    <Popup>
                      <div className="min-w-[180px]">
                        <h3 className="font-bold text-slate-900">
                          Report #{report.id}
                        </h3>

                        <p className="text-sm text-slate-600 mt-1">
                          {report.description ||
                            "No description"}
                        </p>

                        <div className="mt-2 text-sm">
                          <p>
                            <strong>Severity:</strong>{" "}
                            {report.severity}
                          </p>

                          <p>
                            <strong>Status:</strong>{" "}
                            {report.status.replace(
                              "_",
                              " "
                            )}
                          </p>

                          <p>
                            <strong>Confidence:</strong>{" "}
                            {(report.confidence * 100).toFixed(
                              1
                            )}
                            %
                          </p>

                          {report.priority_score !== null && (
                            <p>
                              <strong>Priority:</strong>{" "}
                              {report.priority_score.toFixed(
                                1
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* SEVERITY */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                Severity Overview
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Distribution of pothole severity.
              </p>
            </div>

            <div className="space-y-6">

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">
                    High
                  </span>

                  <span className="text-sm font-semibold text-slate-600">
                    {highSeverity}
                  </span>
                </div>

                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{
                      width:
                        totalReports > 0
                          ? `${(highSeverity / totalReports) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Medium
                  </span>

                  <span className="text-sm font-semibold text-slate-600">
                    {mediumSeverity}
                  </span>
                </div>

                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full"
                    style={{
                      width:
                        totalReports > 0
                          ? `${(mediumSeverity / totalReports) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Low
                  </span>

                  <span className="text-sm font-semibold text-slate-600">
                    {lowSeverity}
                  </span>
                </div>

                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{
                      width:
                        totalReports > 0
                          ? `${(lowSeverity / totalReports) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* RECENT REPORTS */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                Recent Reports
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Latest pothole reports submitted.
              </p>
            </div>

            {recentReports.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500">
                  No reports available.
                </p>
              </div>
            ) : (
              <div className="space-y-4">

                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl"
                  >
                    <div className="min-w-0">

                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900">
                          Report #{report.id}
                        </p>

                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getSeverityClass(
                            report.severity
                          )}`}
                        >
                          {report.severity}
                        </span>
                      </div>

                      <p className="text-sm text-slate-500 mt-1 truncate">
                        {report.description ||
                          "No description"}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(
                          report.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right shrink-0">

                      {report.priority_score !== null && (
                        <p className="font-bold text-slate-900">
                          {report.priority_score.toFixed(1)}
                        </p>
                      )}

                      <span
                        className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold ${getPriorityClass(
                          report.priority_level
                        )}`}
                      >
                        {report.priority_level ||
                          "N/A"}
                      </span>

                    </div>
                  </div>
                ))}

              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;