import React from "react";
import { WindowType } from "../types";
import { Layers, CheckCircle2, Check, Sparkles } from "lucide-react";

interface QuickApplyBarProps {
  onApplyGlobalType: (type: WindowType) => void;
  activeGlobalType?: WindowType | "Mixed";
  disabled?: boolean;
}

export const QuickApplyBar: React.FC<QuickApplyBarProps> = ({
  onApplyGlobalType,
  activeGlobalType = "Casement",
  disabled = false,
}) => {
  const options: {
    type: WindowType;
    label: string;
    desc: string;
    features: string;
  }[] = [
    {
      type: "Casement",
      label: "Casement",
      desc: "Side-hinged outward swinging sashes with vertical handles",
      features: "Side Hinges • Maximum 100% Ventilation",
    },
    {
      type: "Sliding",
      label: "Sliding",
      desc: "Horizontal glide tracks with offset bypass panels",
      features: "Horizontal Tracks • Space-saving Gliding Sashes",
    },
    {
      type: "Transom",
      label: "Transom",
      desc: "Top-hinged awning & hopper tilt ventilation system",
      features: "Top Pivot • Weather-proof Awning Tilt",
    },
  ];

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Global Quick Apply
              </h3>
              {activeGlobalType && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Check className="w-3 h-3 text-emerald-600" />
                  Active: {activeGlobalType}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Instantly convert all windows across all 4 building elevations to your chosen architectural style.
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 uppercase tracking-tight">
          1-Click Uniform Sashes
        </span>
      </div>

      {/* 3 Interactive Cards with Active Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map((opt) => {
          const isSelected = activeGlobalType === opt.type;

          return (
            <button
              key={opt.type}
              id={`btn-quick-apply-${opt.type.toLowerCase()}`}
              disabled={disabled}
              onClick={() => onApplyGlobalType(opt.type)}
              className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between group ${
                isSelected
                  ? "border-2 border-indigo-600 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-100"
                  : "border-slate-200 hover:border-indigo-300 bg-slate-50/60 hover:bg-white"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-[0.99]"}`}
            >
              {/* Top Row */}
              <div className="flex items-start justify-between w-full mb-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-white border border-slate-300 text-slate-700 group-hover:border-indigo-400"
                    }`}
                  >
                    {opt.type === "Casement" ? "C" : opt.type === "Sliding" ? "S" : "T"}
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                      <span>{opt.label} Windows</span>
                    </div>
                  </div>
                </div>

                {isSelected ? (
                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-300 shadow-xs animate-in fade-in">
                    <Check className="w-3 h-3 stroke-[3]" />
                    Applied
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 group-hover:text-indigo-600 font-bold uppercase tracking-tight">
                    Click to Apply
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1 mt-1">
                <p className="text-[11px] text-slate-600 leading-snug">
                  {opt.desc}
                </p>
                <div className="text-[9px] font-semibold text-indigo-700/80 uppercase tracking-tight pt-1">
                  {opt.features}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
