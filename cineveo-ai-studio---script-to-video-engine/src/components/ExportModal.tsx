import React, { useState } from 'react';
import { 
  X, 
  Download, 
  CheckCircle, 
  RefreshCw, 
  Film, 
  Sparkles, 
  FileCode, 
  FileText,
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExportResolution, Project } from '../types';
import { videoEngine } from '../services/videoEngine';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [resolution, setResolution] = useState<ExportResolution>('1080p');
  const [fps, setFps] = useState<30 | 60>(60);
  const [isExporting, setIsExporting] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalDuration = (project.clips || []).reduce((acc, c) => acc + (c.durationSeconds || 15), 0);

  const handleStartExport = async () => {
    setIsExporting(true);
    setProgressPercent(0);
    setStatusText('Inizializzazione rendering video in Alta Definizione...');
    setDownloadUrl(null);

    try {
      const blob = await videoEngine.exportVideoHD(
        project,
        resolution,
        fps,
        (percent, status) => {
          setProgressPercent(percent);
          setStatusText(status);
        }
      );

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setIsExporting(false);
      setProgressPercent(100);
      setStatusText('Rendering HD completato con successo!');

      // Trigger automatic download
      const a = document.createElement('a');
      a.href = url;
      const cleanTitle = (project.title || 'CineVeo_Video').replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `${cleanTitle}_${resolution}_${fps}fps.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

    } catch (err: any) {
      console.error('Export error:', err);
      alert('Errore durante l\'esportazione: ' + (err?.message || 'Errore sconosciuto'));
      setIsExporting(false);
    }
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(project, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(project.title || 'Progetto').replace(/\s+/g, '_')}_CineVeo.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportScriptText = () => {
    let text = `TITOLO: ${project.title}\n`;
    text += `STILE: ${project.style}\n`;
    text += `DURATA TOTALE: ${project.targetDuration}s (diviso in ${project.clips?.length || 1} clip da max ${project.maxClipDuration}s)\n\n`;
    text += `COPIONE ORIGINALE:\n${project.script}\n\n`;
    text += `PIANO DI REGIA MULTI-CLIP VEO/OMNI:\n`;
    (project.clips || []).forEach((c) => {
      text += `\n--- CLIP ${c.sequenceNumber}: ${c.title} (${c.durationSeconds}s) ---\n`;
      text += `Azione: ${c.visualAction}\n`;
      text += `Camera: ${c.cameraMovement} (${c.cameraAngle || 'MCU'})\n`;
      text += `Dialoghi:\n`;
      c.dialogues.forEach((d) => {
        text += `  ${d.speaker}: "${d.text}" [${d.emotion || 'neutro'}]\n`;
      });
      text += `Prompt Veo: ${c.veoPrompt}\n`;
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(project.title || 'Copione').replace(/\s+/g, '_')}_Sceneggiatura.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0b0f17] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Download size={18} />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-bold text-white">Esportazione Video Alta Definizione</h3>
              <p className="text-xs text-slate-400">Rendering multi-clip ad alto bitrate (WebM / 60 FPS)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 text-xs">
          {/* Resolution selection */}
          <div>
            <label className="font-bold text-slate-300 block mb-2">Risoluzione di Rendering:</label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: '1080p' as const, label: '1080p Full HD', sub: '1920x1080' },
                { id: '4K' as const, label: '4K Ultra HD', sub: '3840x2160' },
                { id: '720p' as const, label: '720p HD', sub: '1280x720' },
              ].map((res) => (
                <button
                  key={res.id}
                  disabled={isExporting}
                  onClick={() => setResolution(res.id)}
                  className={`p-3 rounded-xl border text-center transition ${
                    resolution === res.id
                      ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-xs">{res.label}</div>
                  <div className="text-[10px] text-slate-500">{res.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Framerate Selection */}
          <div>
            <label className="font-bold text-slate-300 block mb-2">Frame Rate (Fluidità):</label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 60 as const, label: '60 FPS (Ultra-Fluido)', sub: 'Movimenti di camera e personaggi perfetti' },
                { id: 30 as const, label: '30 FPS (Cinema Standard)', sub: 'Rendering più rapido' },
              ].map((f) => (
                <button
                  key={f.id}
                  disabled={isExporting}
                  onClick={() => setFps(f.id)}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    fps === f.id
                      ? 'bg-cyan-950/70 border-cyan-500 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-xs">{f.label}</div>
                  <div className="text-[10px] text-slate-500">{f.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Project Summary Banner */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1.5">
            <div className="flex justify-between text-slate-300">
              <span>Durata totale sequenza:</span>
              <strong className="text-white">{totalDuration} secondi</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Numero di clip continue:</span>
              <strong className="text-indigo-400">{project.clips?.length || 1} clip</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Stile Visivo applicato:</span>
              <strong className="text-cyan-400">{project.style}</strong>
            </div>
          </div>

          {/* Export Progress Bar */}
          {isExporting && (
            <div className="space-y-2 p-3 bg-slate-950 rounded-xl border border-indigo-500/40">
              <div className="flex justify-between text-xs">
                <span className="text-indigo-300 font-semibold flex items-center gap-1.5">
                  <RefreshCw size={12} className="animate-spin" />
                  <span>{statusText}</span>
                </span>
                <span className="font-bold text-white">{progressPercent}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-blue-500 transition-all duration-150"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Download Completed Notification */}
          {downloadUrl && !isExporting && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-400" />
                <span className="text-emerald-300 font-medium">Video pronto e scaricato!</span>
              </div>
              <a
                href={downloadUrl}
                download={`${(project.title || 'Video').replace(/\s+/g, '_')}_${resolution}.webm`}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold"
              >
                Riscarica File
              </a>
            </div>
          )}

          {/* Secondary export buttons */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
            <button
              onClick={handleExportScriptText}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition text-[11px]"
            >
              <FileText size={13} />
              <span>Esporta Copione (.txt)</span>
            </button>

            <button
              onClick={handleExportJson}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition text-[11px]"
            >
              <FileCode size={13} />
              <span>Esporta Pacchetto JSON</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#070a10] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            Chiudi
          </button>

          <button
            onClick={handleStartExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 transition transform active:scale-95 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Rendering in corso ({progressPercent}%)...</span>
              </>
            ) : (
              <>
                <Download size={14} />
                <span>Avvia Esportazione HD ({resolution})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
