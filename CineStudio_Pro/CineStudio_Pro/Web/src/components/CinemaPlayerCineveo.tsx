import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Download, 
  Sparkles, 
  Tv, 
  Clapperboard, 
  Camera, 
  Layers, 
  SkipForward, 
  SkipBack,
  Film,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { Project, VisualStyle } from '../types';
import { videoEngine } from '../services/videoEngine';
import { audioEngine } from '../services/audioEngine';

interface CinemaPlayerTabProps {
  project: Project;
  onUpdateProject: (updated: Partial<Project>) => void;
  initialClipIndex?: number;
  onOpenExportModal: () => void;
}

export const CinemaPlayerTab: React.FC<CinemaPlayerTabProps> = ({
  project,
  onUpdateProject,
  initialClipIndex = 0,
  onOpenExportModal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentClipIndex, setCurrentClipIndex] = useState(initialClipIndex);
  const [clipTime, setClipTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [lastSpokenDialogue, setLastSpokenDialogue] = useState<string | null>(null);

  const clips = project.clips || [];
  const currentClip = clips[currentClipIndex] || clips[0];
  const clipDuration = currentClip?.durationSeconds || 15;
  const totalDuration = clips.reduce((acc, c) => acc + (c.durationSeconds || 15), 0);

  // Switch visual styles on the fly
  const handleStyleChange = (style: VisualStyle) => {
    onUpdateProject({ style });
    audioEngine.startStyleAmbience(style);
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioEngine.setMuted(nextMute);
  };

  // Fullscreen
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Jump to specific clip
  const handleJumpToClip = (index: number) => {
    const safeIdx = Math.max(0, Math.min(clips.length - 1, index));
    setCurrentClipIndex(safeIdx);
    setClipTime(0);
    // calculate accumulated total time
    let acc = 0;
    for (let i = 0; i < safeIdx; i++) {
      acc += clips[i].durationSeconds || 15;
    }
    setTotalTime(acc);
    audioEngine.playWhoosh();
  };

  // Check speech trigger for character lip-sync
  useEffect(() => {
    if (!isPlaying || isMuted || !currentClip) return;
    const activeDialogue = videoEngine.getCurrentDialogue(currentClip, clipTime);
    if (activeDialogue && activeDialogue.text !== lastSpokenDialogue) {
      setLastSpokenDialogue(activeDialogue.text);
      audioEngine.speakDialogue(activeDialogue.text, activeDialogue.speaker);
    }
  }, [isPlaying, isMuted, clipTime, currentClip, lastSpokenDialogue]);

  // Main 60FPS render loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp = performance.now();

    const loop = (timestamp: number) => {
      const delta = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (isPlaying && clips.length > 0) {
        setClipTime((prevClipTime) => {
          const nextClipTime = prevClipTime + delta;
          const currentDur = clips[currentClipIndex]?.durationSeconds || 15;

          if (nextClipTime >= currentDur) {
            // Move to next clip or loop back to start
            if (currentClipIndex < clips.length - 1) {
              setCurrentClipIndex((prevIdx) => prevIdx + 1);
              audioEngine.playWhoosh();
              return 0;
            } else {
              // Sequence finished: stop or loop
              setIsPlaying(false);
              return currentDur;
            }
          }
          return nextClipTime;
        });

        setTotalTime((prevTotal) => Math.min(totalDuration, prevTotal + delta));
      }

      // Render to canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          videoEngine.renderFrame(
            ctx,
            canvas.width,
            canvas.height,
            project,
            currentClipIndex,
            clipTime,
            totalTime,
            { showSubtitles: true, showWatermark: true }
          );
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, clips, currentClipIndex, clipTime, totalTime, project, totalDuration]);

  // Handle Play/Pause
  const handleTogglePlay = () => {
    if (!isPlaying) {
      if (totalTime >= totalDuration) {
        setCurrentClipIndex(0);
        setClipTime(0);
        setTotalTime(0);
      }
      setIsPlaying(true);
      audioEngine.startStyleAmbience(project.style);
      audioEngine.playCinematicImpact();
    } else {
      setIsPlaying(false);
      audioEngine.stopAmbience();
      audioEngine.stopSpeech();
    }
  };

  const handleRestart = () => {
    setCurrentClipIndex(0);
    setClipTime(0);
    setTotalTime(0);
    setLastSpokenDialogue(null);
    audioEngine.playWhoosh();
  };

  // Timeline scrubber
  const handleScrubTimeline = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTotal = clickRatio * totalDuration;

    let accumulated = 0;
    let targetIndex = 0;
    let targetClipTime = 0;

    for (let i = 0; i < clips.length; i++) {
      const cDur = clips[i].durationSeconds || 15;
      if (targetTotal >= accumulated && targetTotal <= accumulated + cDur) {
        targetIndex = i;
        targetClipTime = targetTotal - accumulated;
        break;
      }
      accumulated += cDur;
    }

    setCurrentClipIndex(targetIndex);
    setClipTime(targetClipTime);
    setTotalTime(targetTotal);
  };

  // Aspect ratio aspect class
  const getAspectRatioClasses = () => {
    switch (project.aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] max-h-[72vh] mx-auto';
      case '1:1':
        return 'aspect-square max-h-[72vh] mx-auto';
      case '21:9':
        return 'aspect-[21/9] w-full';
      default:
        return 'aspect-video w-full';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 max-w-7xl mx-auto w-full">
      {/* Top Bar with Live Style Switching */}
      <div className="bg-[#0b0f17] border border-slate-800 rounded-2xl p-3 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <Film size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Cinema Dynamic Video Player</h2>
            <p className="text-[11px] text-slate-400">
              Rendering 60fps con movimenti cinematici continui, dialoghi sincroni e audio procedurale
            </p>
          </div>
        </div>

        {/* Live Visual Style Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80 overflow-x-auto no-scrollbar">
          {[
            { id: 'Manga Shōnen Action' as const, label: '🔥 Manga Shōnen', icon: Clapperboard },
            { id: 'Manga B&W Inchiostrato' as const, label: '✒️ Manga B&W', icon: Tv },
            { id: '2D Anime' as const, label: '⚡ 2D Anime', icon: Sparkles },
            { id: 'Cyberpunk Neo-Tokyo Anime' as const, label: '🌆 Cyberpunk', icon: Camera },
            { id: '3D Pixar Cartoon' as const, label: '🎨 3D Pixar', icon: Sparkles },
            { id: 'Film Cinema Hollywood' as const, label: '🎥 Hollywood', icon: Camera },
            { id: 'Black & White Vintage 50s/70s' as const, label: '📼 Noir 50s', icon: Tv },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => handleStyleChange(st.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                project.style === st.id
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <st.icon size={13} />
              <span>{st.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Video Screen Container */}
      <div
        ref={containerRef}
        className="relative bg-black rounded-2xl border border-slate-800/90 shadow-2xl overflow-hidden flex flex-col items-center justify-center group"
      >
        {/* Canvas Display */}
        <div className={`relative w-full ${getAspectRatioClasses()} flex items-center justify-center bg-[#070b12]`}>
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            className="w-full h-full object-contain cursor-pointer"
            onClick={handleTogglePlay}
          />

          {/* Big Play Button Overlay when paused */}
          {!isPlaying && (
            <button
              onClick={handleTogglePlay}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-indigo-600/85 hover:bg-indigo-500 text-white flex items-center justify-center shadow-2xl backdrop-blur-sm transition-all transform hover:scale-110 active:scale-95 group-hover:opacity-100"
            >
              <Play size={28} className="translate-x-0.5" />
            </button>
          )}
        </div>

        {/* Video Player Controls Bar */}
        <div className="w-full bg-gradient-to-t from-slate-950 via-slate-900/95 to-transparent px-4 py-3 border-t border-slate-800/80 space-y-2.5">
          {/* Multi-Clip Timeline Scrubber with Visual Segment Dividers */}
          <div
            onClick={handleScrubTimeline}
            className="relative h-2.5 bg-slate-800 hover:h-3.5 rounded-full cursor-pointer transition-all flex items-center overflow-hidden"
          >
            {/* Filled Progress */}
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-blue-500 rounded-full transition-all duration-75 relative"
              style={{ width: `${(totalTime / Math.max(1, totalDuration)) * 100}%` }}
            />

            {/* Segment Markers for each 15s clip */}
            {clips.map((_, i) => {
              let clipStartTotal = 0;
              for (let j = 0; j < i; j++) clipStartTotal += clips[j].durationSeconds || 15;
              const leftPercent = (clipStartTotal / Math.max(1, totalDuration)) * 100;

              return (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 w-0.5 bg-slate-950 z-10"
                  style={{ left: `${leftPercent}%` }}
                  title={`Clip ${i + 1}`}
                />
              );
            })}
          </div>

          {/* Bottom Controls Row */}
          <div className="flex items-center justify-between text-xs text-slate-300">
            {/* Left: Playback controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRestart}
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title="Ricomincia dall'inizio"
              >
                <RotateCcw size={16} />
              </button>

              <button
                onClick={() => handleJumpToClip(currentClipIndex - 1)}
                disabled={currentClipIndex <= 0}
                className="p-1.5 hover:text-white hover:bg-slate-800 disabled:opacity-30 rounded-lg transition"
                title="Clip precedente"
              >
                <SkipBack size={16} />
              </button>

              <button
                onClick={handleTogglePlay}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-600/30 transition transform active:scale-95"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>

              <button
                onClick={() => handleJumpToClip(currentClipIndex + 1)}
                disabled={currentClipIndex >= clips.length - 1}
                className="p-1.5 hover:text-white hover:bg-slate-800 disabled:opacity-30 rounded-lg transition"
                title="Clip successiva"
              >
                <SkipForward size={16} />
              </button>

              <button
                onClick={handleToggleMute}
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title={isMuted ? 'Riattiva Audio' : 'Disattiva Audio'}
              >
                {isMuted ? <VolumeX size={16} className="text-rose-400" /> : <Volume2 size={16} className="text-cyan-400" />}
              </button>

              {/* Time display */}
              <div className="ml-2 font-mono text-[11px] text-slate-400">
                <span className="text-white font-semibold">{totalTime.toFixed(1)}s</span>
                <span className="text-slate-600"> / </span>
                <span>{totalDuration.toFixed(1)}s</span>
              </div>
            </div>

            {/* Center: Current Clip Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-850 rounded-lg border border-slate-800 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-bold text-white">Clip {currentClipIndex + 1} di {clips.length}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">{currentClip?.cameraMovement}</span>
            </div>

            {/* Right: Fullscreen + Export Trigger */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleFullscreen}
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title="Schermo Intero"
              >
                <Maximize2 size={16} />
              </button>

              <button
                onClick={onOpenExportModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg font-bold text-xs shadow-md shadow-cyan-500/20 transition transform active:scale-95"
              >
                <Download size={14} />
                <span>Esporta HD</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Clip Mini Selector Bar */}
      <div className="bg-[#0b0f17] border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers size={14} className="text-indigo-400" />
            <span>Clip Sequenziali ({clips.length} Segmenti da max {project.maxClipDuration}s)</span>
          </h3>
          <span className="text-[11px] text-slate-400">Clicca su una clip per saltare subito a quella scena</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {clips.map((clip, idx) => {
            const isSelected = idx === currentClipIndex;
            return (
              <button
                key={idx}
                onClick={() => handleJumpToClip(idx)}
                className={`p-3 rounded-xl border text-left transition ${
                  isSelected
                    ? 'bg-indigo-950/70 border-indigo-500 shadow-md'
                    : 'bg-slate-900/50 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    CLIP {clip.sequenceNumber}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{clip.durationSeconds}s</span>
                </div>
                <div className="text-xs font-semibold text-white truncate">{clip.title}</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{clip.cameraMovement}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
