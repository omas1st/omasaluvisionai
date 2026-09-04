import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="pwa-offline-indicator"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900/95 text-white px-3.5 py-2 text-xs font-medium shadow-xl backdrop-blur-md border border-slate-700 animate-in slide-in-from-bottom-2 duration-300"
    >
      <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
      <WifiOff className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
      <span>
        <strong className="text-amber-300 font-bold">Offline Mode:</strong> Cached 3D visualizer & local rules active
      </span>
    </div>
  );
};
