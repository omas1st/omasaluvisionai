import React from "react";
import { WallKey } from "../types";
import { Compass } from "lucide-react";

interface ViewControlsProps {
  activeWallKey: WallKey;
  onSelectWall: (wallKey: WallKey) => void;
  disabled?: boolean;
}

export const ViewControls: React.FC<ViewControlsProps> = ({
  activeWallKey,
  onSelectWall,
  disabled = false,
}) => {
  const views: { key: WallKey; label: string; angle: string }[] = [
    { key: "front", label: "Front View", angle: "0°" },
    { key: "right", label: "Right Side", angle: "90°" },
    { key: "back", label: "Back View", angle: "180°" },
    { key: "left", label: "Left Side", angle: "270°" },
  ];

  return (
    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-md">
      <div className="hidden md:flex items-center gap-1 px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <Compass className="w-3.5 h-3.5 text-indigo-600" />
        <span>Elevations</span>
      </div>

      <div className="flex items-center gap-1.5 w-full sm:w-auto">
        {views.map((v) => {
          const isActive = activeWallKey === v.key;
          return (
            <button
              key={v.key}
              id={`btn-view-${v.key}`}
              disabled={disabled}
              onClick={() => onSelectWall(v.key)}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-tight transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <span>{v.label}</span>
              <span className={`text-[9px] font-mono font-normal opacity-75`}>
                {v.angle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
