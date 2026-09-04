import React, { useEffect, useRef, useState } from "react";
import { DemonstrationState, WallKey } from "../types";
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Compass,
  ChevronDown,
  Globe,
  Building,
  Check,
} from "lucide-react";

export type PlayTargetMode = "all" | "front" | "right" | "back" | "left" | "current";

const resolveWallKey = (mode: string, fallback?: string): WallKey => {
  if (mode === "front") return "front";
  if (mode === "right") return "right";
  if (mode === "back") return "back";
  if (mode === "left") return "left";
  if (fallback === "right" || fallback === "back" || fallback === "left") return fallback;
  return "front";
};

interface DemonstrationPlayerProps {
  onDemoUpdate: (state: DemonstrationState) => void;
  onSelectWall: (wall: WallKey) => void;
  isCustomizing: boolean;
  currentWallKey?: WallKey;
}

export const DemonstrationPlayer: React.FC<DemonstrationPlayerProps> = ({
  onDemoUpdate,
  onSelectWall,
  isCustomizing,
  currentWallKey = "front",
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [selectedPlayMode, setSelectedPlayMode] = useState<PlayTargetMode>("all");
  const [activeWall, setActiveWall] = useState<WallKey>("front");
  const [phaseLabel, setPhaseLabel] = useState<string>("Ready to Play");
  const [openAmount, setOpenAmount] = useState<number>(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute total duration based on play mode
  const isSingleViewMode = selectedPlayMode !== "all";
  const totalDurationMs = isSingleViewMode ? 7000 : 30000;

  // Compute animation frame
  const computeDemoFrame = (timeMs: number, mode: PlayTargetMode) => {
    const t = Math.min(timeMs, totalDurationMs);

    const getOpeningCurve = (cycleTime: number, openDuration = 2000, holdDuration = 2000, closeDuration = 2000): number => {
      if (cycleTime < openDuration) {
        const p = cycleTime / openDuration;
        return 0.5 - 0.5 * Math.cos(p * Math.PI);
      }
      if (cycleTime < openDuration + holdDuration) {
        return 1.0;
      }
      if (cycleTime < openDuration + holdDuration + closeDuration) {
        const p = (cycleTime - (openDuration + holdDuration)) / closeDuration;
        return 0.5 + 0.5 * Math.cos(p * Math.PI);
      }
      return 0;
    };

    // Single Wall Demonstration
    if (mode !== "all") {
      const targetWall: WallKey = resolveWallKey(mode, currentWallKey);
      const wallName =
        targetWall === "front"
          ? "Front Elevation (0°)"
          : targetWall === "right"
          ? "Right Side Elevation (90°)"
          : targetWall === "back"
          ? "Back Elevation (180°)"
          : "Left Side Elevation (270°)";

      const openAmt = getOpeningCurve(t, 2000, 2200, 2000);
      let label = `${wallName}: Windows Closed`;

      if (t < 2000) {
        label = `${wallName}: Sashes Opening...`;
      } else if (t < 4200) {
        label = `${wallName}: Full Window Opening Inspection`;
      } else if (t < 6200) {
        label = `${wallName}: Sashes Smoothly Closing...`;
      } else {
        label = `${wallName}: Sealed & Latched`;
      }

      return {
        wall: targetWall,
        openAmt,
        label,
        progress: (t / totalDurationMs) * 100,
      };
    }

    // All Views 360° Tour Demonstration
    let wall: WallKey = "front";
    let openAmt = 0;
    let label = "Front View - Windows Closed";

    if (t <= 6000) {
      wall = "front";
      openAmt = getOpeningCurve(t);
      if (t < 2000) label = "Front Elevation (0°): Sashes Opening";
      else if (t < 3500) label = "Front Elevation: Full Sashes Open";
      else if (t < 5500) label = "Front Elevation: Windows Closing";
      else label = "Front Elevation: Sealed";
    } else if (t <= 7500) {
      wall = "right";
      openAmt = 0;
      label = "Orbiting Camera to Right Side Elevation (90°)...";
    } else if (t <= 13500) {
      wall = "right";
      const subT = t - 7500;
      openAmt = getOpeningCurve(subT);
      if (subT < 2000) label = "Right Elevation (90°): Sashes Opening";
      else if (subT < 3500) label = "Right Elevation: Inspection";
      else if (subT < 5500) label = "Right Elevation: Windows Closing";
      else label = "Right Elevation: Sealed";
    } else if (t <= 15000) {
      wall = "back";
      openAmt = 0;
      label = "Orbiting Camera to Back View (180°)...";
    } else if (t <= 21000) {
      wall = "back";
      const subT = t - 15000;
      openAmt = getOpeningCurve(subT);
      if (subT < 2000) label = "Back Elevation (180°): Sashes Opening";
      else if (subT < 3500) label = "Back Elevation: Inspection";
      else if (subT < 5500) label = "Back Elevation: Windows Closing";
      else label = "Back Elevation: Sealed";
    } else if (t <= 22500) {
      wall = "left";
      openAmt = 0;
      label = "Orbiting Camera to Left Side Elevation (270°)...";
    } else if (t <= 28500) {
      wall = "left";
      const subT = t - 22500;
      openAmt = getOpeningCurve(subT);
      if (subT < 2000) label = "Left Elevation (270°): Sashes Opening";
      else if (subT < 3500) label = "Left Elevation: Inspection";
      else if (subT < 5500) label = "Left Elevation: Windows Closing";
      else label = "Left Elevation: Sealed";
    } else {
      wall = "front";
      openAmt = 0;
      label = "360° Demonstration Tour Complete";
    }

    return { wall, openAmt, label, progress: (t / totalDurationMs) * 100 };
  };

  useEffect(() => {
    if (isPlaying && !isPaused) {
      const loop = (timestamp: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = timestamp;
        const delta = timestamp - lastTimeRef.current;
        lastTimeRef.current = timestamp;

        setElapsedMs((prev) => {
          const next = prev + delta;
          if (next >= totalDurationMs) {
            setIsPlaying(false);
            setIsPaused(false);
            setOpenAmount(0);
            const finishedWall: WallKey =
              selectedPlayMode === "all"
                ? "front"
                : resolveWallKey(selectedPlayMode, currentWallKey);
            setActiveWall(finishedWall);
            setPhaseLabel("Demonstration Finished");
            onDemoUpdate({
              isPlaying: false,
              isPaused: false,
              currentPhaseIndex: 4,
              phaseProgress: 1,
              totalProgress: 100,
              elapsedSeconds: Math.round(totalDurationMs / 1000),
              totalSeconds: Math.round(totalDurationMs / 1000),
              openAmount: 0,
              activeWallKey: finishedWall,
              phaseLabel: "Demonstration Finished",
            });
            onSelectWall(finishedWall);
            return totalDurationMs;
          }

          const { wall, openAmt, label, progress } = computeDemoFrame(next, selectedPlayMode);
          setOpenAmount(openAmt);
          setActiveWall(wall);
          setPhaseLabel(label);

          onDemoUpdate({
            isPlaying: true,
            isPaused: false,
            currentPhaseIndex: Math.floor((next / totalDurationMs) * 5),
            phaseProgress: (next % 6000) / 6000,
            totalProgress: progress,
            elapsedSeconds: Math.floor(next / 1000),
            totalSeconds: Math.round(totalDurationMs / 1000),
            openAmount: openAmt,
            activeWallKey: wall,
            phaseLabel: label,
          });

          return next;
        });

        animFrameRef.current = requestAnimationFrame(loop);
      };

      animFrameRef.current = requestAnimationFrame(loop);
    } else {
      lastTimeRef.current = null;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, isPaused, totalDurationMs, selectedPlayMode, currentWallKey, onDemoUpdate, onSelectWall]);

  const handleStartPlay = (mode: PlayTargetMode = selectedPlayMode) => {
    setSelectedPlayMode(mode);
    setIsMenuOpen(false);
    setElapsedMs(0);
    setIsPlaying(true);
    setIsPaused(false);
    lastTimeRef.current = null;

    const initialWall: WallKey =
      mode === "all" ? "front" : resolveWallKey(mode, currentWallKey);
    setActiveWall(initialWall);
    onSelectWall(initialWall);
  };

  const handlePauseToggle = () => {
    setIsPaused((prev) => !prev);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setElapsedMs(0);
    setOpenAmount(0);
    const targetWall: WallKey =
      selectedPlayMode === "all"
        ? "front"
        : resolveWallKey(selectedPlayMode, currentWallKey);
    setActiveWall(targetWall);
    setPhaseLabel("Ready to Play");
    onDemoUpdate({
      isPlaying: false,
      isPaused: false,
      currentPhaseIndex: 0,
      phaseProgress: 0,
      totalProgress: 0,
      elapsedSeconds: 0,
      totalSeconds: Math.round(totalDurationMs / 1000),
      openAmount: 0,
      activeWallKey: targetWall,
      phaseLabel: "Ready to Play",
    });
    onSelectWall(targetWall);
  };

  const progressPercent = Math.min(100, (elapsedMs / totalDurationMs) * 100);
  const remainingSeconds = Math.max(0, Math.ceil((totalDurationMs - elapsedMs) / 1000));

  // Options configuration
  const viewOptions: {
    id: PlayTargetMode;
    label: string;
    description: string;
    badge: string;
    icon: typeof Globe;
  }[] = [
    {
      id: "all",
      label: "All Views (360° Tour)",
      description: "Full tour cycling through Front → Right → Back → Left elevations",
      badge: "30s Tour",
      icon: Globe,
    },
    {
      id: "front",
      label: "Front View Only",
      description: "Main facade (0°) living room & master suite sashes",
      badge: "7s View",
      icon: Building,
    },
    {
      id: "right",
      label: "Right Side View Only",
      description: "Side elevation (90°) dining & guest room sashes",
      badge: "7s View",
      icon: Building,
    },
    {
      id: "back",
      label: "Back View Only",
      description: "Rear facade (180°) patio & bedroom sashes",
      badge: "7s View",
      icon: Building,
    },
    {
      id: "left",
      label: "Left Side View Only",
      description: "Left elevation (270°) staircase & study sashes",
      badge: "7s View",
      icon: Building,
    },
  ];

  const currentOption = viewOptions.find((o) => o.id === selectedPlayMode) || viewOptions[0];

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative">
      {/* Title & Live Status HUD */}
      <div className="space-y-1 min-w-0 w-full sm:w-auto">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            3D Demonstration
          </span>

          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 uppercase tracking-tight truncate max-w-[200px]">
            Target: {currentOption.label}
          </span>

          {isPlaying && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-pulse uppercase tracking-tight">
              Playing
            </span>
          )}
        </div>

        <div className="text-xs font-semibold text-slate-700 flex items-center gap-2 min-w-0">
          <Compass className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="truncate">
            {isPlaying
              ? phaseLabel
              : `Select an elevation to demonstrate window physics.`}
          </span>
        </div>
      </div>

      {/* Controls and View Selector */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
        {isPlaying ? (
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
            <button
              onClick={handlePauseToggle}
              id="btn-pause-demonstration"
              className="px-3 py-1.5 rounded bg-amber-500 text-white font-bold text-xs flex items-center gap-1 hover:bg-amber-600 transition-colors uppercase tracking-tight cursor-pointer"
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? "Resume" : "Pause"}</span>
            </button>

            <button
              onClick={handleStop}
              id="btn-stop-demonstration"
              className="px-3 py-1.5 rounded bg-slate-800 text-white font-bold text-xs flex items-center gap-1 hover:bg-slate-900 transition-colors uppercase tracking-tight cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>Stop</span>
            </button>
          </div>
        ) : (
          <div className="relative flex items-center" ref={menuRef}>
            {/* Split Play Button Group */}
            <div className="inline-flex rounded-lg shadow-md shadow-emerald-100 overflow-hidden border border-emerald-600">
              {/* Primary Direct Play Trigger */}
              <button
                onClick={() => handleStartPlay(selectedPlayMode)}
                id="btn-play-demonstration"
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 font-bold text-xs uppercase tracking-tight transition-all cursor-pointer"
                title={`Play ${currentOption.label}`}
              >
                {elapsedMs >= totalDurationMs ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Replay {selectedPlayMode === "all" ? "Tour" : "View"}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play: {selectedPlayMode === "all" ? "All Views" : selectedPlayMode.toUpperCase()}</span>
                  </>
                )}
              </button>

              {/* View Selector Dropdown Trigger */}
              <button
                onClick={() => setIsMenuOpen((prev) => !prev)}
                id="btn-toggle-play-views-menu"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-2 flex items-center justify-center border-l border-emerald-400/50 transition-colors cursor-pointer"
                title="Select which view or all views to play"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${isMenuOpen ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Dropdown Menu Popover with All View Options */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-2.5rem)] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 p-2 space-y-1 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Demonstration Target
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Choose to play all building views or a single elevation.
                  </p>
                </div>

                <div className="space-y-1 pt-1 max-h-72 overflow-y-auto">
                  {viewOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selectedPlayMode === opt.id;

                    return (
                      <button
                        key={opt.id}
                        id={`btn-select-play-${opt.id}`}
                        onClick={() => handleStartPlay(opt.id)}
                        className={`w-full text-left p-2.5 rounded-lg flex items-start gap-3 transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-emerald-50 border border-emerald-200 text-slate-900"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold uppercase tracking-tight">
                              {opt.label}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                isSelected
                                  ? "bg-emerald-200 text-emerald-800"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {opt.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 leading-snug">
                            {opt.description}
                          </p>
                        </div>

                        {isSelected && (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mini progress tracker */}
        {isPlaying && (
          <div className="text-right pl-3 border-l border-slate-200 shrink-0">
            <div className="text-[10px] font-mono font-bold text-indigo-600">
              {remainingSeconds}s
            </div>
            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-100"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
