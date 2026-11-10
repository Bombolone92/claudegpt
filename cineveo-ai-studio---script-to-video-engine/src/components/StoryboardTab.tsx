import React, { useState } from 'react';
import { 
  Film, 
  Play, 
  Camera, 
  MessageSquare, 
  Volume2, 
  Copy, 
  Check, 
  Sparkles, 
  Clock, 
  Plus, 
  Trash2, 
  ArrowRight,
  Tv,
  Eye,
  Sliders,
  Cpu,
  Activity,
  Edit3,
  X,
  Save,
  Zap,
  Users
} from 'lucide-react';
import { Project, VideoClip, TransitionType } from '../types';

interface StoryboardTabProps {
  project: Project;
  onUpdateProject: (updated: Partial<Project>) => void;
  onPlayClip: (clipIndex: number) => void;
  onPlayFullSequence: () => void;
}

export const StoryboardTab: React.FC<StoryboardTabProps> = ({
  project,
  onUpdateProject,
  onPlayClip,
  onPlayFullSequence,
}) => {
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<number | null>(null);
  const [editingClipIndex, setEditingClipIndex] = useState<number | null>(null);
  const [editingClipData, setEditingClipData] = useState<VideoClip | null>(null);

  const clips = project.clips || [];
  const brain = project.brainAnalysis;

  const handleCopyPrompt = (prompt: string, index: number) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPromptIndex(index);
    setTimeout(() => setCopiedPromptIndex(null), 2000);
  };

  const handleOpenEditClip = (index: number) => {
    setEditingClipIndex(index);
    setEditingClipData({ ...clips[index] });
  };

  const handleSaveEditClip = () => {
    if (editingClipIndex === null || !editingClipData) return;
    const updatedClips = [...clips];
    updatedClips[editingClipIndex] = editingClipData;
    const newTotal = updatedClips.reduce((acc, c) => acc + (c.durationSeconds || 15), 0);
    onUpdateProject({ clips: updatedClips, targetDuration: newTotal });
    setEditingClipIndex(null);
    setEditingClipData(null);
  };

  const handleDeleteClip = (index: number) => {
    if (clips.length <= 1) {
      alert('Il progetto deve contenere almeno 1 clip.');
      return;
    }
    const updatedClips = clips.filter((_, i) => i !== index).map((c, i) => ({ ...c, sequenceNumber: i + 1 }));
    const newTotal = updatedClips.reduce((acc, c) => acc + (c.durationSeconds || 15), 0);
    onUpdateProject({ clips: updatedClips, targetDuration: newTotal, clipCount: updatedClips.length });
  };

  const handleAddClip = () => {
    const newSeq = clips.length + 1;
    const newClip: VideoClip = {
      sequenceNumber: newSeq,
      title: `Scena ${newSeq}: Nuova Clip Dinamica`,
      durationSeconds: Math.min(15, project.maxClipDuration || 15),
      visualAction: 'I personaggi proseguono la loro interazione dinamica con movimenti decisi ed espressività marcata.',
      cameraMovement: 'Dolly In fluido con parallax',
      cameraAngle: 'Medium Close-Up (MCU)',
      transitionIn: 'Whip-Pan',
      tensionLevel: 8,
      dialogues: [
        { speaker: project.characters?.[0]?.name || 'Protagonista', text: 'Dobbiamo continuare, siamo vicini al traguardo.', emotion: 'Determinato' }
      ],
      soundDesign: 'Colonna sonora in crescendo ed effetti d\'ambiente.',
      veoPrompt: `${project.style} cinematic camera tracking, fluid dynamic character acting and dialogue, 60fps high quality rendering.`,
      status: 'ready'
    };

    const updatedClips = [...clips, newClip];
    const newTotal = updatedClips.reduce((acc, c) => acc + (c.durationSeconds || 15), 0);
    onUpdateProject({ clips: updatedClips, targetDuration: newTotal, clipCount: updatedClips.length });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header bar */}
      <div className="bg-[#0b0f17] border border-slate-800 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Film size={18} />
            </span>
            <h2 className="text-sm md:text-base font-bold text-white">
              Storyboard Dinamico Multi-Clip ({clips.length} Clip)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ogni clip rispetta il limite massimo di <strong className="text-indigo-300">{project.maxClipDuration}s</strong> per garantire massima qualità, movimenti fluidi e continuità narrativa.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleAddClip}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
          >
            <Plus size={14} />
            <span>Aggiungi Clip</span>
          </button>

          <button
            onClick={onPlayFullSequence}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/20 transition transform active:scale-98"
          >
            <Play size={14} />
            <span>Guarda Sequenza Completa ({project.targetDuration}s)</span>
          </button>
        </div>
      </div>

      {/* Cervello di Regia & Motore AI Panel */}
      <div className="bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-indigo-900/40 rounded-2xl p-4 md:p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-indigo-900/30 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Cpu size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Cervello di Regia & Motore AI (Analisi Cinematografica)
              </h3>
              <p className="text-[11px] text-slate-400">Pacing, coerenza di continuità e tensione drammatica</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold">
              <Activity size={13} className="text-emerald-400" />
              <span>Coerenza Continua: {brain?.cinematicContinuityScore || 98}%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          {/* Pacing & Rhythm */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Ritmo & Dinamica</span>
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Zap size={14} className="text-amber-400" />
              <span>{brain?.pacingRhythm || 'In Crescendo Adrenalinico'}</span>
            </div>
            <p className="text-[11px] text-slate-400">{brain?.cameraChoreographySummary || 'Transizioni fluide e coordinate tra le clip.'}</p>
          </div>

          {/* Tension Curve */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Curva di Tensione per Clip</span>
            <div className="flex items-end gap-1.5 h-9 pt-1">
              {(brain?.emotionalTensionCurve || clips.map((_, i) => 50 + (i * 20))).map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-0.5">
                  <div
                    className="w-full bg-gradient-to-t from-indigo-600 to-cyan-400 rounded-t"
                    style={{ height: `${Math.min(100, Math.max(20, val))}%` }}
                    title={`Clip ${idx + 1}: ${val}% Tensione`}
                  />
                  <span className="text-[9px] text-slate-400 font-mono">C{idx + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Acting directives */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Direttive di Recitazione</span>
            <p className="text-[11px] text-slate-300 line-clamp-2">
              {brain?.actingDirectives || 'Movimenti del corpo scattanti, respirazione visibile e contatto visivo vivo.'}
            </p>
            <div className="text-[10px] text-indigo-400 font-medium">BGM: {brain?.suggestedBgmGenre || 'Cinematic Score'}</div>
          </div>
        </div>
      </div>

      {/* Characters Cast Card */}
      <div className="bg-[#0b0f17] border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-start text-xs">
        <div className="space-y-1 max-w-xl">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users size={13} />
            <span>Cast Personaggi Dinamici</span>
          </span>
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {(project.characters || []).map((char, i) => (
              <div
                key={i}
                className="px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-200 flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                <span className="font-bold text-white">{char.name}</span>
                <span className="text-slate-400 text-[10px]">({char.role || 'Attore'})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1 text-slate-400 text-[11px] max-w-sm">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Visione del Regista</span>
          <p className="line-clamp-2">{project.directorsVision || 'Narrazione continua con telecamera e attori in movimento costante.'}</p>
        </div>
      </div>

      {/* Sequential Storyboard Clips Grid */}
      <div className="space-y-4">
        {clips.map((clip, index) => {
          const isCopied = copiedPromptIndex === index;

          return (
            <div
              key={index}
              className="bg-[#0b0f17] border border-slate-800/90 hover:border-slate-700 rounded-2xl p-4 md:p-5 shadow-sm transition space-y-4"
            >
              {/* Clip Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-400 font-mono text-xs font-bold border border-indigo-500/30">
                    CLIP {clip.sequenceNumber} di {clips.length}
                  </span>
                  <h3 className="text-sm font-bold text-white">
                    {clip.title}
                  </h3>
                  {clip.transitionIn && (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-850 text-indigo-300 border border-slate-800 font-semibold">
                      Transizione: {clip.transitionIn}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
                    <Clock size={12} className="text-cyan-400" />
                    <span>{clip.durationSeconds}s</span>
                  </span>

                  <button
                    onClick={() => handleOpenEditClip(index)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition"
                    title="Modifica scena"
                  >
                    <Edit3 size={12} />
                    <span>Modifica</span>
                  </button>

                  <button
                    onClick={() => onPlayClip(index)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-semibold transition"
                  >
                    <Play size={12} />
                    <span>Riproduci Clip</span>
                  </button>

                  <button
                    onClick={() => handleDeleteClip(index)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                    title="Elimina clip"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Clip Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                {/* Visual Action & Characters (6 cols) */}
                <div className="md:col-span-6 space-y-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Azione Fisica Dinamica
                    </span>
                    <p className="text-slate-200 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 leading-relaxed">
                      {clip.visualAction}
                    </p>
                  </div>

                  {/* Camera Choreography */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 flex items-center gap-2">
                      <Camera size={14} className="text-indigo-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">Movimento Camera:</span>
                        <span className="font-semibold text-slate-200">{clip.cameraMovement}</span>
                      </div>
                    </div>

                    {clip.cameraAngle && (
                      <div className="flex-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 flex items-center gap-2">
                        <Eye size={14} className="text-cyan-400 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 block">Angolazione:</span>
                          <span className="font-semibold text-slate-200">{clip.cameraAngle}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dialogues & Sound Design (6 cols) */}
                <div className="md:col-span-6 space-y-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Dialoghi Personaggi & Lipsync
                    </span>
                    <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                      {clip.dialogues && clip.dialogues.length > 0 ? (
                        clip.dialogues.map((dlg, dIdx) => (
                          <div key={dIdx} className="flex items-start gap-2 text-xs">
                            <span className="font-bold text-indigo-400 whitespace-nowrap">
                              {dlg.speaker}:
                            </span>
                            <span className="text-slate-200 italic">
                              "{dlg.text}"
                            </span>
                            {dlg.emotion && (
                              <span className="ml-auto text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded shrink-0">
                                {dlg.emotion}
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 italic">Nessun dialogo, azione muta.</p>
                      )}
                    </div>
                  </div>

                  {/* Sound FX */}
                  {clip.soundDesign && (
                    <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 text-slate-400 text-xs">
                      <Volume2 size={14} className="text-amber-400 shrink-0" />
                      <span className="line-clamp-1">{clip.soundDesign}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Veo / Omni Video Generation Prompt Bar */}
              <div className="bg-slate-950 p-3 rounded-xl border border-indigo-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles size={13} className="text-indigo-400" />
                    <span className="font-bold text-indigo-300 text-[11px] uppercase tracking-wider">
                      Prompt Ottimizzato Veo / Omni
                    </span>
                  </div>
                  <p className="text-slate-400 font-mono text-[11px] line-clamp-2">
                    {clip.veoPrompt}
                  </p>
                </div>

                <button
                  onClick={() => handleCopyPrompt(clip.veoPrompt, index)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition shrink-0"
                >
                  {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{isCopied ? 'Copiato!' : 'Copia Prompt'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clip Quick-Editor Modal */}
      {editingClipIndex !== null && editingClipData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b0f17] border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">
                Modifica Scena {editingClipData.sequenceNumber}
              </h3>
              <button
                onClick={() => setEditingClipIndex(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Titolo Scena:</label>
                <input
                  type="text"
                  value={editingClipData.title}
                  onChange={(e) => setEditingClipData({ ...editingClipData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Durata (max 15s):</label>
                  <input
                    type="number"
                    min={2}
                    max={15}
                    value={editingClipData.durationSeconds}
                    onChange={(e) => setEditingClipData({ ...editingClipData, durationSeconds: Math.min(15, Number(e.target.value)) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Transizione d'Entrata:</label>
                  <select
                    value={editingClipData.transitionIn || 'Whip-Pan'}
                    onChange={(e) => setEditingClipData({ ...editingClipData, transitionIn: e.target.value as TransitionType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  >
                    {['Whip-Pan', 'Cross-Dissolve', 'Match-Cut', 'Ink-Splash', 'Smash-Cut'].map((tr) => (
                      <option key={tr} value={tr}>{tr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Azione Fisica Dinamica:</label>
                <textarea
                  rows={3}
                  value={editingClipData.visualAction}
                  onChange={(e) => setEditingClipData({ ...editingClipData, visualAction: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white leading-relaxed"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Movimento di Camera:</label>
                <input
                  type="text"
                  value={editingClipData.cameraMovement}
                  onChange={(e) => setEditingClipData({ ...editingClipData, cameraMovement: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Prompt Text-to-Video Veo/Omni:</label>
                <textarea
                  rows={3}
                  value={editingClipData.veoPrompt}
                  onChange={(e) => setEditingClipData({ ...editingClipData, veoPrompt: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingClipIndex(null)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
              >
                Annulla
              </button>
              <button
                onClick={handleSaveEditClip}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold"
              >
                <Save size={14} />
                <span>Salva Modifiche</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
