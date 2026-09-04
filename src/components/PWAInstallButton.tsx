import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, Smartphone, Monitor } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running inside an installed PWA window, do not render
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        id="btn-pwa-install"
        title="Install OMAS ALU-VISION AI for offline use on PC, Phone & Tablet"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-tight shadow-sm shadow-emerald-200 transition-all cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">Install</span>
      </button>

      {/* Guide Dialog for iOS Safari & Manual Installation */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-slate-800">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Install OMAS ALU-VISION AI
                  </h3>
                  <p className="text-xs text-slate-500">
                    Works 100% offline on PC, Android, iPhone & iPad
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Platform Instructions */}
            <div className="mt-4 space-y-4">
              {isIOS ? (
                <div className="space-y-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 uppercase tracking-wider">
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    <span>iPhone & iPad Safari Instructions</span>
                  </div>
                  <ol className="text-xs text-slate-700 space-y-2.5 pl-1">
                    <li className="flex items-start gap-2.5">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-200 text-indigo-800 font-bold text-[11px] flex items-center justify-center">
                        1
                      </span>
                      <span>
                        Tap the <strong className="text-indigo-900 inline-flex items-center gap-1"><Share2 className="w-3.5 h-3.5 inline" /> Share</strong> button at the bottom of Safari.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-200 text-indigo-800 font-bold text-[11px] flex items-center justify-center">
                        2
                      </span>
                      <span>
                        Scroll down the menu and tap <strong className="text-indigo-900 inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5 inline" /> Add to Home Screen</strong>.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-200 text-indigo-800 font-bold text-[11px] flex items-center justify-center">
                        3
                      </span>
                      <span>
                        Tap <strong>Add</strong> in the top right corner. The app will appear on your home screen with its official icon.
                      </span>
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1.5">
                      <Monitor className="w-4 h-4 text-indigo-600" />
                      <span>On Desktop PC / Mac / Laptop</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Click the <strong>Install</strong> icon in your browser address bar (top-right of Chrome, Edge, or Brave) or click the green <strong>Install App</strong> button above to install directly onto your desktop.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <span>On Android Phone or Tablet</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Tap the <strong>three dots menu (&vellip;)</strong> in Chrome and select <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
                    </p>
                  </div>
                </div>
              )}

              {/* Offline highlight */}
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs">
                <strong>Offline Benefit:</strong> Once installed, the 3D building visualizer, window schedules, color selector, and casement animations load instantly and work without any internet connection.
              </div>
            </div>

            {/* Footer action */}
            <div className="mt-5">
              <button
                onClick={() => setShowGuide(false)}
                className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 py-2.5 text-xs font-bold text-slate-700 transition cursor-pointer uppercase tracking-tight"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
