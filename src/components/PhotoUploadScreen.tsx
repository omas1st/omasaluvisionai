import React, { useState, useRef } from "react";
import { WallKey, WallPhotoUpload } from "../types";
import { Upload, CheckCircle2, AlertCircle, Building2, ArrowRight, Eye, Trash2, Plus, Image as ImageIcon } from "lucide-react";

interface PhotoUploadScreenProps {
  walls: Record<WallKey, WallPhotoUpload>;
  onUpdateWall: (wallKey: WallKey, updated: Partial<WallPhotoUpload>) => void;
  onDeleteWall: (wallKey: WallKey) => void;
  onStartProcessing: () => void;
  onLoadPresets: () => void;
}

export const PhotoUploadScreen: React.FC<PhotoUploadScreenProps> = ({
  walls,
  onUpdateWall,
  onDeleteWall,
  onStartProcessing,
  onLoadPresets,
}) => {
  const [dragOverWall, setDragOverWall] = useState<WallKey | null>(null);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const fileInputRefs = {
    front: useRef<HTMLInputElement>(null),
    right: useRef<HTMLInputElement>(null),
    back: useRef<HTMLInputElement>(null),
    left: useRef<HTMLInputElement>(null),
  };

  const wallKeys: WallKey[] = ["front", "right", "back", "left"];

  const handleFile = (wallKey: WallKey, file: File) => {
    const validFormats = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validFormats.includes(file.type.toLowerCase())) {
      onUpdateWall(wallKey, {
        status: "error",
        validationError: "Please upload a valid JPG, PNG, or WebP building image.",
      });
      return;
    }

    onUpdateWall(wallKey, {
      status: "uploading",
      progress: 35,
      validationError: undefined,
    });

    const reader = new FileReader();
    reader.onload = (e) => {
      const resultUrl = e.target?.result as string;
      const img = new Image();

      img.onload = () => {
        if (img.width < 800 || img.height < 600) {
          onUpdateWall(wallKey, {
            status: "error",
            validationError: `Image is too small (${img.width}x${img.height}px). Minimum resolution is 800x600px.`,
            progress: 0,
          });
          return;
        }

        onUpdateWall(wallKey, {
          file,
          previewUrl: resultUrl,
          width: img.width,
          height: img.height,
          status: "ready",
          progress: 100,
          validationError: undefined,
        });
      };

      img.onerror = () => {
        onUpdateWall(wallKey, {
          status: "error",
          validationError: "Please upload a clear photo of this wall",
          progress: 0,
        });
      };

      img.src = resultUrl;
    };

    reader.onerror = () => {
      onUpdateWall(wallKey, {
        status: "error",
        validationError: "Failed to read photo. Please try again.",
      });
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, wallKey: WallKey) => {
    e.preventDefault();
    setDragOverWall(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(wallKey, e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, wallKey: WallKey) => {
    e.preventDefault();
    setDragOverWall(wallKey);
  };

  const handleDragLeave = () => {
    setDragOverWall(null);
  };

  const readyCount = wallKeys.filter((key) => walls[key]?.status === "ready" && !!walls[key]?.previewUrl).length;
  const canVisualize = readyCount >= 1;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
              Phase 1: Building Photo Upload (1 to 4 Views)
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Raw Blockwork Visualization
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Upload photos of your building (1 view, 2 views, 3 views, or all 4 elevations). The AI will detect window openings, calculate panel geometry, and render high-precision aluminum glazing on smooth architectural plaster.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLoadPresets}
              id="btn-load-sample-project"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-tight transition-colors border border-slate-200 shadow-xs cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-slate-600" />
              Use Sample 4-View Building
            </button>
          </div>
        </div>

        {/* Requirements Checklist */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span><strong>Flexible views:</strong> 1, 2, 3, or 4 elevations</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span><strong>Open apertures:</strong> Empty window blockwork</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span><strong>Ground level:</strong> Straight-on perspective</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span><strong>High resolution:</strong> Min 800×600px daylight</span>
          </div>
        </div>
      </div>

      {/* 4 Upload Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {wallKeys.map((key) => {
          const wall = walls[key];
          const isDrag = dragOverWall === key;
          const isUploaded = wall?.status === "ready" && !!wall?.previewUrl;
          const isError = wall?.status === "error" || !!wall?.validationError;

          return (
            <div
              key={key}
              id={`card-upload-${key}`}
              onDrop={(e) => handleDrop(e, key)}
              onDragOver={(e) => handleDragOver(e, key)}
              onDragLeave={handleDragLeave}
              className={`bg-white rounded-xl border transition-all p-5 flex flex-col justify-between ${
                isDrag
                  ? "border-indigo-500 bg-indigo-50/50 shadow-md ring-2 ring-indigo-100"
                  : isUploaded
                  ? "border-slate-200 bg-white shadow-sm"
                  : isError
                  ? "border-red-300 bg-red-50/30"
                  : "border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-white"
              }`}
            >
              <input
                ref={fileInputRefs[key]}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(key, e.target.files[0]);
                  }
                }}
              />

              {/* Title Bar with Status & Delete Button */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    {wall.label}
                    {isUploaded ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Uploaded
                      </span>
                    ) : (
                      <span className="text-[10px] font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        Optional
                      </span>
                    )}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {wall.cameraAngleDeg}°
                  </span>
                  {isUploaded && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteWall(key);
                      }}
                      id={`btn-delete-${key}`}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete this elevation image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Drop Zone */}
              <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center group mb-3">
                {isUploaded ? (
                  <>
                    <img
                      src={wall.previewUrl}
                      alt={wall.label}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                      <button
                        onClick={() => setPreviewModalUrl(wall.previewUrl || null)}
                        className="px-3 py-1.5 rounded-lg bg-white text-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-slate-100 uppercase tracking-tight cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                      <button
                        onClick={() => fileInputRefs[key].current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-indigo-500 uppercase tracking-tight cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" /> Replace
                      </button>
                      <button
                        onClick={() => onDeleteWall(key)}
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-red-500 uppercase tracking-tight cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </>
                ) : (
                  <div
                    onClick={() => fileInputRefs[key].current?.click()}
                    className="w-full h-full flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-slate-200/50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center mb-2 text-indigo-600">
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">
                      {wall.label}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 mb-2.5">
                      Drop photo here or click to browse
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRefs[key].current?.click();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-tight shadow-xs transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Image</span>
                    </button>
                  </div>
                )}

                {wall.status === "uploading" && (
                  <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-4 gap-2">
                    <div className="w-full max-w-xs bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${wall.progress}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600">
                      Validating resolution... {wall.progress}%
                    </span>
                  </div>
                )}
              </div>

              {/* Status footer with manual upload or delete actions */}
              {isError ? (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>{wall.validationError || "Please upload a clear photo of this wall"}</span>
                  </div>
                  <button
                    onClick={() => fileInputRefs[key].current?.click()}
                    className="text-xs font-bold text-red-700 underline cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              ) : isUploaded ? (
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span>{wall.width || 1200} &times; {wall.height || 900} px</span>
                    <span className="text-indigo-600 font-bold font-mono">
                      {wall.detectedWindows?.length || 0} Openings
                    </span>
                  </div>
                  <button
                    onClick={() => onDeleteWall(key)}
                    className="text-[11px] text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                  <span>No photo uploaded</span>
                  <button
                    onClick={() => fileInputRefs[key].current?.click()}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Choose File</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
            canVisualize ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"
          }`}>
            {readyCount}/4
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight">
              {readyCount === 0
                ? "Upload At Least 1 Elevation Photo"
                : readyCount === 4
                ? "All 4 Elevations Ready (Full 360° Building)"
                : `${readyCount} Elevation${readyCount > 1 ? "s" : ""} Uploaded (Ready to Visualize)`}
            </h4>
            <p className="text-[11px] text-slate-500">
              {readyCount === 0
                ? "Upload 1, 2, 3, or 4 building elevation photos, or click 'Use Sample 4-View Building'."
                : `You can proceed now with ${readyCount} view${readyCount > 1 ? "s" : ""}, or upload more anytime.`}
            </p>
          </div>
        </div>

        <button
          onClick={onStartProcessing}
          disabled={!canVisualize}
          id="btn-visualize-my-building"
          className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-tight transition-all shadow-md ${
            canVisualize
              ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 cursor-pointer"
              : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
          }`}
        >
          <span>Visualize My Building ({readyCount} View{readyCount === 1 ? "" : "s"})</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Enlarged Modal */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-hidden p-2 relative shadow-2xl">
            <img src={previewModalUrl} alt="Wall" className="w-full h-auto max-h-[80vh] object-contain rounded-lg" />
            <button
              onClick={() => setPreviewModalUrl(null)}
              className="absolute top-4 right-4 bg-slate-900 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-tight cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
