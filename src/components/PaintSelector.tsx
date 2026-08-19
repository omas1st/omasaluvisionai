import React from "react";
import { PaintColorSpec } from "../types";
import { PAINT_COLORS } from "../data/colorPalette";
import { Check } from "lucide-react";

interface PaintSelectorProps {
  selectedPaintColor: PaintColorSpec;
  onSelectColor: (color: PaintColorSpec) => void;
  disabled?: boolean;
}

export const PaintSelector: React.FC<PaintSelectorProps> = ({
  selectedPaintColor,
  onSelectColor,
  disabled = false,
}) => {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
          Building Paint Selection
        </label>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <span
            className="w-3.5 h-3.5 rounded-full border border-black/20 inline-block shadow-xs"
            style={{ backgroundColor: selectedPaintColor.hex }}
          />
          <span>{selectedPaintColor.name}</span>
        </div>
      </div>

      {/* 16 Colors Grid matching 8-column layout from Sleek Interface */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
        {PAINT_COLORS.map((color) => {
          const isSelected = selectedPaintColor.id === color.id;
          const isLight =
            color.hex.toLowerCase() === "#ffffff" ||
            color.hex.toLowerCase() === "#fffff0" ||
            color.hex.toLowerCase() === "#f5f0e1" ||
            color.hex.toLowerCase() === "#f5f5dc";

          return (
            <button
              key={color.id}
              id={`btn-paint-${color.id}`}
              disabled={disabled}
              onClick={() => onSelectColor(color)}
              title={`${color.name} (${color.hex})`}
              className={`group flex flex-col items-center gap-1 p-1 rounded-lg transition-all ${
                disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                  isSelected
                    ? "border-2 border-indigo-500 ring-2 ring-indigo-100 scale-110 shadow-sm"
                    : "border-slate-200 hover:scale-105 hover:border-slate-400"
                }`}
                style={{ backgroundColor: color.hex }}
              >
                {isSelected && (
                  <Check
                    className={`w-3.5 h-3.5 ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                  />
                )}
              </div>
              <span className={`text-[9px] font-medium truncate max-w-full text-center ${
                isSelected ? "text-indigo-600 font-bold" : "text-slate-500"
              }`}>
                {color.name.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
