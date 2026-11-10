import React, { useState } from 'react';
import { 
  Clapperboard, 
  Sparkles, 
  Tv, 
  Camera, 
  Play, 
  Download, 
  Maximize2, 
  Film,
  SlidersHorizontal,
  Edit2,
  Check
} from 'lucide-react';
import { AspectRatio, Project, VisualStyle } from '../types';

interface ProjectHeaderProps {
  project: Project;
  onUpdateProject: (updated: Partial<Project>) => void;
  activeTab: 'script' | 'storyboard' | 'player';
  onChangeTab: (tab: 'script' | 'storyboard' | 'player') => void;
  onOpenExportModal: () => void;
}

const STYLES_LIST: Array<{ id: VisualStyle; label: string; icon: any; color: string }> = [
  { id: 'Manga Shōnen Action', label: '🔥 Manga Shōnen Action', icon: Clapperboard, color: 'text-rose-400' },
  { id: 'Manga B&W Inchiostrato', label: '✒️ Manga B&W Inchiostrato', icon: Tv, color: 'text-zinc-200' },
  { id: '2D Anime', label: '⚡ 2D Anime Ufotable', icon: Sparkles, color: 'text-indigo-400' },
  { id: 'Cyberpunk Neo-Tokyo Anime', label: '🌆 Cyberpunk Neo-Tokyo', icon: Camera, color: 'text-fuchsia-400' },
  { id: '3D Pixar Cartoon', label: '🎨 3D Pixar Cartoon', icon: Sparkles, color: 'text-amber-400' },
  { id: 'Film Cinema Hollywood', label: '🎥 Film Cinema Hollywood', icon: Camera, color: 'text-cyan-400' },
  { id: 'Black & White Vintage 50s/70s', label: '📼 B&W Vintage Anni 50/70', icon: Tv, color: 'text-zinc-300' },
];

const ASPECT_RATIOS: Array<{ id: AspectRatio; label: string; sub: string }> = [
  { id: '16:9', label: '16:9', sub: 'Cinema/YouTube' },
  { id: '9:16', label: '9:16', sub: 'TikTok/Reels' },
  { id: '1:1', label: '1:1', sub: 'Instagram' },
  { id: '21:9', label: '21:9', sub: 'Cinemascope' },
];

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  onUpdateProject,
  activeTab,
  onChangeTab,
  onOpenExportModal,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(project.title);

  const handleSaveTitle = () => {
    if (titleInput.trim()) {
      onUpdateProject({ title: titleInput.trim() });
    }
    setIsEditingTitle(false);
  };

  const clipCount = project.clips ? project.clips.length : project.clipCount || 1;

  return (
    <header className="bg-[#0b0f17] border-b border-slate-800/80 px-4 md:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
      {/* Left: Title & Quick Metadata */}
      <div className="flex items-center gap-3">
        {isEditingTitle ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
              autoFocus
              className="bg-slate-900 border border-indigo-500 rounded-lg px-2.5 py-1 text-sm font-bold text-white focus:outline-none"
            />
            <button
              onClick={handleSaveTitle}
              className="p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
            >
              <Check size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => {
            setTitleInput(project.title);
            setIsEditingTitle(true);
          }}>
            <h1 className="text-base md:text-lg font-bold text-white tracking-tight hover:text-indigo-300 transition">
              {project.title}
            </h1>
            <Edit2 size={13} className="text-slate-500 opacity-0 group-hover:opacity-100 transition" />
          </div>
        )}

        {/* Dynamic Multi-Clip Calculation Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
          <span className="font-semibold text-indigo-300">{project.targetDuration}s</span>
          <span className="text-slate-500">•</span>
          <span>{clipCount} clip ({project.maxClipDuration}s max)</span>
        </div>
      </div>

      {/* Middle: Studio Tabs */}
      <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800/80 self-center">
        <button
          onClick={() => onChangeTab('script')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'script'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <SlidersHorizontal size={14} />
          <span>Copione & Regia AI</span>
        </button>

        <button
          onClick={() => onChangeTab('storyboard')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'storyboard'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Film size={14} />
          <span>Storyboard ({clipCount})</span>
        </button>

        <button
          onClick={() => onChangeTab('player')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'player'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Play size={14} />
          <span>Cinema Player</span>
        </button>
      </div>

      {/* Right: Style Picker + Aspect Ratio + HD Export Trigger */}
      <div className="flex items-center gap-2">
        {/* Style selector */}
        <select
          value={project.style}
          onChange={(e) => onUpdateProject({ style: e.target.value as VisualStyle })}
          className="bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          {STYLES_LIST.map((s) => (
            <option key={s.id} value={s.id} className="bg-slate-900 text-white">
              {s.label}
            </option>
          ))}
        </select>

        {/* Aspect ratio */}
        <select
          value={project.aspectRatio}
          onChange={(e) => onUpdateProject({ aspectRatio: e.target.value as AspectRatio })}
          className="bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          {ASPECT_RATIOS.map((ar) => (
            <option key={ar.id} value={ar.id} className="bg-slate-900 text-white">
              {ar.id} ({ar.label})
            </option>
          ))}
        </select>

        {/* HD Export Button */}
        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-cyan-500/20 transition transform active:scale-98"
        >
          <Download size={14} />
          <span className="hidden sm:inline">Esporta HD</span>
        </button>
      </div>
    </header>
  );
};
