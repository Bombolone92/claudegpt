import { AppSettings, Project, VisualStyle } from '../types';
import { PRESET_SCRIPTS } from '../data/presetScripts';

const STORAGE_PROJECTS_KEY = 'cineveo_projects_v3';
const STORAGE_SETTINGS_KEY = 'cineveo_settings_v3';

export const DEFAULT_SETTINGS: AppSettings = {
  userApiKey: '',
  preferredEngine: 'gemini-veo',
  defaultMaxClipDuration: 15,
  exportResolution: '1080p',
  exportFps: 60,
  enableSubtitles: true,
  enableSoundFx: true,
  enableTtsVoice: true,
  enableMangaOnomatopoeia: true,
  voiceLanguage: 'it-IT',
  aiReasoningDepth: 'deep_director'
};

// Generate initial demo projects
export function createInitialDemoProjects(): Project[] {
  const mangaPreset = PRESET_SCRIPTS[0]; // Ryuga & Kento Manga Shōnen
  const mangaBwPreset = PRESET_SCRIPTS[1]; // Samurai B&W Inchiostrato
  const pixarPreset = PRESET_SCRIPTS[3]; // Gusto & Pip Pixar

  return [
    {
      id: 'demo-manga-shonen-1',
      title: mangaPreset.title,
      logline: mangaPreset.description,
      directorsVision: 'Azione Manga Shōnen ad altissima tensione: aura di fiamme ardenti, linee cinetiche, colpi impattanti e onomatopee sonore kanji.',
      script: mangaPreset.script,
      style: 'Manga Shōnen Action',
      aspectRatio: '16:9',
      targetDuration: 30,
      maxClipDuration: 15,
      clipCount: 2,
      characters: [
        { name: 'Ryuga', role: 'Guerriero della Fiamma', visualAppearance: 'Capelli a punta scuri, fascia frontale, occhi fiammeggianti e aura cremisi', voiceTone: 'Determinato e potente', archetype: 'Eroe Shōnen', voicePitch: 1.1 },
        { name: 'Kento', role: 'Guerriero del Ghiaccio', visualAppearance: 'Sguardo glaciale, capelli argentei e lancia runica', voiceTone: 'Calmo ed elegante', archetype: 'Rivale Prodigio', voicePitch: 0.9 }
      ],
      brainAnalysis: {
        pacingRhythm: 'Adrenalinico in Crescendo',
        cinematicContinuityScore: 99,
        emotionalTensionCurve: [60, 95],
        suggestedBgmGenre: 'Epic Orchestral Rock Shōnen',
        actingDirectives: 'Scatti fulminei, postura a baricentro basso e urli di concentrazione spirituale con aura fiammeggiante.',
        cameraChoreographySummary: 'Transizione fluida da tracking ravvicinato a rotazione 360° durante l\'impatto cinematico.'
      },
      clips: [
        {
          sequenceNumber: 1,
          title: 'Scena 1: La Carica del Drago',
          durationSeconds: 15,
          visualAction: 'Ryuga sprigiona una colonna di fuoco attorno ai pugni mentre Kento atterra con agilità sul terreno di roccia. La camera esegue un dolly in continuo a 60fps.',
          cameraMovement: 'Dolly In fluido con parallax',
          cameraAngle: 'Low-Angle Hero Shot',
          transitionIn: 'Smash-Cut',
          tensionLevel: 7,
          dialogues: [
            { speaker: 'Ryuga', text: 'Non m\'importa quanto sia spesso il tuo ghiaccio, Kento! Questa è tutta la mia volontà!', emotion: 'Urlo di battaglia' }
          ],
          soundDesign: 'Boato di fiamme crepitanti, vento furioso e rintocco metallico.',
          veoPrompt: 'Manga Shōnen Action anime style. Young spiky-haired warrior with glowing crimson fire aura clenching fists, speed lines radiating, dynamic low-angle dolly in, 60fps.',
          status: 'ready'
        },
        {
          sequenceNumber: 2,
          title: 'Scena 2: Collisione delle Energie',
          durationSeconds: 15,
          visualAction: 'I due guerrieri scattano all\'unisono. Le onde energetiche collidono al centro provocando un\'esplosione circolare di luce con onomatopee sonore a schermo.',
          cameraMovement: 'Orbit 360° a mezzobusto',
          cameraAngle: 'Dynamic Wide Tracking Shot',
          transitionIn: 'Ink-Splash',
          tensionLevel: 10,
          dialogues: [
            { speaker: 'Kento', text: 'Parli troppo, Ryuga. Dimostramelo con i fatti!', emotion: 'Sfida glaciale' }
          ],
          soundDesign: 'Esplosione acustica di impatto, scintille elettriche e colonna sonora rock in climax.',
          veoPrompt: 'Manga Shōnen Action anime climax. Fiery warrior and ice warrior colliding at hypersonic speed, circular shockwave impact, dramatic speed lines, 60fps.',
          status: 'ready'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['Manga', 'Shonen', 'Azione', 'Combattimento']
    },
    {
      id: 'demo-manga-bw-2',
      title: mangaBwPreset.title,
      logline: mangaBwPreset.description,
      directorsVision: 'Tavola manga classica giapponese in bianco e nero inchiostrato: retini (screentones), tratteggio a pennino g-pen, kanji onomatopeici ドドド e contrasto puro.',
      script: mangaBwPreset.script,
      style: 'Manga B&W Inchiostrato',
      aspectRatio: '16:9',
      targetDuration: 30,
      maxClipDuration: 15,
      clipCount: 2,
      characters: [
        { name: 'Jinbei', role: 'Ronin Solitario', visualAppearance: 'Cappello di paglia, kimono scuro, sguardo fermo e katana affilata', voiceTone: 'Profondo e glaciale', archetype: 'Maestro di Spada', voicePitch: 0.85 },
        { name: 'Assassino', role: 'Nemico nell\'Ombra', visualAppearance: 'Maschera demoniaca hannya e armi da lancio', voiceTone: 'Sibilante', archetype: 'Antagonista Rapido', voicePitch: 1.15 }
      ],
      brainAnalysis: {
        pacingRhythm: 'Tensione Sospesa e Fendente Improvviso',
        cinematicContinuityScore: 98,
        emotionalTensionCurve: [70, 98],
        suggestedBgmGenre: 'Traditional Japanese Taiko & Shamisen Noir',
        actingDirectives: 'Immobilità carica di tensione seguita da uno scatto istantaneo a velocità fulminea.',
        cameraChoreographySummary: 'Camera fissa laterale che si trasforma in whip-pan diagonale col fendente.'
      },
      clips: [
        {
          sequenceNumber: 1,
          title: 'Scena 1: L\'Acciaio nel Crepuscolo',
          durationSeconds: 15,
          visualAction: 'Jinbei avanza tra le canne di bambù. Retini manga mezzatinta e kanji d\'attesa (ゴゴゴ) animati. Il pollice solleva la guardia della katana.',
          cameraMovement: 'Tracking shot laterale in corsa',
          cameraAngle: 'Medium Close-Up (MCU)',
          transitionIn: 'Ink-Splash',
          tensionLevel: 8,
          dialogues: [
            { speaker: 'Jinbei', text: 'Chi cerca la mia spada... trova solo l\'inchiostro del proprio destino.', emotion: 'Solenne' }
          ],
          soundDesign: 'Fruscio di bambù al vento, ronzio di lama e tamburo taiko profondo.',
          veoPrompt: 'Manga B&W Inchiostrato. Monochrome Japanese samurai comic page, G-pen ink crosshatching, halftone screentone dots, ronin drawing katana in bamboo forest, 60fps.',
          status: 'ready'
        },
        {
          sequenceNumber: 2,
          title: 'Scena 2: Il Fendente d\'Inchiostro',
          durationSeconds: 15,
          visualAction: 'L\'assassino balza dall\'alto. Un lampo bianco diagonale squarcia la schermata inchiostrata separando i due contendenti.',
          cameraMovement: 'Whip-pan dinamico su soggetto',
          cameraAngle: 'Dutch Angle angolato',
          transitionIn: 'Smash-Cut',
          tensionLevel: 10,
          dialogues: [
            { speaker: 'Assassino', text: 'La tua testa vale cento monete d\'oro nella capitale!', emotion: 'Aggressivo' }
          ],
          soundDesign: 'Fischio d\'acciaio acuto, fendente d\'aria secco e tonfo di bambù spezzato.',
          veoPrompt: 'Manga B&W Inchiostrato action cut. Extreme speed lines, black ink flash slice, diagonal dutch angle framing, dramatic Japanese sound effect onomatopoeia, 60fps.',
          status: 'ready'
        }
      ],
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      updatedAt: new Date(Date.now() - 1800000).toISOString(),
      tags: ['Manga', 'Bianco e Nero', 'Samurai', 'Inchiostro']
    },
    {
      id: 'demo-pixar-3',
      title: pixarPreset.title,
      logline: pixarPreset.description,
      directorsVision: 'Animazione 3D dinamica con illuminazione volumetrica calda, movimenti elastici e interazione vivace tra Gusto e Pip.',
      script: pixarPreset.script,
      style: '3D Pixar Cartoon',
      aspectRatio: '16:9',
      targetDuration: 30,
      maxClipDuration: 15,
      clipCount: 2,
      characters: [
        { name: 'Gusto', role: 'Robot Pasticcere', visualAppearance: 'Robot bombato crema con occhi blu luminosi', voiceTone: 'Entusiasta e ritmato', archetype: 'Creatore Ingenuo', voicePitch: 1.0 },
        { name: 'Pip', role: 'Topolino Chef', visualAppearance: 'Topolino grigio con cappello da chef oversize', voiceTone: 'Rapido e vivace', archetype: 'Aiutante Iperattivo', voicePitch: 1.25 }
      ],
      clips: [
        {
          sequenceNumber: 1,
          title: 'Scena 1: L\'Ingrediente Fluttuante',
          durationSeconds: 15,
          visualAction: 'Gusto agita la spatola dorata mentre Pip salta eccitato sul banco da lavoro.',
          cameraMovement: 'Dolly In fluido con parallax',
          cameraAngle: 'Medium Shot dinamico',
          transitionIn: 'Cross-Dissolve',
          dialogues: [
            { speaker: 'Pip', text: 'Gusto! La polvere di vaniglia cosmica si sta sciogliendo! Sbrigati prima che evapori!', emotion: 'Impaziente' },
            { speaker: 'Gusto', text: 'Temperatura calcolata al milligrammo, Pip! Tre, due, uno... soffio dorato!', emotion: 'Entusiasta' }
          ],
          soundDesign: 'Trilli metallici simpatici, rintocco di rame e colonna sonora gioiosa Pixar.',
          veoPrompt: '3D Pixar Cartoon dynamic animation. Chubby friendly baker robot with glowing blue eyes and tiny mouse chef jumping on worktop. 60fps.',
          status: 'ready'
        },
        {
          sequenceNumber: 2,
          title: 'Scena 2: Lievitazione e Climax',
          durationSeconds: 15,
          visualAction: 'La torta lievita fluttuando e illuminando l\'ambiente. Gusto e Pip inseguono il dolce con salti coordinati.',
          cameraMovement: 'Crane Up panoramico con reveal',
          cameraAngle: 'Low-Angle Hero Shot',
          transitionIn: 'Whip-Pan',
          dialogues: [
            { speaker: 'Pip', text: 'È viva! Gusto, sta volando verso il soffitto! Prendila!', emotion: 'Meravigliato' },
            { speaker: 'Gusto', text: 'Calcolo traiettoria... Cattura al volo riuscita!', emotion: 'Trionfale' }
          ],
          soundDesign: 'Arpa ascendente magica, effetto sonoro di lievitazione energetica e risata corale.',
          veoPrompt: '3D Pixar Cartoon style. Floating glowing pastry dessert rising to ceiling, robot and mouse leaping together in air, vibrant bounce lighting, 60fps.',
          status: 'ready'
        }
      ],
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      tags: ['Pixar', '3D', 'Animazione', 'Commedia']
    }
  ];
}

export function loadProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_PROJECTS_KEY);
    if (!raw) {
      const initial = createInitialDemoProjects();
      saveProjects(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : createInitialDemoProjects();
  } catch (e) {
    console.error('Error loading projects:', e);
    return createInitialDemoProjects();
  }
}

export function saveProjects(projects: Project[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Error saving projects:', e);
  }
}

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}
