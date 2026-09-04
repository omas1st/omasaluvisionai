import React, { useState, useRef } from "react";
import { WallKey, WallPhotoUpload } from "../types";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowRight,
  Eye,
  Trash2,
  Plus,
  Image as ImageIcon,
  Compass,
  Check,
} from "lucide-react";

interface AdditionalPhoto {
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  name: string;
}

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
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [additionalPhotos, setAdditionalPhotos] = useState<AdditionalPhoto[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const wallKeys: WallKey[] = ["front", "right", "back", "left"];

  const elevationLabels: Record<WallKey, { name: string; angle: string }> = {
    front: { name: "Front View", angle: "0°" },
    right: { name: "Right Side View", angle: "90°" },
    back: { name: "Back View", angle: "180°" },
    left: { name: "Left Side View", angle: "270°" },
  };

  // Find all walls that currently have a valid preview image
  const uploadedWalls = wallKeys.filter(
    (key) => walls[key]?.status === "ready" && !!walls[key]?.previewUrl
  );

  const readyCount = uploadedWalls.length;
  const canVisualize = readyCount >= 1;

  // Process an individual file into image data
  const processImageFile = (
    file: File
  ): Promise<{ file: File; previewUrl: string; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const validFormats = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      if (!validFormats.includes(file.type.toLowerCase())) {
        reject(new Error(`"${file.name}" is not a valid JPG, PNG, or WebP image.`));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          if (img.width < 800 || img.height < 600) {
            reject(
              new Error(
                `"${file.name}" is too small (${img.width}×${img.height}px). Minimum is 800×600px.`
              )
            );
            return;
          }
          resolve({ file, previewUrl, width: img.width, height: img.height });
        };
        img.onerror = () => {
          reject(new Error(`Could not decode image "${file.name}".`));
        };
        img.src = previewUrl;
      };
      reader.onerror = () => reject(new Error(`Failed to read file "${file.name}".`));
      reader.readAsDataURL(file);
    });
  };

  // Process one or multiple files in a single unified upload action
  const handleIncomingFiles = async (fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);
    if (filesArray.length === 0) return;

    setUploadError(null);
    setIsProcessingFiles(true);

    try {
      const processedResults: {
        file: File;
        previewUrl: string;
        width: number;
        height: number;
      }[] = [];
      const errors: string[] = [];

      for (const file of filesArray) {
        try {
          const res = await processImageFile(file);
          processedResults.push(res);
        } catch (err: unknown) {
          if (err instanceof Error) {
            errors.push(err.message);
          } else {
            errors.push("Failed to process one of the images.");
          }
        }
      }

      if (errors.length > 0) {
        setUploadError(errors.join(" "));
      }

      if (processedResults.length === 0) {
        setIsProcessingFiles(false);
        return;
      }

      // Map processed results to available wall slots in order: front -> right -> back -> left
      const remainingResults = [...processedResults];

      // 1. Fill empty primary slots first
      for (const key of wallKeys) {
        if (remainingResults.length === 0) break;
        if (!walls[key]?.previewUrl || walls[key]?.status !== "ready") {
          const item = remainingResults.shift()!;
          onUpdateWall(key, {
            file: item.file,
            previewUrl: item.previewUrl,
            width: item.width,
            height: item.height,
            status: "ready",
            progress: 100,
            validationError: undefined,
          });
        }
      }

      // 2. If slots are still left in remainingResults and user wants to overwrite or add as extra
      if (remainingResults.length > 0) {
        // If there are still remaining results and some primary slots were already occupied,
        // let's fill primary slots sequentially if total uploaded was 0 initially, or store in additionalPhotos
        setAdditionalPhotos((prev) => [
          ...prev,
          ...remainingResults.map((r, i) => ({
            id: `extra-${Date.now()}-${i}`,
            file: r.file,
            previewUrl: r.previewUrl,
            width: r.width,
            height: r.height,
            name: r.file.name,
          })),
        ]);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setUploadError(err.message);
      }
    } finally {
      setIsProcessingFiles(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Reassign an uploaded photo to a different elevation (swaps if already occupied)
  const handleReassignElevation = (sourceKey: WallKey, targetKey: WallKey) => {
    if (sourceKey === targetKey) return;

    const sourceData = walls[sourceKey];
    const targetData = walls[targetKey];

    // Move source to target
    onUpdateWall(targetKey, {
      file: sourceData.file,
      previewUrl: sourceData.previewUrl,
      width: sourceData.width,
      height: sourceData.height,
      status: sourceData.status,
      progress: sourceData.progress,
      detectedWindows: sourceData.detectedWindows,
      validationError: sourceData.validationError,
    });

    // If target had data, move it to source; otherwise clear source
    if (targetData.previewUrl && targetData.status === "ready") {
      onUpdateWall(sourceKey, {
        file: targetData.file,
        previewUrl: targetData.previewUrl,
        width: targetData.width,
        height: targetData.height,
        status: targetData.status,
        progress: targetData.progress,
        detectedWindows: targetData.detectedWindows,
        validationError: targetData.validationError,
      });
    } else {
      onDeleteWall(sourceKey);
    }
  };

  // Assign an additional photo to one of the main building elevations
  const handleAssignAdditionalToWall = (additional: AdditionalPhoto, targetKey: WallKey) => {
    onUpdateWall(targetKey, {
      file: additional.file,
      previewUrl: additional.previewUrl,
      width: additional.width,
      height: additional.height,
      status: "ready",
      progress: 100,
      validationError: undefined,
    });
    setAdditionalPhotos((prev) => prev.filter((p) => p.id !== additional.id));
  };

  const handleRemoveAdditional = (id: string) => {
    setAdditionalPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner & Presets */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
              Photo Upload & Aperture Detection
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Upload Building Photos
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Upload photos of your raw uncompleted building. You can upload as many pictures as you want, from a single elevation to all four sides.
            </p>
          </div>

          <button
            onClick={onLoadPresets}
            id="btn-load-sample-project"
            type="button"
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-tight transition-colors border border-slate-200 shadow-xs shrink-0 cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-slate-600" />
            <span>Use Sample 4-View Building</span>
          </button>
        </div>
      </div>

      {/* Single Unified Upload Section */}
      <div
        id="single-upload-section"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleIncomingFiles(e.dataTransfer.files);
          }
        }}
        className={`bg-white rounded-2xl border-2 transition-all p-6 sm:p-8 text-center relative overflow-hidden ${
          isDragOver
            ? "border-indigo-500 bg-indigo-50/50 shadow-lg ring-4 ring-indigo-50"
            : "border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-white shadow-xs"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/jpg"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleIncomingFiles(e.target.files);
            }
          }}
        />

        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-3 text-indigo-600 shadow-xs">
            <UploadCloud className="w-7 h-7" />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Drag & drop your building photos here
          </h3>

          <p className="text-xs text-slate-500 mt-1 mb-4">
            Upload as many pictures as you like (JPG, PNG, WebP &bull; min 800&times;600px). Select multiple files at once.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              id="btn-choose-photos"
              disabled={isProcessingFiles}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-tight shadow-md shadow-indigo-100 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{readyCount > 0 ? "Upload More Pictures" : "Browse & Select Pictures"}</span>
            </button>
          </div>

          {/* Tips badge */}
          <div className="mt-5 pt-4 border-t border-slate-200/70 w-full flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Upload 1 or multiple pictures
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Auto-maps to 3D elevations
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Smart window opening detection
            </span>
          </div>
        </div>

        {/* Processing overlay */}
        {isProcessingFiles && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-700">Reading & validating building photos...</span>
          </div>
        )}
      </div>

      {/* Upload Error Alert */}
      {uploadError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="text-xs font-bold text-red-700 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Uploaded Photos Gallery Section */}
      {readyCount > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-xs">
                {readyCount}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                  Uploaded Building Photos ({readyCount} View{readyCount > 1 ? "s" : ""})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Each photo is mapped to a building elevation. You can adjust elevations or click Visualize below.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-tight transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-600" />
              <span>Add Pictures</span>
            </button>
          </div>

          {/* Compact Photo Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {uploadedWalls.map((key) => {
              const wall = walls[key];
              const elevation = elevationLabels[key];

              return (
                <div
                  key={key}
                  id={`card-upload-${key}`}
                  className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between group hover:border-indigo-300 transition-all shadow-xs"
                >
                  {/* Photo Preview with Actions */}
                  <div className="relative aspect-[16/10] bg-slate-200 overflow-hidden">
                    <img
                      src={wall.previewUrl}
                      alt={wall.label}
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay Action Buttons */}
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2 backdrop-blur-[2px]">
                      <button
                        type="button"
                        onClick={() => setPreviewModalUrl(wall.previewUrl || null)}
                        className="p-1.5 rounded-lg bg-white text-slate-800 text-xs font-bold hover:bg-slate-100 shadow-xs cursor-pointer"
                        title="View full size"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteWall(key)}
                        id={`btn-delete-${key}`}
                        className="p-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-500 shadow-xs cursor-pointer"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Camera Angle Tag */}
                    <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                      <Compass className="w-3 h-3 text-indigo-300" />
                      <span>{elevation.angle}</span>
                    </div>

                    {/* Openings count tag */}
                    <div className="absolute bottom-2 right-2 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                      {wall.detectedWindows?.length || 0} Openings
                    </div>
                  </div>

                  {/* Elevation View Selector and Metadata */}
                  <div className="p-3 bg-white space-y-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Elevation View
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {wall.width || 1200}&times;{wall.height || 900}
                      </span>
                    </div>

                    {/* Reassign dropdown */}
                    <select
                      value={key}
                      onChange={(e) => handleReassignElevation(key, e.target.value as WallKey)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      {wallKeys.map((wKey) => (
                        <option key={wKey} value={wKey}>
                          {elevationLabels[wKey].name} ({elevationLabels[wKey].angle})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Supplementary / Additional Photos Section (if user uploaded > 4 pictures) */}
          {additionalPhotos.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">
                  Additional Pictures ({additionalPhotos.length})
                </span>
                <span className="text-[11px] text-slate-500">
                  Click &ldquo;Set as View&rdquo; on any picture to assign it to a building elevation.
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {additionalPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="bg-slate-50 rounded-xl border border-slate-200 p-2 space-y-2 group"
                  >
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-200">
                      <img
                        src={photo.previewUrl}
                        alt={photo.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAdditional(photo.id)}
                        className="absolute top-1 right-1 p-1 rounded-md bg-slate-900/70 text-white hover:bg-red-600 transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-600 truncate font-medium">{photo.name}</p>
                      <div className="flex items-center gap-1">
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAssignAdditionalToWall(photo, e.target.value as WallKey);
                            }
                          }}
                          className="w-full text-[10px] font-bold bg-white border border-slate-200 rounded px-1.5 py-1 text-indigo-700 cursor-pointer"
                        >
                          <option value="" disabled>
                            Set as View...
                          </option>
                          {wallKeys.map((wk) => (
                            <option key={wk} value={wk}>
                              {elevationLabels[wk].name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
              canVisualize
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-slate-100 text-slate-400 border border-slate-200"
            }`}
          >
            {readyCount > 0 ? readyCount : 0}/4
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight">
              {readyCount === 0
                ? "Upload At Least 1 Picture"
                : readyCount === 4
                ? "All 4 Elevations Ready (Full 360° Building)"
                : `${readyCount} Elevation${readyCount > 1 ? "s" : ""} Ready (Ready to Visualize)`}
            </h4>
            <p className="text-[11px] text-slate-500">
              {readyCount === 0
                ? "Drop or browse photos in the upload section above, or click 'Use Sample 4-View Building'."
                : `You can proceed now with ${readyCount} photo${readyCount > 1 ? "s" : ""}, or add more anytime.`}
            </p>
          </div>
        </div>

        <button
          onClick={onStartProcessing}
          disabled={!canVisualize}
          id="btn-visualize-my-building"
          type="button"
          className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-tight transition-all shadow-md ${
            canVisualize
              ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 cursor-pointer"
              : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
          }`}
        >
          <span>
            Visualize My Building ({readyCount} View{readyCount === 1 ? "" : "s"})
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Enlarged Modal for Photo Inspection */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden p-3 relative shadow-2xl border border-slate-800">
            <img
              src={previewModalUrl}
              alt="Uploaded Building Photo"
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
            />
            <button
              onClick={() => setPreviewModalUrl(null)}
              className="absolute top-5 right-5 bg-slate-900/90 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-tight hover:bg-slate-900 cursor-pointer shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
