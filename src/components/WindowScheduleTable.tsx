import React from "react";
import { WallKey, WindowOpening } from "../types";
import { Table, Check, Edit3, RotateCcw } from "lucide-react";

interface WindowScheduleTableProps {
  walls: Record<WallKey, { label: string; detectedWindows: WindowOpening[] }>;
  onSelectWindow: (win: WindowOpening) => void;
  onRestoreWindow: (id: string) => void;
}

export const WindowScheduleTable: React.FC<WindowScheduleTableProps> = ({
  walls,
  onSelectWindow,
  onRestoreWindow,
}) => {
  const wallKeys: WallKey[] = ["front", "right", "back", "left"];

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3 uppercase text-[10px] tracking-wider text-slate-500">Window #</th>
              <th className="py-2.5 px-3 uppercase text-[10px] tracking-wider text-slate-500">Elevation</th>
              <th className="py-2.5 px-3 uppercase text-[10px] tracking-wider text-slate-500">Room Location</th>
              <th className="py-2.5 px-3 uppercase text-[10px] tracking-wider text-slate-500">Opening Size</th>
              <th className="py-2.5 px-3 uppercase text-[10px] tracking-wider text-slate-500">Window Type</th>
              <th className="py-2.5 px-3 uppercase text-[10px] tracking-wider text-slate-500">Panels</th>
              <th className="py-2.5 px-3 uppercase text-[10px] tracking-wider text-slate-500">Status</th>
              <th className="py-2.5 px-3 uppercase text-[10px] tracking-wider text-slate-500 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {wallKeys.flatMap((wKey) => {
              const wall = walls[wKey];
              return wall.detectedWindows.map((win) => {
                return (
                  <tr
                    key={win.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      win.isDeleted ? "bg-slate-50/50 text-slate-400" : "text-slate-800"
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold font-mono">
                      {win.label}
                    </td>
                    <td className="py-2.5 px-3 font-medium">
                      {wall.label}
                    </td>
                    <td className="py-2.5 px-3">
                      {win.roomType}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {win.pixelWidth} &times; {win.pixelHeight} px ({win.sizeCategory})
                    </td>
                    <td className="py-2.5 px-3 font-semibold">
                      {win.isDeleted ? "---" : win.currentType}
                    </td>
                    <td className="py-2.5 px-3">
                      {win.isDeleted ? (
                        "0"
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {win.currentPanels} {win.currentPanels === 1 ? "Panel" : "Panels"}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {win.isDeleted ? (
                        <span className="text-red-600 font-semibold text-[10px] uppercase tracking-tight">
                          Removed Wall
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold text-[10px] flex items-center gap-1 uppercase tracking-tight">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {win.isDeleted ? (
                        <button
                          onClick={() => onRestoreWindow(win.id)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] uppercase tracking-tight inline-flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" /> Restore
                        </button>
                      ) : (
                        <button
                          onClick={() => onSelectWindow(win)}
                          className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] uppercase tracking-tight inline-flex items-center gap-1 border border-indigo-200 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" /> Customize
                        </button>
                      )}
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
