import React from "react";
import { FrameColorSpec } from "../types";
import { FRAME_COLORS } from "../data/colorPalette";
import { Shield } from "lucide-react";

interface FrameSelectorProps {
  selectedFrameColor: FrameColorSpec;
  onSelectFrameColor: (frame: FrameColorSpec) => void;
  disabled?: boolean;
}

export const FrameSelector: React.FC<FrameSelectorProps> = ({
  selectedFrameColor,
  onSelectFrameColor,
  disabled = false,
}) => {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
          Frame Finish
        </label>
        <span className="text-xs font-bold text-slate-800">
          {selectedFrameColor.name} Aluminum
        </span>
      </div>

      {/* 4 Frame Color Finishes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {FRAME_COLORS.map((frame) => {
          const isSelected = selectedFrameColor.id === frame.id;

          return (
            <button
              key={frame.id}
              id={`btn-frame-${frame.id}`}
              disabled={disabled}
              onClick={() => onSelectFrameColor(frame)}
              className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all text-left ${
                isSelected
                  ? "bg-slate-50 border-indigo-600 shadow-xs"
                  : "bg-white border-slate-200 hover:border-slate-300"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div
                className={`w-4 h-4 rounded-sm shrink-0 border ${
                  frame.id === "white" ? "border-slate-300" : "border-black/20"
                } shadow-inner`}
                style={{ backgroundColor: frame.hex }}
              />
              <div className="flex flex-col overflow-hidden">
                <span
                  className={`text-[11px] font-bold uppercase tracking-tight truncate ${
                    isSelected ? "text-indigo-600" : "text-slate-700"
                  }`}
                >
                  {frame.name}
                </span>
                <span className="text-[9px] text-slate-400 font-medium">
                  {frame.metalness > 0.5 ? "Metallic" : "Powdercoat"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
