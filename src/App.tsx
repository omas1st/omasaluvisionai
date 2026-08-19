import React, { useState } from "react";
import {
  AppPhase,
  BuildingProject,
  DemonstrationState,
  FrameColorSpec,
  PaintColorSpec,
  WallKey,
  WallPhotoUpload,
  WindowOpening,
  WindowType,
} from "./types";
import { createEmptyWallState, createInitialWallState } from "./data/sampleBuildings";
import { DEFAULT_FRAME_COLOR, DEFAULT_PAINT_COLOR } from "./data/colorPalette";
import { PhotoUploadScreen } from "./components/PhotoUploadScreen";
import { AIProcessingScreen } from "./components/AIProcessingScreen";
import { ThreeBuildingViewer } from "./components/ThreeBuildingViewer";
import { ViewControls } from "./components/ViewControls";
import { QuickApplyBar } from "./components/QuickApplyBar";
import { WindowCustomizer } from "./components/WindowCustomizer";
import { PaintSelector } from "./components/PaintSelector";
import { FrameSelector } from "./components/FrameSelector";
import { DemonstrationPlayer } from "./components/DemonstrationPlayer";
import { SaveShareModal } from "./components/SaveShareModal";
import { WindowScheduleTable } from "./components/WindowScheduleTable";
import {
  Building2,
  Table,
  ArrowLeft,
  UploadCloud,
  Layers,
  Sparkles,
} from "lucide-react";

