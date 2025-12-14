import React from 'react';
import { Play, Pause, Square, Circle } from 'lucide-react';

interface ControlPanelProps {
  isRecording: boolean;
  isPaused: boolean;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isRecording,
  isPaused,
  onStart,
  onStop,
  onPause,
  onResume,
}) => {
  if (!isRecording) {
    return (
      <button
        onClick={onStart}
        className="w-full bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-2xl py-6 flex items-center justify-center gap-3 shadow-lg shadow-red-500/30 transition-all transform hover:scale-[1.02]"
      >
        <div className="bg-white rounded-full p-1">
          <Circle size={20} className="text-red-500 fill-red-500" />
        </div>
        <span className="text-xl font-bold">INICIAR GRAVAÇÃO</span>
      </button>
    );
  }

  return (
    <div className="flex gap-4 items-stretch h-20">
      <button
        onClick={isPaused ? onResume : onPause}
        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl flex items-center justify-center gap-2 border border-slate-700 transition-all"
      >
        {isPaused ? (
          <>
            <Play size={24} className="fill-current" />
            <span className="font-semibold">Retomar</span>
          </>
        ) : (
          <>
            <Pause size={24} className="fill-current" />
            <span className="font-semibold">Pausar</span>
          </>
        )}
      </button>

      <button
        onClick={onStop}
        className="flex-[1.5] bg-slate-100 hover:bg-white text-red-600 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all"
      >
        <Square size={24} className="fill-current" />
        <span className="font-bold text-lg">PARAR</span>
      </button>
    </div>
  );
};