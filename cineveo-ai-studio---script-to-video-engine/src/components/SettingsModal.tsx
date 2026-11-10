import React, { useState } from 'react';
import { 
  X, 
  Key, 
  ShieldCheck, 
  Save, 
  ExternalLink, 
  Sliders, 
  Check, 
  Cpu, 
  Sparkles, 
  Github,
  Volume2,
  Tv
} from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(settings.userApiKey || '');
  const [maxClipDur, setMaxClipDur] = useState(settings.defaultMaxClipDuration || 15);
  const [selectedEngine, setSelectedEngine] = useState(settings.preferredEngine || 'gemini-veo');
  const [enableTts, setEnableTts] = useState(settings.enableTtsVoice ?? true);
  const [enableSoundFx, setEnableSoundFx] = useState(settings.enableSoundFx ?? true);
  const [enableSubs, setEnableSubs] = useState(settings.enableSubtitles ?? true);
  const [enableMangaOnomatopoeia, setEnableMangaOnomatopoeia] = useState(settings.enableMangaOnomatopoeia ?? true);
  const [aiReasoningDepth, setAiReasoningDepth] = useState<'fast' | 'deep_director'>(settings.aiReasoningDepth || 'deep_director');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      userApiKey: apiKeyInput.trim(),
      defaultMaxClipDuration: Number(maxClipDur),
      preferredEngine: selectedEngine,
      enableTtsVoice: enableTts,
      enableSoundFx: enableSoundFx,
      enableSubtitles: enableSubs,
      enableMangaOnomatopoeia,
      aiReasoningDepth,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0b0f17] border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Key size={18} />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-bold text-white">Impostazioni & Chiavi API</h3>
              <p className="text-xs text-slate-400">100% Gratuito • Nessun abbonamento • Gestione motori AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Zero Billing Banner */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-950/40 to-slate-950 border border-emerald-500/30 rounded-xl flex items-center gap-3">
            <ShieldCheck size={24} className="text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-emerald-300 text-xs">Accesso Gratuito Illimitato</div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Il software non prevede alcun costo di licenza o fatturazione periodica. Puoi utilizzare la tua chiave API Google AI Studio o i modelli open-source gratuiti.
              </p>
            </div>
          </div>

          {/* User Custom API Key Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-200 block">
                Tua Chiave API (Google Gemini / Veo):
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>Ottieni chiave gratuita</span>
                <ExternalLink size={11} />
              </a>
            </div>

            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Incolla qui la tua API Key (es. AIzaSy...)"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs font-mono placeholder:text-slate-600 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500">
              La chiave viene salvata localmente nel tuo browser. Se lasci il campo vuoto, verrà utilizzato il motore di regia locale integrato o la variabile d'ambiente dell'applicazione.
            </p>
          </div>

          {/* Default Max Clip Duration */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-200 block">
                Durata Massima Predefinita per Singola Clip:
              </label>
              <span className="font-bold text-indigo-400">{maxClipDur} secondi</span>
            </div>
            <div className="flex items-center gap-2">
              {[4, 8, 10, 12, 15].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setMaxClipDur(dur)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition ${
                    maxClipDur === dur
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {dur}s
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              I modelli text-to-video generano clip tra 2s e 15s. Impostando 15s ottieni la massima efficienza con il minor numero di clip necessarie.
            </p>
          </div>

          {/* Video & AI Engine Selector */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="font-bold text-slate-200 block">
              Motore AI Selezionato:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'gemini-veo' as const, title: 'Google Veo & Gemini 3.8 Flash', desc: 'Direzione copione intelligente e prompt cinematici Veo' },
                { id: 'free-cinematic' as const, title: 'CineVeo Local Engine', desc: 'Slicing intelligente deterministico e 60fps canvas synthesis' }
              ].map((eng) => (
                <button
                  key={eng.id}
                  type="button"
                  onClick={() => setSelectedEngine(eng.id)}
                  className={`p-3 rounded-xl border text-left transition ${
                    selectedEngine === eng.id
                      ? 'bg-indigo-950/60 border-indigo-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-xs text-white">{eng.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{eng.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Audio & Dialogue Features */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <label className="font-bold text-slate-200 block">
              Audio, Dialoghi & Sottotitoli:
            </label>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 cursor-pointer">
                <span className="text-slate-300">Sintesi vocale TTS dialoghi personaggi</span>
                <input
                  type="checkbox"
                  checked={enableTts}
                  onChange={(e) => setEnableTts(e.target.checked)}
                  className="accent-indigo-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 cursor-pointer">
                <span className="text-slate-300">Paesaggi sonori procedurali Web Audio (ambience & swoosh)</span>
                <input
                  type="checkbox"
                  checked={enableSoundFx}
                  onChange={(e) => setEnableSoundFx(e.target.checked)}
                  className="accent-indigo-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 cursor-pointer">
                <span className="text-slate-300">Sottotitoli cinematici dinamici a schermo</span>
                <input
                  type="checkbox"
                  checked={enableSubs}
                  onChange={(e) => setEnableSubs(e.target.checked)}
                  className="accent-indigo-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 cursor-pointer">
                <span className="text-slate-300">Effetti visivi onomatopeici Manga (ドドド / ゴゴゴ)</span>
                <input
                  type="checkbox"
                  checked={enableMangaOnomatopoeia}
                  onChange={(e) => setEnableMangaOnomatopoeia(e.target.checked)}
                  className="accent-indigo-500 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>

            <div className="pt-2">
              <label className="font-bold text-slate-200 block mb-1.5">
                Cervello AI: Profondità di Ragionamento Regia:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAiReasoningDepth('deep_director')}
                  className={`p-2 rounded-xl border text-left transition ${
                    aiReasoningDepth === 'deep_director'
                      ? 'bg-indigo-950/70 border-indigo-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold text-xs">Cervello di Regia Pro</div>
                  <div className="text-[10px] text-slate-400">Analisi profonda di continuità, blocking e ritmo</div>
                </button>
                <button
                  type="button"
                  onClick={() => setAiReasoningDepth('fast')}
                  className={`p-2 rounded-xl border text-left transition ${
                    aiReasoningDepth === 'fast'
                      ? 'bg-indigo-950/70 border-indigo-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold text-xs">Regia Rapida</div>
                  <div className="text-[10px] text-slate-400">Ripartizione istantanea delle clip</div>
                </button>
              </div>
            </div>
          </div>

          {/* Open Source / Community references */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Github size={13} />
              <span className="font-semibold text-slate-300 text-[11px]">Risorse & Strumenti Gratuiti Integrati:</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Basato sui pattern di orchestrazione video text-to-video e prompt engineering multi-clip (Bombolone92/repo-reply, 5----2, 666, repo4, gp3, Skill-AI).
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#070a10] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            Annulla
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition transform active:scale-95"
          >
            {savedSuccess ? (
              <>
                <Check size={14} className="text-emerald-300" />
                <span>Salvato!</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Salva Impostazioni</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