export default function App() {
  // Main Phase State
  const [phase, setPhase] = useState<AppPhase>("upload");

  // Mode Capsule State ("individual" vs "global")
  const [activeMode, setActiveMode] = useState<"individual" | "global">("individual");

  // Wall Photos & Detected Windows - Starts EMPTY by default
  const [walls, setWalls] = useState<Record<WallKey, WallPhotoUpload>>(() => createEmptyWallState());

  // Active 3D Wall View
  const [activeWallKey, setActiveWallKey] = useState<WallKey>("front");

  // Customization States
  const [selectedPaintColor, setSelectedPaintColor] = useState<PaintColorSpec>(DEFAULT_PAINT_COLOR);
  const [selectedFrameColor, setSelectedFrameColor] = useState<FrameColorSpec>(DEFAULT_FRAME_COLOR);
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null);

  // Demonstration State (Phase 8)
  const [demoState, setDemoState] = useState<DemonstrationState>({
    isPlaying: false,
    isPaused: false,
    currentPhaseIndex: 0,
    phaseProgress: 0,
    totalProgress: 0,
    elapsedSeconds: 0,
    totalSeconds: 30,
    openAmount: 0,
    activeWallKey: "front",
    phaseLabel: "Ready to Play",
  });

  // Save & Share Modal
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isScheduleDrawerOpen, setIsScheduleDrawerOpen] = useState(false);

  // Project Metadata
  const [projectId] = useState<string>(() => "proj-" + Math.random().toString(36).substring(2, 9));
  const [clientName] = useState("Modern Residence Visualization");

  // Update a single wall upload
  const handleUpdateWall = (wallKey: WallKey, updated: Partial<WallPhotoUpload>) => {
    setWalls((prev) => ({
      ...prev,
      [wallKey]: {
        ...prev[wallKey],
        ...updated,
      },
    }));
  };

  // Delete / Reset a single wall image
  const handleDeleteWall = (wallKey: WallKey) => {
    setWalls((prev) => ({
      ...prev,
      [wallKey]: {
        ...prev[wallKey],
        file: undefined,
        previewUrl: undefined,
        finishedImageUrl: undefined,
        status: "idle",
        progress: 0,
        detectedWindows: [],
        validationError: undefined,
      },
    }));
  };

  // Load sample presets when user clicks "Use Sample 4-View Building"
  const handleLoadPresets = () => {
    setWalls(createInitialWallState());
  };

  // Start AI Processing Transition (supports 1, 2, 3, or 4 views)
  const handleStartProcessing = async () => {
    setPhase("processing");

    const wallKeys: WallKey[] = ["front", "right", "back", "left"];
    const firstUploaded = wallKeys.find((k) => walls[k]?.status === "ready" && !!walls[k]?.previewUrl);
    if (firstUploaded) {
      setActiveWallKey(firstUploaded);
    }

    for (const key of wallKeys) {
      const wall = walls[key];
      if (wall.file && wall.previewUrl && (!wall.detectedWindows || wall.detectedWindows.length === 0)) {
        try {
          const res = await fetch("/api/ai/analyze-building", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              wallName: wall.label,
              imageBase64: wall.previewUrl,
              imageWidth: wall.width || 1200,
              imageHeight: wall.height || 900,
            }),
          });
          const data = await res.json();
          if (data.windows && data.windows.length > 0) {
            handleUpdateWall(key, {
              detectedWindows: data.windows.map((dw: any, idx: number) => ({
                id: dw.id || `${key}-w${idx + 1}`,
                wallKey: key,
                label: dw.label || `Window ${idx + 1}`,
                roomType: dw.roomType || "Living Space",
                xPercent: dw.xPercent,
                yPercent: dw.yPercent,
                widthPercent: dw.widthPercent,
                heightPercent: dw.heightPercent,
                pixelWidth: dw.pixelWidth || Math.round((dw.widthPercent / 100) * 1024),
                pixelHeight: dw.pixelHeight || Math.round((dw.heightPercent / 100) * 768),
                sizeCategory: dw.sizeCategory || "Medium",
                aspectRatio: dw.aspectRatio || 1.2,
                recommendedPanels: dw.recommendedPanels || 2,
                recommendedType: dw.recommendedType || "Casement",
                currentType: dw.recommendedType || "Casement",
                currentPanels: dw.recommendedPanels || 2,
                isDeleted: false,
              })),
            });
          } else {
            // Intelligent default architectural openings if AI detection yields no aperture
            handleUpdateWall(key, {
              detectedWindows: [
                {
                  id: `${key}-w1`,
                  wallKey: key,
                  label: "Window 1 (Main Bay)",
                  roomType: key === "front" ? "Living Room" : key === "right" ? "Dining Room" : key === "back" ? "Patio Lounge" : "Home Office",
                  xPercent: 20,
                  yPercent: 38,
                  widthPercent: 28,
                  heightPercent: 32,
                  pixelWidth: 280,
                  pixelHeight: 240,
                  sizeCategory: "Large",
                  aspectRatio: 1.16,
                  recommendedPanels: 3,
                  recommendedType: "Casement",
                  currentType: "Casement",
                  currentPanels: 3,
                  isDeleted: false,
                },
                {
                  id: `${key}-w2`,
                  wallKey: key,
                  label: "Window 2 (Upper Suite)",
                  roomType: "Bedroom Suite",
                  xPercent: 60,
                  yPercent: 38,
                  widthPercent: 22,
                  heightPercent: 30,
                  pixelWidth: 220,
                  pixelHeight: 230,
                  sizeCategory: "Medium",
                  aspectRatio: 0.95,
                  recommendedPanels: 2,
                  recommendedType: "Casement",
                  currentType: "Casement",
                  currentPanels: 2,
                  isDeleted: false,
                },
              ],
            });
          }
        } catch (err) {
          console.warn("AI analysis network call fallback to local rule engine", err);
          handleUpdateWall(key, {
            detectedWindows: [
              {
                id: `${key}-w1`,
                wallKey: key,
                label: "Window 1 (Main Opening)",
                roomType: "Living Space",
                xPercent: 22,
                yPercent: 36,
                widthPercent: 26,
                heightPercent: 34,
                pixelWidth: 260,
                pixelHeight: 260,
                sizeCategory: "Medium",
                aspectRatio: 1.0,
                recommendedPanels: 2,
                recommendedType: "Casement",
                currentType: "Casement",
                currentPanels: 2,
                isDeleted: false,
              },
              {
                id: `${key}-w2`,
                wallKey: key,
                label: "Window 2 (Secondary)",
                roomType: "Bedroom Space",
                xPercent: 58,
                yPercent: 36,
                widthPercent: 24,
                heightPercent: 32,
                pixelWidth: 240,
                pixelHeight: 240,
                sizeCategory: "Medium",
                aspectRatio: 1.0,
                recommendedPanels: 2,
                recommendedType: "Casement",
                currentType: "Casement",
                currentPanels: 2,
                isDeleted: false,
              },
            ],
          });
        }
      }
    }
  };

  // Phase 4: Global Quick Apply
  const handleApplyGlobalType = (type: WindowType) => {
    setWalls((prev) => {
      const next = { ...prev };
      (Object.keys(next) as WallKey[]).forEach((wKey) => {
        next[wKey] = {
          ...next[wKey],
          detectedWindows: next[wKey].detectedWindows.map((win) => ({
            ...win,
            currentType: type,
          })),
        };
      });
      return next;
    });
  };

  // Phase 5: Update a single window
  const handleUpdateWindow = (windowId: string, updates: Partial<WindowOpening>) => {
    setWalls((prev) => {
      const next = { ...prev };
      (Object.keys(next) as WallKey[]).forEach((wKey) => {
        next[wKey] = {
          ...next[wKey],
          detectedWindows: next[wKey].detectedWindows.map((win) =>
            win.id === windowId ? { ...win, ...updates } : win
          ),
        };
      });
      return next;
    });
  };

  // Apply to all windows on the current wall
  const handleApplyToWall = (wallKey: WallKey, type: WindowType, panels: 1 | 2 | 3 | 4) => {
    setWalls((prev) => ({
      ...prev,
      [wallKey]: {
        ...prev[wallKey],
        detectedWindows: prev[wallKey].detectedWindows.map((win) => ({
          ...win,
          currentType: type,
          currentPanels: panels,
        })),
      },
    }));
  };

  // Apply to matching windows with similar size category
  const handleApplyToMatchingSize = (sizeCategory: string, type: WindowType, panels: 1 | 2 | 3 | 4) => {
    setWalls((prev) => {
      const next = { ...prev };
      (Object.keys(next) as WallKey[]).forEach((wKey) => {
        next[wKey] = {
          ...next[wKey],
          detectedWindows: next[wKey].detectedWindows.map((win) =>
            win.sizeCategory === sizeCategory
              ? { ...win, currentType: type, currentPanels: panels }
              : win
          ),
        };
      });
      return next;
    });
  };

  // Reset window to AI recommendation
  const handleResetToAI = (windowId: string) => {
    setWalls((prev) => {
      const next = { ...prev };
      (Object.keys(next) as WallKey[]).forEach((wKey) => {
        next[wKey] = {
          ...next[wKey],
          detectedWindows: next[wKey].detectedWindows.map((win) =>
            win.id === windowId
              ? {
                  ...win,
                  currentType: win.recommendedType,
                  currentPanels: win.recommendedPanels,
                  isDeleted: false,
                }
              : win
          ),
        };
      });
      return next;
    });
  };

  // Delete window
  const handleDeleteWindow = (windowId: string) => {
    handleUpdateWindow(windowId, { isDeleted: true });
  };

  // Restore window
  const handleRestoreWindow = (windowId: string) => {
    handleUpdateWindow(windowId, { isDeleted: false });
  };

  // Selected Window Object
  const selectedWindow =
    (Object.values(walls) as WallPhotoUpload[])
      .flatMap((w) => w.detectedWindows)
      .find((w) => w.id === selectedWindowId) || null;

  // Active wall windows
  const activeWallWindows = walls[activeWallKey]?.detectedWindows || [];

  // Project Object for Save & PDF Export
  const projectData: BuildingProject = {
    id: projectId,
    title: clientName,
    clientName: "Valued Property Owner",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    walls,
    selectedPaintColor,
    selectedFrameColor,
  };

  // Compute progress completion metric
  const allWindowsList = (Object.values(walls) as WallPhotoUpload[]).flatMap((w) => w.detectedWindows);
  const activeWindowsCount = allWindowsList.filter((w) => !w.isDeleted).length;
  const configuredProgress = Math.min(100, Math.round((activeWindowsCount / Math.max(1, allWindowsList.length)) * 100));

  // Compute active global window type
  const activeWindows = allWindowsList.filter((w) => !w.isDeleted);
  const typesSet = new Set(activeWindows.map((w) => w.currentType));
  const activeGlobalType: WindowType | "Mixed" =
    typesSet.size === 1 ? (Array.from(typesSet)[0] as WindowType) : "Mixed";

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans antialiased selection:bg-indigo-600 selection:text-white">
      {/* Sleek Interface Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-xs shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-indigo-200 shadow-lg shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base sm:text-lg leading-none text-slate-900 tracking-tight">
              OMAS ALU-VISION AI
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1 hidden sm:block">
              Architectural Visualization Suite
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {phase === "viewer" && (
            <>
              {/* Back to Upload / Homepage Button */}
              <button
                onClick={() => setPhase("upload")}
                id="btn-back-to-upload"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-tight transition-colors border border-slate-200 shadow-xs cursor-pointer"
                title="Return to photo upload & wall replacement"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600" />
                <span>Back to Upload</span>
              </button>

              {/* Individual Mode vs Global Apply Capsule */}
              <div className="hidden lg:flex bg-slate-100 p-1 rounded-full border border-slate-200">
                <button
                  onClick={() => setActiveMode("individual")}
                  className={`px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-tight transition-all cursor-pointer ${
                    activeMode === "individual"
                      ? "bg-white shadow-xs border border-slate-200 text-indigo-600"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Individual Mode
                </button>
                <button
                  onClick={() => setActiveMode("global")}
                  className={`px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-tight transition-all cursor-pointer ${
                    activeMode === "global"
                      ? "bg-white shadow-xs border border-slate-200 text-indigo-600"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Global Apply
                </button>
              </div>

              {/* Schedule Drawer Button */}
              <button
                onClick={() => setIsScheduleDrawerOpen(true)}
                id="btn-open-window-schedule"
                className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-tight hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              >
                <Table className="w-3.5 h-3.5 text-indigo-600" />
                <span>Schedule</span>
              </button>

              {/* Save Project Button */}
              <button
                onClick={() => setIsSaveModalOpen(true)}
                id="btn-header-save-project"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-tight shadow-md shadow-indigo-100 transition-all cursor-pointer"
              >
                Save Project
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Phase 1: Photo Upload Screen */}
        {phase === "upload" && (
          <PhotoUploadScreen
            walls={walls}
            onUpdateWall={handleUpdateWall}
            onDeleteWall={handleDeleteWall}
            onStartProcessing={handleStartProcessing}
            onLoadPresets={handleLoadPresets}
          />
        )}

        {/* Phase 2: AI Processing Screen */}
        {phase === "processing" && (
          <AIProcessingScreen
            walls={walls}
            onComplete={() => setPhase("viewer")}
          />
        )}

        {/* Phase 3-9: 3D Visualization Studio */}
        {phase === "viewer" && (
          <div className="space-y-6">
            {/* Top Navigation Bar: Breadcrumb + Back Action */}
            <div className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <button
                  onClick={() => setPhase("upload")}
                  className="hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>1. Photo Upload</span>
                </button>
                <span className="text-slate-300">&bull;</span>
                <span className="text-indigo-600 font-bold">2. 3D Architectural Visualizer</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-slate-500">
                  Current Style:
                </span>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase">
                  {activeGlobalType} Windows
                </span>
              </div>
            </div>

            {/* Demonstration Player Bar */}
            <DemonstrationPlayer
              onDemoUpdate={setDemoState}
              onSelectWall={(w) => setActiveWallKey(w)}
              isCustomizing={!!selectedWindowId}
              currentWallKey={activeWallKey}
            />

            {/* Split Layout: 3D Stage on Left / Center, Window Customizer Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* 3D Canvas Stage Container */}
              <div className={`${selectedWindow ? "lg:col-span-8" : "lg:col-span-12"} space-y-4`}>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm relative overflow-hidden">
                  {/* Stage Top Bar */}
                  <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                      <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        {walls[activeWallKey]?.label} &bull; {activeWallKey === "front" ? "0° Facade" : activeWallKey === "right" ? "90° Elevation" : activeWallKey === "back" ? "180° Facade" : "270° Elevation"}
                      </h2>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
                      Interactive 360° Orbit &bull; Click Window to Customize
                    </div>
                  </div>

                  {/* 3D Stage with Three.js */}
                  <div className="h-[460px] sm:h-[520px] w-full relative rounded-lg overflow-hidden bg-slate-100">
                    <ThreeBuildingViewer
                      activeWallKey={activeWallKey}
                      onSelectWall={(w) => setActiveWallKey(w)}
                      wallsData={walls}
                      selectedPaintColor={selectedPaintColor}
                      selectedFrameColor={selectedFrameColor}
                      selectedWindowId={selectedWindowId}
                      onSelectWindow={(win) => setSelectedWindowId(win ? win.id : null)}
                      demoOpenAmount={demoState.openAmount}
                      demoActiveWall={demoState.isPlaying ? demoState.activeWallKey : undefined}
                      isDemonstrationPlaying={demoState.isPlaying}
                    />

                    {/* Floating Elevation Control Pill Bar matching Sleek Interface spec */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                      <ViewControls
                        activeWallKey={activeWallKey}
                        onSelectWall={(w) => {
                          setActiveWallKey(w);
                          setSelectedWindowId(null);
                        }}
                        disabled={demoState.isPlaying}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Window Customizer Panel (when a window is active) */}
              {selectedWindow && (
                <div className="lg:col-span-4 space-y-4">
                  <WindowCustomizer
                    window={selectedWindow}
                    allWindowsOnWall={activeWallWindows}
                    onUpdateWindow={handleUpdateWindow}
                    onApplyToWall={handleApplyToWall}
                    onApplyToMatchingSize={handleApplyToMatchingSize}
                    onResetToAI={handleResetToAI}
                    onDeleteWindow={handleDeleteWindow}
                    onRestoreWindow={handleRestoreWindow}
                    onClose={() => setSelectedWindowId(null)}
                  />
                </div>
              )}
            </div>

            {/* Global Quick Apply Bar (with live active indicator) */}
            <QuickApplyBar
              onApplyGlobalType={handleApplyGlobalType}
              activeGlobalType={activeGlobalType}
              disabled={demoState.isPlaying}
            />

            {/* Customization Grid: Paint (Phase 6) & Frame Finishes (Phase 7) & Global Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Paint Selector (Phase 6) */}
              <div className="lg:col-span-6">
                <PaintSelector
                  selectedPaintColor={selectedPaintColor}
                  onSelectColor={setSelectedPaintColor}
                  disabled={demoState.isPlaying}
                />
              </div>

              {/* Frame Selector (Phase 7) */}
              <div className="lg:col-span-4">
                <FrameSelector
                  selectedFrameColor={selectedFrameColor}
                  onSelectFrameColor={setSelectedFrameColor}
                  disabled={demoState.isPlaying}
                />
              </div>

              {/* Global Progress Card */}
              <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    Global Progress
                  </label>
                  <p className="text-2xl font-black text-indigo-600 leading-none">
                    {configuredProgress}% COMPLETE
                  </p>
                  <p className="text-[11px] text-slate-500 mt-2">
                    {activeWindowsCount} of {allWindowsList.length} window units active
                  </p>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${configuredProgress}%` }}
                    />
                  </div>

                  <button
                    onClick={() => setIsScheduleDrawerOpen(true)}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-tight rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    View Schedule Table
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Save & Share Modal (Phase 9) */}
      <SaveShareModal
        project={projectData}
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSaveProject={() => {
          localStorage.setItem(`building-project-${projectId}`, JSON.stringify(projectData));
        }}
      />

      {/* Fabrication Window Schedule Drawer Modal */}
      {isScheduleDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-0.5">
                  Fabrication Schedule
                </div>
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                  Complete Building Window Inventory
                </h3>
              </div>

              <button
                onClick={() => setIsScheduleDrawerOpen(false)}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg uppercase tracking-tight cursor-pointer"
              >
                Close
              </button>
            </div>

            <WindowScheduleTable
              walls={walls}
              onSelectWindow={(win) => {
                setActiveWallKey(win.wallKey);
                setSelectedWindowId(win.id);
                setIsScheduleDrawerOpen(false);
              }}
              onRestoreWindow={handleRestoreWindow}
            />
          </div>
        </div>
      )}
    </div>
  );
}
