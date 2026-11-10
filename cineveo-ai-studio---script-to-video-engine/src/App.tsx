/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Project, AppSettings } from './types';
import { loadProjects, saveProjects, loadSettings, saveSettings } from './services/projectStorage';
import { Sidebar } from './components/Sidebar';
import { ProjectHeader } from './components/ProjectHeader';
import { ScriptEditorTab } from './components/ScriptEditorTab';
import { StoryboardTab } from './components/StoryboardTab';
import { CinemaPlayerTab } from './components/CinemaPlayerTab';
import { ExportModal } from './components/ExportModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [activeTab, setActiveTab] = useState<'script' | 'storyboard' | 'player'>('script');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedPlayClipIndex, setSelectedPlayClipIndex] = useState(0);

  // Load projects from storage on mount
  useEffect(() => {
    const loaded = loadProjects();
    setProjects(loaded);
    if (loaded.length > 0 && !activeProjectId) {
      setActiveProjectId(loaded[0].id);
    }
  }, []);

  // Save projects to storage whenever projects state updates
  useEffect(() => {
    if (projects.length > 0) {
      saveProjects(projects);
    }
  }, [projects]);

  // Current active project
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  // Create New Project (like "Nuova Conversazione" in Claude/ChatGPT)
  const handleNewProject = () => {
    const newId = `project-${Date.now()}`;
    const newProj: Project = {
      id: newId,
      title: 'Nuovo Progetto Video AI',
      script: `INT. SCENARIO CINEMATOGRAFICO - GIORNO

PERSONAGGIO 1:
Abbiamo un nuovo obiettivo da raggiungere. Non c'è tempo da perdere!

PERSONAGGIO 2:
(voltandosi rapidamente con sguardo concentrato)
I sistemi sono pronti. Muoviamoci prima che cambino le condizioni!`,
      style: '3D Pixar Cartoon',
      aspectRatio: '16:9',
      targetDuration: 30,
      maxClipDuration: settings.defaultMaxClipDuration || 15,
      clipCount: 2,
      characters: [
        { name: 'Alex', role: 'Protagonista', visualAppearance: 'Stile dinamico ed espressivo', voiceTone: 'Forte e deciso' },
        { name: 'Nova', role: 'Coprotagonista', visualAppearance: 'Tratti agili e reattivi', voiceTone: 'Pronto e intelligente' }
      ],
      clips: [
        {
          sequenceNumber: 1,
          title: 'Scena 1: Partenza Rapida',
          durationSeconds: 15,
          visualAction: 'I personaggi avanzano dinamicamente verso la camera interagendo con l\'ambiente circostante.',
          cameraMovement: 'Dolly In fluido con parallax',
          cameraAngle: 'Medium Shot dinamico',
          dialogues: [
            { speaker: 'Alex', text: 'Abbiamo un nuovo obiettivo da raggiungere. Non c\'è tempo da perdere!', emotion: 'Deciso' }
          ],
          soundDesign: 'Colonna sonora ritmata e passi coordinati.',
          veoPrompt: '3D Pixar Cartoon dynamic character walking towards camera, expressive face and fluid kinematics, warm volumetric lighting, 60fps.',
          status: 'ready'
        },
        {
          sequenceNumber: 2,
          title: 'Scena 2: Risposta e Azione',
          durationSeconds: 15,
          visualAction: 'Nova gesticola indicando la rotta mentre la telecamera compie una rotazione panoramica continua.',
          cameraMovement: 'Orbit 360° a mezzobusto',
          cameraAngle: 'Over-The-Shoulder dinamico',
          dialogues: [
            { speaker: 'Nova', text: 'I sistemi sono pronti. Muoviamoci prima che cambino le condizioni!', emotion: 'Allerta' }
          ],
          soundDesign: 'Swoosh cinematografico e crescendo orchestrale.',
          veoPrompt: '3D Pixar Cartoon scene. Camera orbit around animated character pointing forward, fluid gesture animation, vibrant bounce lighting, 60fps.',
          status: 'ready'
        }
      ],
      brainAnalysis: {
        pacingRhythm: 'Adrenalinico in Crescendo',
        cinematicContinuityScore: 98,
        emotionalTensionCurve: [55, 95],
        suggestedBgmGenre: 'Cinematic Dynamic Score',
        actingDirectives: 'Movimento continuo in avanti con contatto visivo vivo ed espressività intensa.',
        cameraChoreographySummary: 'Dolly in di apertura e successiva transizione orbitale continua a 60fps.'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['Nuovo', 'AI Video']
    };

    setProjects([newProj, ...projects]);
    setActiveProjectId(newId);
    setActiveTab('script');
  };

  // Update Project
  const handleUpdateActiveProject = (updatedFields: Partial<Project>) => {
    if (!activeProject) return;
    const updatedList = projects.map((p) => {
      if (p.id === activeProject.id) {
        return { ...p, ...updatedFields, updatedAt: new Date().toISOString() };
      }
      return p;
    });
    setProjects(updatedList);
  };

  // Delete Project
  const handleDeleteProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    if (activeProjectId === id) {
      setActiveProjectId(updated[0]?.id || null);
    }
  };

  // Duplicate Project
  const handleDuplicateProject = (id: string) => {
    const target = projects.find((p) => p.id === id);
    if (!target) return;
    const dup: Project = {
      ...target,
      id: `project-${Date.now()}`,
      title: `${target.title} (Copia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects([dup, ...projects]);
    setActiveProjectId(dup.id);
  };

  // Save Settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Play clip in cinema player
  const handlePlayClip = (clipIndex: number) => {
    setSelectedPlayClipIndex(clipIndex);
    setActiveTab('player');
  };

  const handlePlayFullSequence = () => {
    setSelectedPlayClipIndex(0);
    setActiveTab('player');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070b12] text-slate-100 font-sans selection:bg-indigo-600/30 selection:text-indigo-200">
      {/* ChatGPT / Claude style Sidebar */}
      <Sidebar
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={(id) => {
          setActiveProjectId(id);
        }}
        onNewProject={handleNewProject}
        onDeleteProject={handleDeleteProject}
        onDuplicateProject={handleDuplicateProject}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Studio Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-[#080d16]">
        {activeProject ? (
          <>
            {/* Top Project Navigation Header */}
            <ProjectHeader
              project={activeProject}
              onUpdateProject={handleUpdateActiveProject}
              activeTab={activeTab}
              onChangeTab={setActiveTab}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />

            {/* Active Workspace Tab */}
            {activeTab === 'script' && (
              <ScriptEditorTab
                project={activeProject}
                onUpdateProject={handleUpdateActiveProject}
                onGenerationComplete={() => setActiveTab('storyboard')}
                userApiKey={settings.userApiKey}
              />
            )}

            {activeTab === 'storyboard' && (
              <StoryboardTab
                project={activeProject}
                onUpdateProject={handleUpdateActiveProject}
                onPlayClip={handlePlayClip}
                onPlayFullSequence={handlePlayFullSequence}
              />
            )}

            {activeTab === 'player' && (
              <CinemaPlayerTab
                project={activeProject}
                onUpdateProject={handleUpdateActiveProject}
                initialClipIndex={selectedPlayClipIndex}
                onOpenExportModal={() => setIsExportModalOpen(true)}
              />
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-lg font-bold text-white mb-2">Nessun progetto selezionato</h2>
            <p className="text-xs text-slate-400 mb-4">Crea un nuovo progetto video per iniziare a scrivere la tua sceneggiatura.</p>
            <button
              onClick={handleNewProject}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition"
            >
              + Nuovo Progetto
            </button>
          </div>
        )}
      </main>

      {/* High Definition Export Modal */}
      {activeProject && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          project={activeProject}
        />
      )}

      {/* Settings & API Key Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />
    </div>
  );
}
