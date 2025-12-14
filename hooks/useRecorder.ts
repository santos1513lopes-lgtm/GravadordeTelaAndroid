import { useState, useRef, useEffect, useCallback } from 'react';
import { Recording, RecordingConfig } from '../types';

export const useRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [config, setConfig] = useState<RecordingConfig>({
    audio: true,
    systemAudio: true,
    quality: '1080p'
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStreams();
    };
  }, []);

  const stopStreams = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const startRecording = async () => {
    setError(null);
    try {
      // 1. Get Screen Stream (System Audio comes with this if user selects it)
      const displayMediaOptions: DisplayMediaStreamOptions = {
        video: {
          width: config.quality === '1080p' ? 1920 : 1280,
          height: config.quality === '1080p' ? 1080 : 720,
          frameRate: 60
        },
        audio: config.systemAudio ? {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
        } : false
      };

      const screenStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);

      // 2. Handle Microphone if requested
      let finalStream = screenStream;
      
      if (config.audio) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 44100
            }
          });

          // Mix streams if we have both system audio and mic, or just add mic track if no system audio
          if (config.systemAudio && screenStream.getAudioTracks().length > 0) {
            finalStream = mixAudioStreams(screenStream, micStream);
          } else {
            // No system audio, just add mic tracks to the screen stream
            micStream.getAudioTracks().forEach(track => {
              screenStream.addTrack(track);
            });
            finalStream = screenStream;
          }
        } catch (err) {
          console.warn("Could not access microphone", err);
          setError("Microfone não detectado ou permissão negada. Gravando sem microfone.");
        }
      }

      // Check if user cancelled the screen selection dialog immediately
      screenStream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      streamRef.current = finalStream;
      
      // 3. Setup MediaRecorder
      // Prefer H.264 (mp4 compatible) if available, else standard webm
      const mimeType = [
        'video/webm;codecs=h264',
        'video/webm;codecs=vp9',
        'video/webm'
      ].find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';

      const recorder = new MediaRecorder(finalStream, {
        mimeType,
        videoBitsPerSecond: config.quality === '1080p' ? 8000000 : 4000000 // 8Mbps or 4Mbps
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const newRecording: Recording = {
          id: crypto.randomUUID(),
          blob,
          url,
          duration: (Date.now() - startTimeRef.current) / 1000,
          timestamp: Date.now(),
          size: blob.size,
          name: `Gravação ${new Date().toLocaleString('pt-BR')}`
        };
        
        setRecordings(prev => [newRecording, ...prev]);
        chunksRef.current = [];
        setIsRecording(false);
        setIsPaused(false);
        setRecordingTime(0);
        stopStreams();
      };

      recorder.start(1000); // Collect 1s chunks
      mediaRecorderRef.current = recorder;
      
      startTimeRef.current = Date.now();
      setIsRecording(true);
      
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error(err);
      setError("Falha ao iniciar gravação. Verifique as permissões.");
      stopStreams();
    }
  };

  const mixAudioStreams = (screenStream: MediaStream, micStream: MediaStream): MediaStream => {
    const ctx = new AudioContext();
    const dest = ctx.createMediaStreamDestination();

    if (screenStream.getAudioTracks().length > 0) {
      const screenSource = ctx.createMediaStreamSource(screenStream);
      screenSource.connect(dest);
    }
    
    if (micStream.getAudioTracks().length > 0) {
      const micSource = ctx.createMediaStreamSource(micStream);
      micSource.connect(dest);
    }

    const mixedTracks = dest.stream.getAudioTracks();
    const videoTracks = screenStream.getVideoTracks();
    
    return new MediaStream([...videoTracks, ...mixedTracks]);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const deleteRecording = (id: string) => {
    setRecordings(prev => {
      const rec = prev.find(r => r.id === id);
      if (rec) {
        URL.revokeObjectURL(rec.url);
      }
      return prev.filter(r => r.id !== id);
    });
  };

  const clearError = () => setError(null);

  return {
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
  };
};