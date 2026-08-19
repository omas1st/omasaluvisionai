import React, { useEffect, useState } from "react";
import { Sparkles, Building2, CheckCircle2, Box, Cpu } from "lucide-react";
import { WallKey, WallPhotoUpload } from "../types";

interface AIProcessingScreenProps {
  walls: Record<WallKey, WallPhotoUpload>;
  onComplete: () => void;
}

export const AIProcessingScreen: React.FC<AIProcessingScreenProps> = ({
  walls,
  onComplete,
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(16);

  const steps = [
    { label: "Analyzing your building photos...", desc: "Extracting blockwork geometry, wall boundaries, and architectural perspective" },
    { label: "Detecting window openings...", desc: "Measuring pixel coordinates, aspect ratios, and lintel heights for each wall" },
    { label: "Designing your building...", desc: "Applying intelligent panel configurations & rendering smooth plaster finish" },
    { label: "Almost ready...", desc: "Constructing interactive 3D scene and aluminum window frames" },
  ];

  useEffect(() => {
    const totalDurationMs = 16000;
    const intervalMs = 100;
    const increment = (intervalMs / totalDurationMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 600);
          return 100;
        }

        if (next < 28) setCurrentStepIndex(0);
        else if (next < 58) setCurrentStepIndex(1);
        else if (next < 88) setCurrentStepIndex(2);
        else setCurrentStepIndex(3);

        const remainingSeconds = Math.max(1, Math.ceil(((100 - next) / 100) * 16));
        setTimeLeft(remainingSeconds);

        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC]/95 text-slate-800 backdrop-blur-xl flex flex-col items-center justify-center p-6 select-none overflow-y-auto">
      <div className="max-w-xl w-full text-center space-y-6 my-auto">
        {/* Animated Building Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-indigo-200 shadow-xl">
            <Building2 className="w-10 h-10 text-white animate-bounce" />
          </div>
        </div>

        {/* Dynamic Step Text */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-widest">
            <Cpu className="w-3.5 h-3.5" />
            AI Processing Engine
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {steps[currentStepIndex].label}
          </h2>
          <p className="text-slate-500 text-xs max-w-sm mx-auto">
            {steps[currentStepIndex].desc}
          </p>
        </div>

        {/* Progress Bar & Countdown Timer */}
        <div className="space-y-2 max-w-md mx-auto">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <span>Progress: {Math.round(progress)}%</span>
            <span className="text-indigo-600">
              Est: ~{timeLeft}s
            </span>
          </div>

          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden p-0.5 border border-slate-300">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Multi-View Processing Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-lg mx-auto pt-2">
          {(["front", "right", "back", "left"] as WallKey[]).map((key, idx) => {
            const wall = walls[key];
            const hasUpload = wall?.status === "ready" && !!wall?.previewUrl;
            const isDone = progress >= (idx + 1) * 23;
            const isCurrent = !isDone && progress >= idx * 23;

            return (
              <div
                key={key}
                className={`p-3 rounded-lg border text-left transition-all ${
                  isDone
                    ? "bg-white border-emerald-300 text-emerald-800 shadow-xs"
                    : isCurrent
                    ? "bg-indigo-50 border-indigo-300 text-indigo-800 shadow-xs"
                    : "bg-slate-100 border-slate-200 text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1 uppercase tracking-tight">
                  <span>{wall?.label ? wall.label.split(" ")[0] : key}</span>
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : isCurrent ? (
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                  ) : (
                    <Box className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {isDone
                    ? hasUpload
                      ? "AI Analyzed"
                      : "Plaster Ready"
                    : isCurrent
                    ? "Processing..."
                    : "Queued"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
