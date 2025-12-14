import React from 'react';
import { Recording } from '../types';
import { Play, Share2, Trash2, Download, Film } from 'lucide-react';

interface RecordingListProps {
  recordings: Recording[];
  onDelete: (id: string) => void;
}

export const RecordingList: React.FC<RecordingListProps> = ({ recordings, onDelete }) => {
  if (recordings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 opacity-60">
        <Film size={48} className="mb-4 stroke-1" />
        <p className="text-lg font-medium">Nenhuma gravação ainda</p>
        <p className="text-sm">Suas gravações aparecerão aqui</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-20">
      {recordings.map((rec) => (
        <div key={rec.id} className="bg-slate-800 rounded-2xl p-4 border border-slate-700 shadow-sm animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-slate-200 text-sm">{rec.name}</h3>
              <p className="text-xs text-slate-400 mt-1">
                {(rec.size / (1024 * 1024)).toFixed(2)} MB • {new Date(rec.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <div className="bg-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-slate-300">
              {Math.floor(rec.duration / 60)}:{Math.floor(rec.duration % 60).toString().padStart(2, '0')}
            </div>
          </div>

          {/* Video Preview */}
          <video 
            src={rec.url} 
            controls 
            className="w-full rounded-xl bg-black aspect-video mb-4 border border-slate-900/50" 
          />

          {/* Actions */}
          <div className="flex gap-2">
            <a
              href={rec.url}
              download={`recording-${rec.timestamp}.webm`}
              className="flex-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
            >
              <Download size={16} />
              Baixar
            </a>
            
            <button
              onClick={() => {
                if (navigator.share) {
                    const file = new File([rec.blob], `screen-rec-${rec.timestamp}.webm`, { type: rec.blob.type });
                    navigator.share({
                        files: [file],
                        title: 'Gravação de Tela',
                    }).catch(console.error);
                }
              }}
              className="flex-1 bg-slate-700/50 hover:bg-slate-700 text-slate-300 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
            >
              <Share2 size={16} />
              Partilhar
            </button>

            <button
              onClick={() => onDelete(rec.id)}
              className="w-10 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};