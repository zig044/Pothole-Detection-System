import { useState } from "react";
import {
  Upload,
  MapPin,
  X,
  Image as ImageIcon,
  FileText,
  ShieldAlert,
  Route,
  CheckCircle2,
  AlertCircle,
  Send,
} from "lucide-react";
import api from "../services/api";

export default function ReportPothole() {
  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState<string | null>(null);

  const [description, setDescription] =
    useState("");

  const [severity, setSeverity] =
    useState("medium");

  const [roadType, setRoadType] =
    useState("residential");

  const [latitude, setLatitude] =
    useState("");

  const [longitude, setLongitude] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [dragging, setDragging] =
    useState(false);

  const setImage = (file: File) => {
    if (
      file.type !== "image/jpeg" &&
      file.type !== "image/png" &&
      file.type !== "image/jpg"
    ) {
      setMessage(
        "Only JPG and PNG images are allowed."
      );
      return;
    }

    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
    setMessage("");
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      setImage(file);
    }
  };

  const handleDragOver = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    setDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      setImage(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreview(null);
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!selectedImage) {
      setMessage("Please select an image.");
      return;
    }

    if (!latitude || !longitude) {
      setMessage(
        "Please enter latitude and longitude."
      );
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();

      formData.append(
        "image",
        selectedImage
      );

      formData.append(
        "description",
        description
      );

      formData.append(
        "severity",
        severity
      );

      formData.append(
        "road_type",
        roadType
      );

      formData.append(
        "latitude",
        latitude
      );

      formData.append(
        "longitude",
        longitude
      );

      await api.post(
        "/reports/",
        formData
      );

      setMessage(
        "Pothole reported successfully!"
      );

      setSelectedImage(null);
      setPreview(null);
      setDescription("");
      setSeverity("medium");
      setRoadType("residential");
      setLatitude("");
      setLongitude("");

    } catch (error) {
      console.error(error);

      setMessage(
        "Failed to submit report. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full">

      {/* ================= HEADER ================= */}

      <div className="mb-8">

        <div className="flex items-center gap-2 mb-2">

          <div className="h-2 w-2 rounded-full bg-blue-600" />

          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Road Reporting
          </span>

        </div>

        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
          Report a Pothole
        </h1>

        <p className="text-slate-500 mt-2">
          Submit a pothole report with an image and location details.
        </p>

      </div>

      {/* ================= FORM ================= */}

      <form
        onSubmit={handleSubmit}
        className="max-w-5xl"
      >

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ================= LEFT COLUMN ================= */}

          <div className="lg:col-span-2 space-y-6">

            {/* IMAGE UPLOAD */}

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

              <div className="px-6 py-5 border-b border-slate-100">

                <div className="flex items-center gap-3">

                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">

                    <ImageIcon
                      size={20}
                      className="text-blue-600"
                    />

                  </div>

                  <div>

                    <h2 className="font-bold text-slate-900">
                      Pothole Image
                    </h2>

                    <p className="text-sm text-slate-500 mt-0.5">
                      Upload a clear image of the pothole
                    </p>

                  </div>

                </div>

              </div>

              <div className="p-6">

                {!preview ? (

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                      border-2 border-dashed rounded-2xl
                      p-10 sm:p-14 text-center
                      transition-all duration-200
                      ${
                        dragging
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/40"
                      }
                    `}
                  >

                    <label className="cursor-pointer block">

                      <div className="mx-auto h-16 w-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">

                        <Upload
                          size={27}
                          className={
                            dragging
                              ? "text-blue-600"
                              : "text-slate-400"
                          }
                        />

                      </div>

                      <p className="font-semibold text-slate-800 mt-5">
                        Drag & drop your image here
                      </p>

                      <p className="text-sm text-slate-500 mt-2">
                        or click to browse from your device
                      </p>

                      <div className="inline-flex items-center gap-2 mt-4 text-xs font-medium text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-full">
                        JPG or PNG
                      </div>

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                    </label>

                  </div>

                ) : (

                  <div className="relative">

                    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">

                      <img
                        src={preview}
                        alt="Pothole preview"
                        className="w-full max-h-[430px] object-contain"
                      />

                    </div>

                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-3 right-3 h-9 w-9 bg-slate-900/80 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <X size={17} />
                    </button>

                    <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">

                      <CheckCircle2
                        size={16}
                        className="text-emerald-500"
                      />

                      Image selected successfully

                    </div>

                  </div>

                )}

              </div>

            </div>

            {/* DESCRIPTION */}

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

              <div className="px-6 py-5 border-b border-slate-100">

                <div className="flex items-center gap-3">

                  <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">

                    <FileText
                      size={20}
                      className="text-slate-600"
                    />

                  </div>

                  <div>

                    <h2 className="font-bold text-slate-900">
                      Report Details
                    </h2>

                    <p className="text-sm text-slate-500 mt-0.5">
                      Describe the reported road damage
                    </p>

                  </div>

                </div>

              </div>

              <div className="p-6">

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Describe the pothole, its approximate size, location on the road, or any other useful details..."
                  rows={5}
                  className="w-full border border-slate-200 rounded-xl p-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 resize-none transition"
                  required
                />

                <p className="text-xs text-slate-400 mt-2">
                  Provide enough detail to help maintenance teams understand the issue.
                </p>

              </div>

            </div>

            {/* LOCATION */}

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

              <div className="px-6 py-5 border-b border-slate-100">

                <div className="flex items-center gap-3">

                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">

                    <MapPin
                      size={20}
                      className="text-blue-600"
                    />

                  </div>

                  <div>

                    <h2 className="font-bold text-slate-900">
                      Location
                    </h2>

                    <p className="text-sm text-slate-500 mt-0.5">
                      Enter the coordinates of the pothole
                    </p>

                  </div>

                </div>

              </div>

              <div className="p-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* LATITUDE */}

                  <div>

                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Latitude
                    </label>

                    <input
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) =>
                        setLatitude(e.target.value)
                      }
                      placeholder="e.g. 27.098"
                      className="w-full border border-slate-200 rounded-xl p-3.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition"
                      required
                    />

                  </div>

                  {/* LONGITUDE */}

                  <div>

                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Longitude
                    </label>

                    <input
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(e) =>
                        setLongitude(e.target.value)
                      }
                      placeholder="e.g. 77.145"
                      className="w-full border border-slate-200 rounded-xl p-3.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition"
                      required
                    />

                  </div>

                </div>

                <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-blue-50 border border-blue-100">

                  <MapPin
                    size={15}
                    className="text-blue-600 mt-0.5 shrink-0"
                  />

                  <p className="text-xs text-blue-700">
                    Accurate coordinates help place the report correctly on the pothole map.
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* ================= RIGHT COLUMN ================= */}

          <div className="space-y-6">

            {/* SEVERITY */}

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

              <div className="px-6 py-5 border-b border-slate-100">

                <div className="flex items-center gap-3">

                  <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">

                    <ShieldAlert
                      size={20}
                      className="text-red-500"
                    />

                  </div>

                  <div>

                    <h2 className="font-bold text-slate-900">
                      Severity
                    </h2>

                    <p className="text-sm text-slate-500 mt-0.5">
                      How serious is the pothole?
                    </p>

                  </div>

                </div>

              </div>

              <div className="p-6">

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Severity Level
                </label>

                <select
                  value={severity}
                  onChange={(e) =>
                    setSeverity(e.target.value)
                  }
                  className="w-full border border-slate-200 rounded-xl p-3.5 text-sm bg-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition"
                >

                  <option value="low">
                    Low
                  </option>

                  <option value="medium">
                    Medium
                  </option>

                  <option value="high">
                    High
                  </option>

                </select>

                <div className="mt-4 space-y-2">

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Low — minor road damage
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Medium — noticeable road hazard
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    High — significant safety concern
                  </div>

                </div>

              </div>

            </div>

            {/* ROAD TYPE */}

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

              <div className="px-6 py-5 border-b border-slate-100">

                <div className="flex items-center gap-3">

                  <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center">

                    <Route
                      size={20}
                      className="text-violet-600"
                    />

                  </div>

                  <div>

                    <h2 className="font-bold text-slate-900">
                      Road Importance
                    </h2>

                    <p className="text-sm text-slate-500 mt-0.5">
                      Select the road category
                    </p>

                  </div>

                </div>

              </div>

              <div className="p-6">

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Road Type
                </label>

                <select
                  value={roadType}
                  onChange={(e) =>
                    setRoadType(e.target.value)
                  }
                  className="w-full border border-slate-200 rounded-xl p-3.5 text-sm bg-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition"
                >

                  <option value="highway">
                    Highway
                  </option>

                  <option value="main_road">
                    Main Road
                  </option>

                  <option value="residential">
                    Residential Road
                  </option>

                  <option value="low_traffic">
                    Low Traffic Road
                  </option>

                </select>

                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  Road importance is used by the maintenance prioritisation system when calculating repair priority.
                </p>

              </div>

            </div>

            {/* PRIORITY INFO */}

            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-sm">

              <div className="flex items-center gap-3">

                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">

                  <ShieldAlert
                    size={20}
                    className="text-blue-300"
                  />

                </div>

                <div>

                  <h3 className="font-bold">
                    Automatic Prioritisation
                  </h3>

                  <p className="text-xs text-slate-400 mt-1">
                    Maintenance priority is calculated automatically.
                  </p>

                </div>

              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">

                <div className="bg-white/5 border border-white/10 rounded-xl p-3">

                  <p className="text-xs text-slate-400">
                    Severity
                  </p>

                  <p className="text-sm font-semibold mt-1">
                    Included
                  </p>

                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-3">

                  <p className="text-xs text-slate-400">
                    Road Type
                  </p>

                  <p className="text-sm font-semibold mt-1">
                    Included
                  </p>

                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-3">

                  <p className="text-xs text-slate-400">
                    YOLO
                  </p>

                  <p className="text-sm font-semibold mt-1">
                    Detection
                  </p>

                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-3">

                  <p className="text-xs text-slate-400">
                    Location
                  </p>

                  <p className="text-sm font-semibold mt-1">
                    Included
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ================= MESSAGE ================= */}

        {message && (

          <div
            className={`mt-6 p-4 rounded-xl border flex items-start gap-3 ${
              message.includes("successfully")
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >

            {message.includes("successfully") ? (

              <CheckCircle2
                size={20}
                className="shrink-0"
              />

            ) : (

              <AlertCircle
                size={20}
                className="shrink-0"
              />

            )}

            <p className="text-sm font-medium">
              {message}
            </p>

          </div>

        )}

        {/* ================= SUBMIT ================= */}

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

          <div>

            <p className="font-semibold text-slate-900">
              Ready to submit?
            </p>

            <p className="text-sm text-slate-500 mt-1">
              The image will be analyzed by the pothole detection system.
            </p>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-700 text-white px-7 py-3.5 rounded-xl font-semibold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >

            {loading ? (
              <>
                <ActivityIcon />
                Submitting...
              </>
            ) : (
              <>
                <Send size={17} />
                Submit Report
              </>
            )}

          </button>

        </div>

      </form>

    </div>
  );
}

/* ================= LOADING ICON ================= */

function ActivityIcon() {
  return (
    <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
  );
}