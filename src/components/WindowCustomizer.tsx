import React, { useState } from "react";
import { WallKey, WindowOpening, WindowType } from "../types";
import { X, Trash2, RotateCcw, Copy, Sparkles, Check, LayoutGrid, Sliders } from "lucide-react";
import { getWindowTypeDescription } from "../utils/windowRules";

interface WindowCustomizerProps {
  window: WindowOpening | null;
  allWindowsOnWall: WindowOpening[];
  onUpdateWindow: (windowId: string, updates: Partial<WindowOpening>) => void;
  onApplyToWall: (wallKey: WallKey, type: WindowType, panels: 1 | 2 | 3 | 4) => void;
  onApplyToMatchingSize: (sizeCategory: string, type: WindowType, panels: 1 | 2 | 3 | 4) => void;
  onResetToAI: (windowId: string) => void;
  onDeleteWindow: (windowId: string) => void;
  onRestoreWindow: (windowId: string) => void;
  onClose: () => void;
}

export const WindowCustomizer: React.FC<WindowCustomizerProps> = ({
  window: win,
  allWindowsOnWall,
  onUpdateWindow,
  onApplyToWall,
  onApplyToMatchingSize,
  onResetToAI,
  onDeleteWindow,
  onRestoreWindow,
  onClose,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!win) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const windowIndexOnWall = allWindowsOnWall.findIndex((w) => w.id === win.id) + 1;
  const totalOnWall = allWindowsOnWall.length;

  const wallDisplayNames: Record<WallKey, string> = {
    front: "Front Wall",
    right: "Right Side Wall",
    back: "Back Wall",
    left: "Left Side Wall",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-slate-900 text-white text-xs font-semibold px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header matching Sleek Interface spec */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-600" />
          <h2 className="font-bold text-sm uppercase tracking-tight text-slate-900">
            Window Customization • {win.label}
          </h2>
        </div>

        <button
          onClick={onClose}
          id="btn-close-window-customizer"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Close Customizer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Metadata Pill Box */}
      <div className="px-5 pt-4">
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-[11px] leading-relaxed">
          <div className="flex justify-between mb-1">
            <span className="text-slate-500">Location:</span>
            <span className="font-bold text-slate-800">
              {wallDisplayNames[win.wallKey]} &bull; Window {windowIndexOnWall} of {totalOnWall} ({win.roomType})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">AI Size Detect:</span>
            <span className="font-bold text-slate-800">
              {win.pixelWidth}px &times; {win.pixelHeight}px ({win.sizeCategory})
            </span>
          </div>
        </div>
      </div>

      {win.isDeleted ? (
        /* Deleted Window Restore State */
        <div className="p-6 bg-red-50/50 border-t border-red-100 text-center space-y-3 m-5 rounded-lg">
          <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-red-900 uppercase tracking-tight">Window Removed From Wall</h4>
            <p className="text-[11px] text-red-700 mt-0.5">
              The opening has been closed with continuous finished plaster walling.
            </p>
          </div>
          <button
            onClick={() => {
              onRestoreWindow(win.id);
              showToast("Window restored to wall!");
            }}
            id="btn-restore-window"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm uppercase tracking-tight cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Re-add Window to Wall
          </button>
        </div>
      ) : (
        <div className="p-5 space-y-5">
          {/* 1. WINDOW TYPE SELECTION */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 block">
              Window Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Casement", "Sliding", "Transom"] as WindowType[]).map((type) => {
                const isSelected = win.currentType === type;
                return (
                  <button
                    key={type}
                    id={`btn-select-type-${type.toLowerCase()}`}
                    onClick={() => {
                      onUpdateWindow(win.id, { currentType: type });
                      showToast(`Set to ${type} window`);
                    }}
                    className={`flex flex-col items-center p-2.5 rounded-lg border transition-all ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50 text-indigo-600 font-bold shadow-xs"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 mb-1.5 rounded-sm ${
                        isSelected
                          ? "border-2 border-indigo-400 bg-indigo-100/50"
                          : "border-2 border-slate-300 bg-slate-50"
                      } ${type === "Transom" ? "border-t-4" : ""}`}
                    />
                    <span className="text-[10px] font-bold uppercase tracking-tight">{type}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. PANEL CONFIGURATION */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Panel Configuration
              </label>
              <span className="bg-amber-100 text-amber-700 text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-tight">
                AI REC: {win.recommendedPanels} PANELS
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {([1, 2, 3, 4] as (1 | 2 | 3 | 4)[]).map((pCount) => {
                const isSelected = win.currentPanels === pCount;

                return (
                  <button
                    key={pCount}
                    id={`btn-select-panel-${pCount}`}
                    onClick={() => {
                      onUpdateWindow(win.id, { currentPanels: pCount });
                      showToast(`Configured to ${pCount} panels`);
                    }}
                    className={`py-2.5 rounded-lg text-xs font-bold transition-all text-center ${
                      isSelected
                        ? "border-2 border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-100"
                        : "border border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
                    }`}
                  >
                    {pCount} {pCount === 1 ? "Panel" : "Panels"}
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-500 italic mt-2">
              {getWindowTypeDescription(win.currentType, win.currentPanels)}
            </p>
          </div>

          {/* 3. BATCH APPLY & ACTIONS */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => {
                  onApplyToWall(win.wallKey, win.currentType, win.currentPanels);
                  showToast(`Applied to all on ${wallDisplayNames[win.wallKey]}`);
                }}
                id="btn-apply-to-this-wall"
                className="py-2 px-3 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg uppercase tracking-tight hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
              >
                <Copy className="w-3 h-3" />
                Apply to Wall
              </button>

              <button
                onClick={() => {
                  onApplyToMatchingSize(win.sizeCategory, win.currentType, win.currentPanels);
                  showToast(`Applied to all matching (${win.sizeCategory}) windows`);
                }}
                id="btn-apply-to-matching-size"
                className="py-2 px-3 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg uppercase tracking-tight hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
              >
                <LayoutGrid className="w-3 h-3" />
                Apply to Matching
              </button>

              <button
                onClick={() => {
                  onResetToAI(win.id);
                  showToast("Reset to AI recommendations");
                }}
                id="btn-reset-to-ai"
                className="py-2 px-3 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg uppercase tracking-tight hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset AI
              </button>
            </div>

            {/* 4. DELETE WINDOW BUTTON */}
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg justify-between mt-2">
                <span className="text-[11px] font-bold text-red-900">Confirm delete {win.label}?</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      onDeleteWindow(win.id);
                      setShowDeleteConfirm(false);
                      showToast("Window removed from wall");
                    }}
                    id="btn-confirm-delete-window"
                    className="px-2.5 py-1 rounded bg-red-600 text-white text-[10px] font-bold hover:bg-red-700"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2.5 py-1 rounded bg-slate-200 text-slate-700 text-[10px] font-semibold hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                id="btn-trigger-delete-window"
                className="w-full py-2 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg uppercase tracking-tight hover:bg-red-100 border border-red-100 transition-colors"
              >
                Delete This Window
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
