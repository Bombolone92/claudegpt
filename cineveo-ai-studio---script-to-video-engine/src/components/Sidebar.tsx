import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Film, 
  Video, 
  Trash2, 
  Copy, 
  Clock, 
  Settings, 
  Layers, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Tv,
  Camera,
  Clapperboard
} from 'lucide-react';
import { Project, VisualStyle } from '../types';

interface SidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onDeleteProject: (id: string) => void;
  onDuplicateProject: (id: string) => void;
  onOpenSettings: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

const STYLE_FILTERS: Array<{ id: string; label: string; icon: any }> = [
  { id: 'all', label: 'Tutti', icon: Film },
  { id: 'Manga Shōnen Action', label: 'Manga Shōnen', icon: Clapperboard },
  { id: 'Manga B&W Inchiostrato', label: 'Manga B&W', icon: Tv },
  { id: '2D Anime', label: '2D Anime', icon: Sparkles },
  { id: 'Cyberpunk Neo-Tokyo Anime', label: 'Cyberpunk', icon: Camera },
  { id: '3D Pixar Cartoon', label: '3D Pixar', icon: Sparkles },
  { id: 'Film Cinema Hollywood', label: 'Hollywood', icon: Film },
  { id: 'Black & White Vintage 50s/70s', label: 'B&W 50s', icon: Tv },
];

export const Sidebar: React.FC<SidebarProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onNewProject,
  onDeleteProject,
  onDuplicateProject,
  onOpenSettings,
  isOpen,
  onToggleOpen,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyleFilter, setSelectedStyleFilter] = useState('all');

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.script.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesStyle = selectedStyleFilter === 'all' || p.style === selectedStyleFilter;

    return matchesSearch && matchesStyle;
  });

  const getStyleBadgeColor = (style: VisualStyle) => {
    switch (style) {
      case 'Manga Shōnen Action':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Manga B&W Inchiostrato':
        return 'bg-zinc-800 text-zinc-100 border-zinc-600/40';
      case 'Cyberpunk Neo-Tokyo Anime':
        return 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20';
      case '3D Pixar Cartoon':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case '2D Anime':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'Black & White Vintage 50s/70s':
        return 'bg-zinc-700/30 text-zinc-300 border-zinc-600/30';
      case 'Film Cinema Hollywood':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    }
  };

  if (!isOpen) {
    return (
      <aside className="w-14 bg-[#080c14] border-r border-slate-800 flex flex-col items-center py-4 justify-between shrink-0 select-none transition-all">
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={onToggleOpen}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Espandi Menu"
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={onNewProject}
            className="p-2.5 bg-gradient-to-br from-indigo-500 to-cyan-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:scale-105 transition"
            title="Nuovo Progetto"
          >
            <Plus size={18} />
          </button>
        </div>
        <button
          onClick={onOpenSettings}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          title="Impostazioni & API Key"
        >
          <Settings size={18} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-72 md:w-80 bg-[#080c14] border-r border-slate-800/80 flex flex-col h-full shrink-0 select-none">
      {/* Brand & Toggle */}
      <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Video size={18} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-wide text-white">CineVeo</span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md">
                OMNI AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Script-to-Video Studio</p>
          </div>
        </div>

        <button
          onClick={onToggleOpen}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition"
          title="Riduci Barra Laterale"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* New Project Action Button */}
      <div className="p-3 border-b border-slate-800/40">
        <button
          onClick={onNewProject}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 hover:from-indigo-500 to-cyan-600 hover:to-cyan-500 text-white font-medium text-sm shadow-md shadow-indigo-600/20 transition-all transform active:scale-98"
        >
          <Plus size={18} />
          <span>Nuovo Progetto</span>
        </button>
      </div>

      {/* Quick Search Bar */}
      <div className="p-3 pb-2">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca progetti salvati..."
            className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500/50 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Style Filter Chips */}
      <div className="px-3 pb-2 flex gap-1 overflow-x-auto no-scrollbar">
        {STYLE_FILTERS.map((f) => {
          const isSelected = selectedStyleFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setSelectedStyleFilter(f.id)}
              className={`px-2 py-1 rounded-md text-[11px] whitespace-nowrap transition flex items-center gap-1 ${
                isSelected
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-900/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <f.icon size={11} />
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5">
        <div className="px-2 pb-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex justify-between items-center">
          <span>Cronologia Progetti ({filteredProjects.length})</span>
          <Layers size={13} />
        </div>

        {filteredProjects.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            <Film size={28} className="mx-auto mb-2 opacity-30" />
            <p>Nessun progetto trovato</p>
            <button
              onClick={onNewProject}
              className="mt-3 text-indigo-400 hover:underline text-xs"
            >
              Crea uno nuovo ora
            </button>
          </div>
        ) : (
          filteredProjects.map((p) => {
            const isActive = p.id === activeProjectId;
            const clipNum = p.clips ? p.clips.length : p.clipCount || 1;
            const duration = p.targetDuration || 30;

            return (
              <div
                key={p.id}
                onClick={() => onSelectProject(p.id)}
                className={`group relative p-2.5 rounded-xl border cursor-pointer transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-950/60 to-slate-900 border-indigo-500/50 shadow-sm'
                    : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/50 hover:border-slate-700/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-semibold text-slate-200 truncate group-hover:text-white transition">
                    {p.title || 'Progetto Senza Titolo'}
                  </h4>

                  {/* Actions on hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateProject(p.id);
                      }}
                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded"
                      title="Duplica Progetto"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Eliminare il progetto "${p.title}"?`)) {
                          onDeleteProject(p.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 rounded"
                      title="Elimina Progetto"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Subtitle / Logline */}
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {p.logline || p.script.slice(0, 60)}
                </p>

                {/* Badges: Style + Duration + Clips */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className={`px-1.5 py-0.5 text-[10px] font-medium border rounded ${getStyleBadgeColor(p.style)}`}>
                    {p.style.replace(' Cartoon', '').replace(' Vintage 50s/70s', ' 50s')}
                  </span>
                  <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-slate-800/80 text-slate-300 rounded border border-slate-750">
                    <Clock size={10} />
                    {duration}s ({clipNum} clip)
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Bar / Settings */}
      <div className="p-3 border-t border-slate-800/60 bg-[#070a10]">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 rounded-lg border border-slate-800 transition"
        >
          <div className="flex items-center gap-2">
            <Settings size={15} className="text-indigo-400" />
            <span>Impostazioni & API Key</span>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
            Gratuito
          </span>
        </button>
      </div>
    </aside>
  );
};
