export type VisualStyle = 
  | '3D Pixar Cartoon' 
  | '2D Anime'
  | 'Manga Shōnen Action'
  | 'Manga B&W Inchiostrato'
  | 'Cyberpunk Neo-Tokyo Anime'
  | 'Black & White Vintage 50s/70s' 
  | 'Film Cinema Hollywood';

export type AspectRatio = '16:9' | '9:16' | '1:1' | '21:9';

export type ExportResolution = '1080p' | '4K' | '720p';

export type TransitionType = 'Whip-Pan' | 'Cross-Dissolve' | 'Match-Cut' | 'Ink-Splash' | 'Smash-Cut';

export interface DialogueLine {
  speaker: string;
  text: string;
  emotion?: string;
  timestampStart?: number;
  timestampEnd?: number;
  lipSyncPhonemes?: string;
}

export interface CharacterProfile {
  name: string;
  role?: string;
  visualAppearance: string;
  voiceTone?: string;
  colorTheme?: string;
  archetype?: string;
  voicePitch?: number; // 0.7 to 1.4
}

export interface VideoClip {
  sequenceNumber: number;
  title: string;
  durationSeconds: number;
  visualAction: string;
  cameraMovement: string;
  cameraAngle?: string;
  transitionIn?: TransitionType;
  dialogues: DialogueLine[];
  soundDesign?: string;
  veoPrompt: string;
  continuityNote?: string;
  tensionLevel?: number; // 1 to 10
  status?: 'pending' | 'ready' | 'generating';
}

export interface BrainAnalysis {
  pacingRhythm: string;
  cinematicContinuityScore: number; // e.g. 98
  emotionalTensionCurve: number[]; // 0-100 per clip
  suggestedBgmGenre: string;
  actingDirectives: string;
  cameraChoreographySummary: string;
}

export interface Project {
  id: string;
  title: string;
  logline?: string;
  directorsVision?: string;
  script: string;
  style: VisualStyle;
  aspectRatio: AspectRatio;
  targetDuration: number; // e.g. 30, 45, 60, 90, 120s
  maxClipDuration: number; // default 15s
  clipCount: number;
  characters: CharacterProfile[];
  clips: VideoClip[];
  brainAnalysis?: BrainAnalysis;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface DirectorChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface AppSettings {
  userApiKey: string;
  preferredEngine: 'gemini-veo' | 'omni-director' | 'free-cinematic';
  defaultMaxClipDuration: number; // 15
  exportResolution: ExportResolution;
  exportFps: 30 | 60;
  enableSubtitles: boolean;
  enableSoundFx: boolean;
  enableTtsVoice: boolean;
  enableMangaOnomatopoeia: boolean;
  voiceLanguage: string;
  aiReasoningDepth: 'fast' | 'deep_director';
}
