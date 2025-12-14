import React, { useState } from 'react';
import { Settings, Video, Mic, Monitor, List, Trash2, Share2, Play, AlertCircle, X, Download } from 'lucide-react';
import { useRecorder } from './hooks/useRecorder';
import { Recording } from './types';
import { RecordingList } from './components/RecordingList';
import { ControlPanel } from './components/ControlPanel';

const App: React.FC = () => {
  const {
    isRecording,
    isPaused,
    recordingTime,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    recordings,
    deleteRecording,
    config,
    setConfig,
    error,
    clearError
  } = useRecorder();

  const [activeTab, setActiveTab] = useState<'record' | 'list'>('record');

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-md p-4 flex justify-between items-center border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/20">
            <Video size={18} className="text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight">Gravador Pro</h1>
        </div>
        <button 
          onClick={() => setActiveTab(activeTab === 'record' ? 'list' : 'record')}
          className="p-2 rounded-full hover:bg-slate-800 transition-colors relative"
        >
          {activeTab === 'record' ? <List size={24} /> : <Video size={24} />}
          {activeTab === 'record' && recordings.length > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-slate-900"></span>
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-md flex-1 p-4 flex flex-col gap-6">
        
        {/* Error Notification */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-xl flex items-start gap-3 text-sm animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
            <button onClick={clearError} className="p-1 hover:bg-red-500/20 rounded">
              <X size={16} />
            </button>
          </div>
        )}

        {activeTab === 'record' ? (
          <>
            {/* Timer Display */}
            <div className="flex flex-col items-center justify-center py-10 relative">
              <div className={`text-6xl font-mono font-medium tracking-wider transition-colors duration-300 ${isRecording ? 'text-red-500' : 'text-slate-400'}`}>
                {formatTime(recordingTime)}
              </div>
              <div className="flex items-center gap-2 mt-2 text-slate-500 text-sm font-medium uppercase tracking-widest">
                {isRecording ? (
                  <>
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    {isPaused ? 'Pausado' : 'Gravando'}
                  </>
                ) : (
                  'Pronto para gravar'
                )}
              </div>
            </div>

            {/* Config Toggles */}
            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={isRecording}
                onClick={() => setConfig(prev => ({ ...prev, audio: !prev.audio }))}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
                  config.audio 
                    ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' 
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Mic size={24} />
                <span className="text-xs font-medium">Microfone {config.audio ? 'On' : 'Off'}</span>
              </button>

              <button
                 disabled={isRecording}
                 onClick={() => setConfig(prev => ({ ...prev, systemAudio: !prev.systemAudio }))}
                 className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
                   config.systemAudio 
                     ? 'bg-purple-600/10 border-purple-500/50 text-purple-400' 
                     : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                 } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Monitor size={24} />
                <span className="text-xs font-medium">Sistema {config.systemAudio ? 'On' : 'Off'}</span>
              </button>
            </div>

            {/* Quality Selector */}
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
              <h3 className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">Qualidade de Vídeo</h3>
              <div className="flex gap-2">
                {[
                  { id: '720p', label: 'HD 720p' },
                  { id: '1080p', label: 'FHD 1080p' }
                ].map((q) => (
                  <button
                    key={q.id}
                    disabled={isRecording}
                    onClick={() => setConfig(prev => ({ ...prev, quality: q.id as '720p' | '1080p' }))}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      config.quality === q.id
                        ? 'bg-white text-slate-900 shadow-lg'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Controls */}
            <div className="mt-auto pb-6">
              <ControlPanel
                isRecording={isRecording}
                isPaused={isPaused}
                onStart={startRecording}
                onStop={stopRecording}
                onPause={pauseRecording}
                onResume={resumeRecording}
              />
            </div>
          </>
        ) : (
          <RecordingList recordings={recordings} onDelete={deleteRecording} />
        )}
      </main>
    </div>
  );
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default App;