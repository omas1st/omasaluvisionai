import React, { useState } from "react";
import { BuildingProject } from "../types";
import { generateFabricationPDFReport } from "../utils/pdfGenerator";
import {
  Save,
  FileText,
  Share2,
  Copy,
  Check,
  X,
  Users,
  HardHat,
  Landmark,
  ShieldCheck,
  Calendar,
} from "lucide-react";

interface SaveShareModalProps {
  project: BuildingProject;
  isOpen: boolean;
  onClose: () => void;
  onSaveProject: () => void;
}

export const SaveShareModal: React.FC<SaveShareModalProps> = ({
  project,
  isOpen,
  onClose,
  onSaveProject,
}) => {
  const [copied, setCopied] = useState(false);
  const [expiryOption, setExpiryOption] = useState<"30days" | "never">("30days");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}?project=${project.id}&viewonly=true`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await generateFabricationPDFReport(project);
    } catch (e) {
      console.error("PDF generation failed", e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">
              Phase 9: Export Suite
            </div>
            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
              Save Project &amp; Export
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Action Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. Save Project */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Save className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight">Save Project</h4>
              <p className="text-[11px] text-slate-500">
                Saves customizations &amp; window schedules to cloud storage.
              </p>
            </div>

            <button
              onClick={() => {
                onSaveProject();
                alert("Project state saved successfully!");
              }}
              id="btn-confirm-save-project"
              className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold uppercase tracking-tight shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Save Project
            </button>
          </div>

          {/* 2. Download PDF Report */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight">Report PDF</h4>
              <p className="text-[11px] text-slate-500">
                Full architectural specification and fabrication schedule.
              </p>
            </div>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              id="btn-download-pdf-report"
              className="w-full py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-tight text-slate-700 shadow-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {isGeneratingPdf ? "Generating..." : "Report PDF"}
            </button>
          </div>

          {/* 3. Copy Share Link */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Share2 className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight">Copy Link</h4>
              <p className="text-[11px] text-slate-500">
                Shareable view-only link for contractors &amp; architects.
              </p>
            </div>

            <button
              onClick={handleCopyLink}
              id="btn-copy-share-link"
              className="w-full py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-tight text-slate-700 shadow-xs hover:bg-slate-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy Link
                </>
              )}
            </button>
          </div>
        </div>

        {/* Link Security */}
        <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Link Expiry
            </span>

            <div className="flex items-center gap-3 text-[11px]">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="expiry"
                  checked={expiryOption === "30days"}
                  onChange={() => setExpiryOption("30days")}
                  className="accent-indigo-600"
                />
                <span>30 Days</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="expiry"
                  checked={expiryOption === "never"}
                  onChange={() => setExpiryOption("never")}
                  className="accent-indigo-600"
                />
                <span>Never</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-[10px] text-slate-600">
            <div className="flex items-center gap-1">
              <HardHat className="w-3 h-3 text-amber-600 shrink-0" />
              <span>Contractors</span>
            </div>
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-indigo-600 shrink-0" />
              <span>Architects</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>Family</span>
            </div>
            <div className="flex items-center gap-1">
              <Landmark className="w-3 h-3 text-blue-600 shrink-0" />
              <span>Bank Loans</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
