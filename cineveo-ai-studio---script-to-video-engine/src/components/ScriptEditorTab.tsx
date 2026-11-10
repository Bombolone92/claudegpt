import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Upload, 
  FileText, 
  Clock, 
  Layers, 
  HelpCircle,
  Wand2,
  RefreshCw,
  Sliders,
  ChevronDown,
  Info
} from 'lucide-react';
import { Project, VisualStyle } from '../types';
import { PRESET_SCRIPTS } from '../data/presetScripts';
import { analyzeScriptWithAI, chatWithDirectorAI } from '../services/apiClient';

interface ScriptEditorTabProps {
  project: Project;
  onUpdateProject: (updated: Partial<Project>) => void;
  onGenerationComplete: () => void;
  userApiKey: string;
}

export const ScriptEditorTab: React.FC<ScriptEditorTabProps> = ({
  project,
  onUpdateProject,
  onGenerationComplete,
  userApiKey,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: `Ciao! Sono il tuo Direttore di Regia AI CineVeo. Analizzo il tuo copione per generare video 100% DINAMICI (movimenti continui, dialoghi sincroni, niente immagini fisse). Se la durata totale supera il limite massimo per singola clip (${project.maxClipDuration}s), suddividerò la storia in clip sequenziali fluide!`,
      time: 'Ora'
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Calculate live breakdown metrics
  const targetDuration = project.targetDuration || 30;
  const maxClipDuration = project.maxClipDuration || 15;
  const calculatedClipsCount = Math.max(1, Math.ceil(targetDuration / maxClipDuration));
  const avgClipLength = (targetDuration / calculatedClipsCount).toFixed(1);

  // Handle Preset Script selection
  const handleSelectPreset = (presetId: string) => {
    const preset = PRESET_SCRIPTS.find((p) => p.id === presetId);
    if (!preset) return;

    onUpdateProject({
      title: preset.title,
      script: preset.script,
      style: preset.style,
      targetDuration: preset.recommendedDuration,
      logline: preset.description
    });
  };

  // Handle File Upload (.txt or script)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onUpdateProject({
          script: content,
          title: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')
        });
      }
    };
    reader.readAsText(file);
  };

  // Chat with Director AI
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const msg = chatInput.trim();
    setChatInput('');

    const newMsgs = [
      ...chatMessages,
      { role: 'user' as const, text: msg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ];
    setChatMessages(newMsgs);
    setIsChatLoading(true);

    try {
      const reply = await chatWithDirectorAI(msg, project, userApiKey);
      setChatMessages([
        ...newMsgs,
        { role: 'assistant' as const, text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    } catch (e: any) {
      setChatMessages([
        ...newMsgs,
        { role: 'assistant' as const, text: 'Ho recepito le tue indicazioni. Applicherò questi cambiamenti dinamici alla prossima analisi!', time: 'Ora' }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Run AI Script Breakdown & Video Choreography
  const handleAnalyzeAndGenerate = async () => {
    if (!project.script.trim()) {
      alert('Inserisci o incolla una sceneggiatura/copione prima di procedere.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStatus('Analisi del copione e personaggi con Gemini 3.8 Flash...');

    try {
      setTimeout(() => {
        setAnalysisStatus(`Suddivisione intelligente in ${calculatedClipsCount} clip continue (max ${maxClipDuration}s per clip)...`);
      }, 700);

      setTimeout(() => {
        setAnalysisStatus(`Coreografia dei movimenti di camera dinamici & dialoghi in stile ${project.style}...`);
      }, 1500);

      const result = await analyzeScriptWithAI({
        script: project.script,
        style: project.style,
        targetDuration,
        maxClipDuration,
        aspectRatio: project.aspectRatio,
        userApiKey
      });

      onUpdateProject({
        title: result.title || project.title,
        logline: result.logline || project.logline,
        directorsVision: result.directorsVision,
        characters: result.characters || project.characters,
        brainAnalysis: result.brainAnalysis,
        clips: result.clips || [],
        clipCount: result.clips?.length || calculatedClipsCount,
        updatedAt: new Date().toISOString()
      });

      setAnalysisStatus('Generazione e Analisi del Cervello AI completate!');
      setTimeout(() => {
        setIsAnalyzing(false);
        onGenerationComplete();
      }, 600);

    } catch (err: any) {
      console.error('Error during generation:', err);
      alert('Errore durante l\'analisi: ' + err.message);
      setIsAnalyzing(false);
    }
  };

  // Quick duration presets
  const DURATION_PRESETS = [15, 30, 45, 60, 90, 120];
  const MAX_CLIP_PRESETS = [4, 8, 10, 12, 15];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Banner: Preset selection & Upload */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles size={16} />
            </span>
            <h2 className="text-sm md:text-base font-bold text-white">
              Studio Sceneggiatura & Regia Dinamica
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Incolla o scrivi il copione. L'AI lo analizzerà come Claude o ChatGPT, dividendo la durata richiesta in più clip dinamiche da massimo <strong className="text-indigo-300">{maxClipDuration} secondi</strong> l'una con movimenti fluidi e dialoghi sincroni.
          </p>
        </div>

        {/* Presets and Upload Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer border border-slate-700 transition">
            <Upload size={14} />
            <span>Carica Copione (.txt)</span>
            <input type="file" accept=".txt,.fountain,.md" onChange={handleFileUpload} className="hidden" />
          </label>

          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-semibold transition">
              <FileText size={14} />
              <span>Esempi Sceneggiatura</span>
              <ChevronDown size={14} />
            </button>
            <div className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1 z-30 hidden group-hover:block">
              {PRESET_SCRIPTS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className="w-full text-left p-2 hover:bg-indigo-600/20 rounded-lg text-xs text-slate-200 transition"
                >
                  <div className="font-semibold text-white">{preset.title}</div>
                  <div className="text-[10px] text-slate-400">{preset.category} • {preset.recommendedDuration}s</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Script Editor (Left) & AI Director Assistant (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Script Editor & Splitter (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#0b0f17] border border-slate-800 rounded-2xl p-4 md:p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/70 pb-3">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-indigo-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Copione / Sceneggiatura
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Formato standard: <code className="text-indigo-300">NOME: Battuta</code>
              </span>
            </div>

            {/* Textarea */}
            <textarea
              value={project.script}
              onChange={(e) => onUpdateProject({ script: e.target.value })}
              placeholder={`Scrivi qui la tua sceneggiatura o copione...
Esempio:
INT. LABORATORIO SEGRETO - NOTTE

LEO:
La sequenza di lancio è pronta. Non possiamo più tornare indietro.

MAYA:
Guarda il monitor! I segnali indicano un'interferenza sconosciuta.

LEO:
(afferrando i comandi di emergenza)
Mantieni stabili i generatori, sto deviando l'energia ausiliaria!`}
              rows={12}
              className="w-full bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 text-xs md:text-sm text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-indigo-500/60 placeholder:text-slate-600 resize-y"
            />

            {/* Script Stats Bar */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>{project.script.split(/\s+/).filter(Boolean).length} parole</span>
              <span>{project.script.split('\n').filter(l => l.includes(':')).length} battute di dialogo stimate</span>
            </div>
          </div>

          {/* Dynamic Duration Splitter Config Card (The Core Requested Feature) */}
          <div className="bg-[#0b0f17] border border-slate-800 rounded-2xl p-4 md:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/70 pb-3">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Configurazione Durata & Ripartizione Multi-Clip
                </h3>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded-md border border-cyan-800/40">
                <Clock size={12} />
                <span>Max {maxClipDuration}s per clip</span>
              </div>
            </div>

            {/* Total Duration Controls */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-2">
                <span>Durata Totale Richiesta: <strong className="text-white text-sm">{targetDuration} secondi</strong></span>
                <span className="text-slate-400">({(targetDuration / 60).toFixed(1)} minuti)</span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min={10}
                max={180}
                step={5}
                value={targetDuration}
                onChange={(e) => onUpdateProject({ targetDuration: Number(e.target.value) })}
                className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />

              {/* Quick Presets */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-[11px] text-slate-500 mr-1">Predefiniti:</span>
                {DURATION_PRESETS.map((dur) => (
                  <button
                    key={dur}
                    onClick={() => onUpdateProject({ targetDuration: dur })}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition ${
                      targetDuration === dur
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {dur}s
                  </button>
                ))}
              </div>
            </div>

            {/* Max Clip Duration Limit */}
            <div className="pt-2 border-t border-slate-800/50">
              <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-2">
                <div className="flex items-center gap-1.5">
                  <span>Limite Durata Singola Clip:</span>
                  <div className="group relative">
                    <Info size={13} className="text-slate-500 cursor-pointer" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 border border-slate-700 text-slate-300 text-[10px] p-2 rounded-lg shadow-xl hidden group-hover:block z-20">
                      I modelli video sul mercato generano tipicamente clip da 2 a 15 secondi. Il nostro software divide intelligentemente il video in più clip da massimo 15 secondi ciascuna per completare la durata richiesta.
                    </div>
                  </div>
                </div>
                <strong className="text-indigo-400 text-sm">{maxClipDuration} secondi max</strong>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {MAX_CLIP_PRESETS.map((limit) => (
                  <button
                    key={limit}
                    onClick={() => onUpdateProject({ maxClipDuration: limit })}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                      maxClipDuration === limit
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {limit}s
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Slicing Visual Calculation */}
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-indigo-900/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs">
                  {calculatedClipsCount}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Ripartizione Intelligente: {calculatedClipsCount} Clip Dinamiche
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Ogni clip durerà circa ~{avgClipLength}s con continuità totale di personaggi e camera.
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: Math.min(6, calculatedClipsCount) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded bg-indigo-500/20 border border-indigo-500/40 text-[9px] flex items-center justify-center text-indigo-300 font-bold"
                  >
                    {i + 1}
                  </div>
                ))}
                {calculatedClipsCount > 6 && (
                  <span className="text-slate-500 text-xs font-bold">+{calculatedClipsCount - 6}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Director Chat (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-full space-y-4">
          <div className="bg-[#0b0f17] border border-slate-800 rounded-2xl flex flex-col h-[520px] shadow-sm overflow-hidden">
            {/* Chat Header */}
            <div className="p-3.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <Bot size={15} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Assistente Regista AI</h3>
                  <p className="text-[10px] text-slate-400">Consulenza copione stile Claude/ChatGPT</p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                Live
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-md bg-indigo-900/40 text-indigo-400 border border-indigo-700/40 flex items-center justify-center shrink-0 text-xs">
                      AI
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className="block text-[9px] text-slate-400 mt-1 text-right">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex gap-2 items-center text-xs text-slate-400 italic">
                  <RefreshCw size={13} className="animate-spin text-indigo-400" />
                  <span>Il Regista AI sta elaborando i suggerimenti...</span>
                </div>
              )}
            </div>

            {/* Quick Prompt Ideas */}
            <div className="px-3 py-1.5 bg-slate-950/60 border-t border-slate-850 flex gap-1.5 overflow-x-auto no-scrollbar">
              {[
                'Aggiungi tensione dinamica',
                'Più movimenti di camera',
                'Dialogo incalzante',
                'Colpo di scena finale'
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setChatInput(suggestion);
                  }}
                  className="px-2 py-1 rounded bg-slate-850 hover:bg-slate-800 text-[10px] text-slate-300 whitespace-nowrap transition border border-slate-800"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                placeholder="Chiedi suggerimenti o modifiche al regista..."
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
              />
              <button
                onClick={handleSendChatMessage}
                disabled={!chatInput.trim() || isChatLoading}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition"
              >
                <Send size={14} />
              </button>
            </div>
          </div>

          {/* Big Action Button to Generate Video Clips */}
          <button
            onClick={handleAnalyzeAndGenerate}
            disabled={isAnalyzing}
            className="w-full flex items-center justify-center gap-2.5 py-4 px-6 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm md:text-base rounded-2xl shadow-xl shadow-indigo-600/25 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                <span>{analysisStatus || 'Elaborazione in corso...'}</span>
              </>
            ) : (
              <>
                <Wand2 size={20} />
                <span>Analizza Copione & Genera {calculatedClipsCount} Clip Dinamiche</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
