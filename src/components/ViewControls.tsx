import React from "react";
import { WallKey } from "../types";
import {
  Compass,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  Eye,
} from "lucide-react";

interface ViewControlsProps {
  activeWallKey: WallKey;
  onSelectWall: (wallKey: WallKey) => void;
  disabled?: boolean;
  onResetView?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  openingsCount?: number;
}

export const ViewControls: React.FC<ViewControlsProps> = ({
  activeWallKey,
  onSelectWall,
  disabled = false,
  onResetView,
  onZoomIn,
  onZoomOut,
  openingsCount,
}) => {
  const views: {
    key: WallKey;
    label: string;
    subLabel: string;
    angle: string;
    direction: string;
  }[] = [
    { key: "front", label: "Front View", subLabel: "Entrance Facade", angle: "0°", direction: "N" },
    { key: "right", label: "Right Side", subLabel: "East Elevation", angle: "90°", direction: "E" },
    { key: "back", label: "Back View", subLabel: "Rear Patio Facade", angle: "180°", direction: "S" },
    { key: "left", label: "Left Side", subLabel: "West Elevation", angle: "270°", direction: "W" },
  ];

  const activeView = views.find((v) => v.key === activeWallKey) || views[0];

  return (
    <div className="space-y-3" id="elevation-controls-section">
      {/* Console Top Bar */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Building Elevations
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
              Active: {activeView.label} ({activeView.angle})
            </span>
            {openingsCount !== undefined && (
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {openingsCount} {openingsCount === 1 ? "Opening" : "Openings"}
              </span>
            )}
          </div>
        </div>

        {/* Quick Camera Action Tools */}
        <div className="flex items-center gap-1 self-end xs:self-auto shrink-0">
          {onZoomIn && (
            <button
              type="button"
              onClick={onZoomIn}
              disabled={disabled}
              id="btn-zoom-in"
              title="Zoom In"
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer disabled:opacity-40"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          )}
          {onZoomOut && (
            <button
              type="button"
              onClick={onZoomOut}
              disabled={disabled}
              id="btn-zoom-out"
              title="Zoom Out"
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer disabled:opacity-40"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          )}
          {onResetView && (
            <button
              type="button"
              onClick={onResetView}
              disabled={disabled}
              id="btn-reset-view"
              title="Reset 3D Perspective"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold uppercase tracking-tight transition-colors cursor-pointer disabled:opacity-40"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset View</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Elevation Selection Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {views.map((v) => {
          const isActive = activeWallKey === v.key;
          return (
            <button
              key={v.key}
              id={`btn-view-${v.key}`}
              disabled={disabled}
              onClick={() => onSelectWall(v.key)}
              className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between group ${
                isActive
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 ring-2 ring-indigo-200"
                  : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-slate-50/80 shadow-2xs"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-[0.98]"}`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                  }`}
                >
                  {v.angle}
                </span>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider ${
                    isActive ? "text-indigo-200" : "text-slate-400"
                  }`}
                >
                  {v.direction}
                </span>
              </div>

              <div>
                <div
                  className={`text-xs font-bold tracking-tight uppercase ${
                    isActive ? "text-white" : "text-slate-900"
                  }`}
                >
                  {v.label}
                </div>
                <div
                  className={`text-[10px] truncate hidden sm:block ${
                    isActive ? "text-indigo-100" : "text-slate-500"
                  }`}
                >
                  {v.subLabel}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Helper Footer Line */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>Drag 3D model to orbit 360&deg; &bull; Pinch / scroll to zoom &bull; Tap window to customize</span>
        </span>
      </div>
    </div>
  );
};
