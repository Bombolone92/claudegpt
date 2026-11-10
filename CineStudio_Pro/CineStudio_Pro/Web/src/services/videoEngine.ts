import { Project, VideoClip, VisualStyle } from '../types';
import { audioEngine } from './audioEngine';

export interface RenderOptions {
  showSubtitles?: boolean;
  showWatermark?: boolean;
  exportMode?: boolean;
  showOnomatopoeia?: boolean;
}

export class VideoEngine {
  private particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number; color?: string }> = [];
  private onomatopoeiaPool: Array<{ kanji: string; romaji: string; x: number; y: number; scale: number; alpha: number; life: number }> = [];
  private screentonePattern: CanvasPattern | null = null;

  constructor() {
    // Atmospheric particles pool
    for (let i = 0; i < 90; i++) {
      this.particles.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.003,
        vy: 0.001 + Math.random() * 0.004,
        size: 1 + Math.random() * 3.5,
        alpha: 0.2 + Math.random() * 0.7
      });
    }

    // Japanese onomatopoeia dictionary for Manga styles
    const sfxList = [
      { kanji: 'ドドド', romaji: 'DODODO' }, // heavy rumbling / intense footsteps
      { kanji: 'ゴゴゴ', romaji: 'GOGOGO' }, // ominous menacing aura
      { kanji: 'ズバッ', romaji: 'ZUBAT' },  // sudden sharp blade slash
      { kanji: 'バキッ', romaji: 'BAKI' },   // impact strike
      { kanji: 'シュッ', romaji: 'SHUT' }    // high speed vanish
    ];

    for (let i = 0; i < 5; i++) {
      const sfx = sfxList[i];
      this.onomatopoeiaPool.push({
        kanji: sfx.kanji,
        romaji: sfx.romaji,
        x: 0.2 + Math.random() * 0.6,
        y: 0.25 + Math.random() * 0.45,
        scale: 0.8 + Math.random() * 0.4,
        alpha: 0.8,
        life: 0
      });
    }
  }

  // Pre-generate halftone screentone pattern for Manga B&W
  private getScreentonePattern(ctx: CanvasRenderingContext2D): CanvasPattern | null {
    if (this.screentonePattern) return this.screentonePattern;
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 6;
    pCanvas.height = 6;
    const pCtx = pCanvas.getContext('2d');
    if (!pCtx) return null;
    pCtx.fillStyle = '#ffffff';
    pCtx.fillRect(0, 0, 6, 6);
    pCtx.fillStyle = '#1c1917';
    pCtx.beginPath();
    pCtx.arc(3, 3, 1.2, 0, Math.PI * 2);
    pCtx.fill();
    this.screentonePattern = ctx.createPattern(pCanvas, 'repeat');
    return this.screentonePattern;
  }

  // Draw procedural dynamic frame on canvas
  public renderFrame(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    project: Project,
    clipIndex: number,
    clipTime: number,
    totalTime: number,
    options: RenderOptions = { showSubtitles: true, showWatermark: true, showOnomatopoeia: true }
  ) {
    const clips = project.clips;
    if (!clips || clips.length === 0) return;

    const safeClipIndex = Math.max(0, Math.min(clips.length - 1, clipIndex));
    const currentClip: VideoClip = clips[safeClipIndex];
    const clipDuration = currentClip.durationSeconds || 15;
    const progress = Math.max(0, Math.min(1, clipTime / clipDuration));

    const style = project.style;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Camera Transformations based on cameraMovement
    this.applyCameraTransform(ctx, width, height, currentClip.cameraMovement, progress, totalTime);

    // Environment Background
    this.renderEnvironment(ctx, width, height, style, progress, totalTime);

    // Characters in continuous motion & interaction
    this.renderDynamicCharacters(ctx, width, height, project, currentClip, clipTime, totalTime, progress);

    // Foreground Cinematic Atmospheric FX
    this.renderAtmosphereFx(ctx, width, height, style, totalTime, currentClip);

    // Manga Onomatopoeia SFX floating when dialogue/action occurs
    if (options.showOnomatopoeia !== false && (style.includes('Manga') || style.includes('Anime'))) {
      this.renderMangaOnomatopoeia(ctx, width, height, style, totalTime, currentClip, clipTime);
    }

    ctx.restore();

    // Clip Transition Strobe / Ink Splash if at clip boundary (first 0.4s)
    if (clipTime < 0.4 && safeClipIndex > 0) {
      this.renderClipTransitionEffect(ctx, width, height, currentClip.transitionIn || 'Whip-Pan', clipTime / 0.4, style);
    }

    // Overlays in screen space
    if (options.showSubtitles) {
      this.renderCinematicSubtitles(ctx, width, height, currentClip, clipTime, clipDuration);
    }

    if (options.showWatermark) {
      this.renderProductionHud(ctx, width, height, project, safeClipIndex, clipTime, totalTime);
    }
  }

  private applyCameraTransform(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    movement: string,
    progress: number,
    time: number
  ) {
    const cx = w / 2;
    const cy = h / 2;
    ctx.translate(cx, cy);

    const m = (movement || '').toLowerCase();

    if (m.includes('dolly') || m.includes('zoom')) {
      const scale = 1.0 + progress * 0.18;
      ctx.scale(scale, scale);
    } else if (m.includes('pan') || m.includes('tracking')) {
      const panOffset = (progress - 0.5) * (w * 0.14);
      ctx.translate(panOffset, 0);
    } else if (m.includes('orbit')) {
      const angle = (progress - 0.5) * 0.06;
      ctx.rotate(angle);
      const scale = 1.04 + Math.sin(progress * Math.PI) * 0.05;
      ctx.scale(scale, scale);
    } else if (m.includes('dutch') || m.includes('angolato')) {
      ctx.rotate(-0.05 + Math.sin(time * 2) * 0.02);
      ctx.scale(1.08, 1.08);
    } else if (m.includes('crane') || m.includes('tilt')) {
      const yOffset = (progress - 0.5) * (h * 0.12);
      ctx.translate(0, yOffset);
    } else {
      const shakeX = Math.sin(time * 2.2) * 2.5;
      const shakeY = Math.cos(time * 1.7) * 2;
      ctx.translate(shakeX, shakeY);
    }

    ctx.translate(-cx, -cy);
  }

  private renderEnvironment(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    style: VisualStyle,
    progress: number,
    time: number
  ) {
    if (style === 'Manga Shōnen Action') {
      // Shōnen high dynamic combat arena with speed bursts
      const skyGrad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w * 0.8);
      skyGrad.addColorStop(0, '#f59e0b');
      skyGrad.addColorStop(0.35, '#dc2626');
      skyGrad.addColorStop(0.75, '#450a0a');
      skyGrad.addColorStop(1, '#0f0505');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Radial Shōnen speed lines
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 3;
      const numLines = 32;
      for (let i = 0; i < numLines; i++) {
        const angle = (i * (Math.PI * 2) / numLines) + (time * 0.3) % 0.2;
        const r1 = w * 0.25;
        const r2 = w * 0.9;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
        ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
        ctx.stroke();
      }
      ctx.restore();

      // Rocky shattered ground
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, h * 0.72);
      ctx.lineTo(w * 0.3, h * 0.68);
      ctx.lineTo(w * 0.6, h * 0.75);
      ctx.lineTo(w, h * 0.7);
      ctx.lineTo(w, h);
      ctx.fill();

    } else if (style === 'Manga B&W Inchiostrato') {
      // Pure Japanese Manga Screentone Comic Page
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);

      // Halftone screentone texture
      const p = this.getScreentonePattern(ctx);
      if (p) {
        ctx.fillStyle = p;
        ctx.fillRect(0, 0, w, h);
      }

      // Manga Ink focus lines radiating
      ctx.save();
      ctx.translate(w / 2, h * 0.4);
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 40; i++) {
        if (i % 2 === 0) continue;
        const angle = (i * (Math.PI * 2) / 40);
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * (w * 0.28), Math.sin(angle) * (h * 0.28));
        ctx.lineTo(Math.cos(angle) * (w * 0.8), Math.sin(angle) * (h * 0.8));
        ctx.stroke();
      }
      ctx.restore();

      // Deep solid black ink silhouette floor with ink splatters
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, h * 0.73);
      ctx.lineTo(w * 0.35, h * 0.71);
      ctx.lineTo(w * 0.7, h * 0.76);
      ctx.lineTo(w, h * 0.72);
      ctx.lineTo(w, h);
      ctx.fill();

      // Manga comic page border frame
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 6;
      ctx.strokeRect(12, 12, w - 24, h - 24);

    } else if (style === 'Cyberpunk Neo-Tokyo Anime') {
      // Neon metropolis: rain, holographic magenta and cyan
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#020617');
      skyGrad.addColorStop(0.4, '#1e1b4b');
      skyGrad.addColorStop(0.7, '#4a044e');
      skyGrad.addColorStop(1, '#050505');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Distant holographic glowing signs
      for (let i = 0; i < 5; i++) {
        const signX = (w * 0.2 * i + 60) % w;
        const signY = h * 0.3 + (i % 3) * 30;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(236, 72, 153, 0.4)' : 'rgba(6, 182, 212, 0.4)';
        ctx.fillRect(signX, signY, 50, 80);
      }

      // Wet reflective asphalt floor with neon reflections
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, h * 0.72, w, h * 0.28);

      // Neon puddle streaks
      const puddleGrad = ctx.createLinearGradient(0, h * 0.75, w, h * 0.75);
      puddleGrad.addColorStop(0.2, 'rgba(6, 182, 212, 0.35)');
      puddleGrad.addColorStop(0.5, 'rgba(236, 72, 153, 0.4)');
      puddleGrad.addColorStop(0.8, 'rgba(168, 85, 247, 0.3)');
      ctx.fillStyle = puddleGrad;
      ctx.fillRect(0, h * 0.76, w, 14);

    } else if (style === '3D Pixar Cartoon') {
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#38bdf8');
      skyGrad.addColorStop(0.45, '#818cf8');
      skyGrad.addColorStop(0.75, '#fb923c');
      skyGrad.addColorStop(1, '#f43f5e');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (let i = 0; i < 4; i++) {
        const cloudX = ((w * 0.3 * i + time * 15) % (w + 200)) - 100;
        const cloudY = h * 0.15 + (i % 2) * 45;
        this.drawFluffyCloud(ctx, cloudX, cloudY, 80 + i * 20);
      }

      const floorGrad = ctx.createLinearGradient(0, h * 0.65, 0, h);
      floorGrad.addColorStop(0, '#34d399');
      floorGrad.addColorStop(1, '#059669');
      ctx.fillStyle = floorGrad;
      ctx.beginPath();
      ctx.moveTo(-50, h);
      ctx.quadraticCurveTo(w * 0.5, h * 0.62, w + 50, h);
      ctx.fill();

    } else if (style === '2D Anime') {
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(0.4, '#312e81');
      skyGrad.addColorStop(0.7, '#701a75');
      skyGrad.addColorStop(1, '#f43f5e');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 18; i++) {
        const lineOffset = (time * 800 + i * (w / 18)) % w;
        ctx.beginPath();
        ctx.moveTo(lineOffset, 0);
        ctx.lineTo(lineOffset - 140, h);
        ctx.stroke();
      }

      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, h * 0.68);
      ctx.lineTo(w * 0.25, h * 0.65);
      ctx.lineTo(w * 0.45, h * 0.72);
      ctx.lineTo(w * 0.75, h * 0.63);
      ctx.lineTo(w, h * 0.7);
      ctx.lineTo(w, h);
      ctx.fill();

    } else if (style === 'Black & White Vintage 50s/70s') {
      const bkgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bkgGrad.addColorStop(0, '#0a0a0a');
      bkgGrad.addColorStop(0.5, '#1e1e1e');
      bkgGrad.addColorStop(0.75, '#2b2b2b');
      bkgGrad.addColorStop(1, '#111111');
      ctx.fillStyle = bkgGrad;
      ctx.fillRect(0, 0, w, h);

      const coneGrad = ctx.createRadialGradient(w * 0.78, h * 0.2, 10, w * 0.78, h * 0.6, 260);
      coneGrad.addColorStop(0, 'rgba(240, 240, 240, 0.65)');
      coneGrad.addColorStop(0.5, 'rgba(200, 200, 200, 0.2)');
      coneGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(w * 0.78, h * 0.15);
      ctx.lineTo(w * 0.5, h * 0.85);
      ctx.lineTo(w * 0.95, h * 0.85);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#050505';
      ctx.fillRect(0, h * 0.74, w, h * 0.26);

    } else {
      // Film Cinema Hollywood
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#041724');
      skyGrad.addColorStop(0.4, '#082f49');
      skyGrad.addColorStop(0.7, '#1e1b4b');
      skyGrad.addColorStop(1, '#3b120c');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 7; i++) {
        const bx = (w * 0.15 * i + 80) % w;
        const by = h * 0.45 + Math.sin(i + time) * 30;
        const bGrad = ctx.createRadialGradient(bx, by, 5, bx, by, 70);
        bGrad.addColorStop(0, i % 2 === 0 ? 'rgba(249, 115, 22, 0.3)' : 'rgba(6, 182, 212, 0.3)');
        bGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.arc(bx, by, 70, 0, Math.PI * 2);
        ctx.fill();
      }

      const setGrad = ctx.createLinearGradient(0, h * 0.72, 0, h);
      setGrad.addColorStop(0, '#0f172a');
      setGrad.addColorStop(1, '#020617');
      ctx.fillStyle = setGrad;
      ctx.fillRect(0, h * 0.72, w, h * 0.28);
    }
  }

  private drawFluffyCloud(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.beginPath();
    ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
    ctx.arc(x + size * 0.3, y - size * 0.15, size * 0.45, 0, Math.PI * 2);
    ctx.arc(x + size * 0.65, y, size * 0.38, 0, Math.PI * 2);
    ctx.arc(x + size * 0.35, y + size * 0.1, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderDynamicCharacters(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    project: Project,
    clip: VideoClip,
    clipTime: number,
    totalTime: number,
    progress: number
  ) {
    const chars = project.characters || [];
    const char1 = chars[0] || { name: 'Ryuga', visualAppearance: 'Protagonista' };
    const char2 = chars[1] || { name: 'Kento', visualAppearance: 'Coprotagonista' };

    const activeDialogue = this.getCurrentDialogue(clip, clipTime);
    const speakerName = (activeDialogue?.speaker || '').toLowerCase();

    const isChar1Speaking = speakerName.includes(char1.name.toLowerCase());
    const isChar2Speaking = speakerName.includes(char2.name.toLowerCase()) || (!isChar1Speaking && !!activeDialogue);

    // Dynamic Character 1 (Left Hero)
    const c1X = w * 0.32 + Math.sin(progress * Math.PI * 2) * (w * 0.05);
    const c1Y = h * 0.75 + Math.sin(totalTime * 4.2) * 5;
    this.drawCharacter(ctx, c1X, c1Y, w, h, char1.name, project.style, isChar1Speaking, totalTime, 1, 1.05);

    // Dynamic Character 2 (Right Counterpart)
    const c2X = w * 0.68 - Math.sin(progress * Math.PI * 2) * (w * 0.04);
    const c2Y = h * 0.75 + Math.sin(totalTime * 3.9 + 1) * 4;
    this.drawCharacter(ctx, c2X, c2Y, w, h, char2.name, project.style, isChar2Speaking, totalTime, -1, 1.0);
  }

  private drawCharacter(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    name: string,
    style: VisualStyle,
    isSpeaking: boolean,
    time: number,
    facing: number,
    scaleMod: number = 1.0
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing * scaleMod, scaleMod);

    const baseHeight = h * 0.38;
    const bodyWidth = baseHeight * 0.28;
    const headRadius = baseHeight * 0.17;
    const mouthOpen = isSpeaking ? Math.abs(Math.sin(time * 15)) * 11 : 2;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    ctx.beginPath();
    ctx.ellipse(0, baseHeight * 0.08, bodyWidth * 1.3, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    if (style === 'Manga Shōnen Action') {
      // Fiery Aura around character
      const auraGrad = ctx.createRadialGradient(0, -baseHeight * 0.5, 10, 0, -baseHeight * 0.5, baseHeight * 0.6);
      auraGrad.addColorStop(0, 'rgba(245, 158, 11, 0.6)');
      auraGrad.addColorStop(0.7, 'rgba(239, 68, 68, 0.3)');
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, -baseHeight * 0.5, baseHeight * 0.65, 0, Math.PI * 2);
      ctx.fill();

      // Shōnen martial outfit
      ctx.fillStyle = '#b91c1c';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-bodyWidth * 0.7, -baseHeight * 0.6);
      ctx.lineTo(bodyWidth * 0.7, -baseHeight * 0.6);
      ctx.lineTo(bodyWidth * 0.85, 0);
      ctx.lineTo(-bodyWidth * 0.85, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Spiky anime warrior hair
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.moveTo(-headRadius * 1.2, -baseHeight * 0.75);
      ctx.lineTo(-headRadius * 1.6, -baseHeight * 1.05);
      ctx.lineTo(-headRadius * 0.7, -baseHeight * 0.95);
      ctx.lineTo(0, -baseHeight * 1.2);
      ctx.lineTo(headRadius * 0.8, -baseHeight * 0.98);
      ctx.lineTo(headRadius * 1.5, -baseHeight * 1.08);
      ctx.lineTo(headRadius * 1.1, -baseHeight * 0.75);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Head & Eyes
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(0, -baseHeight * 0.78, headRadius * 0.88, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Intense fiery warrior eyes
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.ellipse(headRadius * 0.35, -baseHeight * 0.8, headRadius * 0.22, headRadius * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Shōnen shouting mouth
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.ellipse(headRadius * 0.35, -baseHeight * 0.7, 8, mouthOpen * 1.1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

    } else if (style === 'Manga B&W Inchiostrato') {
      // Pure G-pen ink crosshatched samurai / hero
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3.5;

      // Body with solid black ink zones and hatched highlights
      ctx.beginPath();
      ctx.moveTo(-bodyWidth * 0.7, -baseHeight * 0.65);
      ctx.lineTo(bodyWidth * 0.7, -baseHeight * 0.65);
      ctx.lineTo(bodyWidth * 0.9, 0);
      ctx.lineTo(-bodyWidth * 0.9, 0);
      ctx.closePath();
      ctx.fillStyle = '#000000';
      ctx.fill();
      ctx.stroke();

      // Head with pure white skin and sharp black ink hair
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -baseHeight * 0.78, headRadius * 0.85, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Sharp Manga Ink Hair
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(-headRadius, -baseHeight * 0.78);
      ctx.lineTo(-headRadius * 1.4, -baseHeight * 1.02);
      ctx.lineTo(-headRadius * 0.5, -baseHeight * 0.92);
      ctx.lineTo(0, -baseHeight * 1.15);
      ctx.lineTo(headRadius * 0.7, -baseHeight * 0.94);
      ctx.lineTo(headRadius * 1.3, -baseHeight * 1.04);
      ctx.lineTo(headRadius * 0.8, -baseHeight * 0.76);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Crosshatching shadow on cheek
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      for (let k = 0; k < 4; k++) {
        ctx.beginPath();
        ctx.moveTo(-2 + k * 3, -baseHeight * 0.76);
        ctx.lineTo(2 + k * 3, -baseHeight * 0.72);
        ctx.stroke();
      }

      // Manga eye
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(headRadius * 0.35, -baseHeight * 0.8, 5, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ink mouth
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(headRadius * 0.35, -baseHeight * 0.72, 7, Math.max(2, mouthOpen * 0.9), 0, 0, Math.PI * 2);
      ctx.fill();

    } else if (style === 'Cyberpunk Neo-Tokyo Anime') {
      // Cybernetic operative: glowing visor, tech coat
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-bodyWidth * 0.65, -baseHeight * 0.62, bodyWidth * 1.3, baseHeight * 0.68, 10);
      ctx.fill();
      ctx.stroke();

      // Head
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(0, -baseHeight * 0.78, headRadius * 0.85, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Cyan Visor
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 12;
      ctx.fillRect(-headRadius * 0.2, -baseHeight * 0.84, headRadius * 1.1, 9);
      ctx.shadowBlur = 0;

      // Cyberpunk hair with pink streak
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.moveTo(-headRadius, -baseHeight * 0.8);
      ctx.lineTo(-headRadius * 1.2, -baseHeight * 1.0);
      ctx.lineTo(0, -baseHeight * 1.08);
      ctx.lineTo(headRadius * 1.1, -baseHeight * 0.85);
      ctx.closePath();
      ctx.fill();

      // Talking mouth
      ctx.fillStyle = '#831843';
      ctx.beginPath();
      ctx.ellipse(headRadius * 0.35, -baseHeight * 0.72, 7, mouthOpen, 0, 0, Math.PI * 2);
      ctx.fill();

    } else if (style === '3D Pixar Cartoon') {
      const bodyGrad = ctx.createLinearGradient(-bodyWidth, -baseHeight * 0.7, bodyWidth, 0);
      bodyGrad.addColorStop(0, '#f97316');
      bodyGrad.addColorStop(0.5, '#ea580c');
      bodyGrad.addColorStop(1, '#9a3412');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.roundRect(-bodyWidth / 2, -baseHeight * 0.6, bodyWidth, baseHeight * 0.65, 20);
      ctx.fill();

      const headGrad = ctx.createRadialGradient(-headRadius * 0.2, -baseHeight * 0.78, 5, 0, -baseHeight * 0.78, headRadius);
      headGrad.addColorStop(0, '#fed7aa');
      headGrad.addColorStop(0.8, '#fdba74');
      headGrad.addColorStop(1, '#fb923c');
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.arc(0, -baseHeight * 0.78, headRadius, 0, Math.PI * 2);
      ctx.fill();

      const eyeX = headRadius * 0.35;
      const eyeY = -baseHeight * 0.8;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, headRadius * 0.26, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(eyeX + 2, eyeY, headRadius * 0.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(eyeX + 2, eyeY, headRadius * 0.09, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeX + 4, eyeY - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#881337';
      ctx.beginPath();
      ctx.ellipse(headRadius * 0.35, -baseHeight * 0.72, 8, mouthOpen, 0, 0, Math.PI * 2);
      ctx.fill();

    } else if (style === '2D Anime') {
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 3;
      ctx.fillStyle = '#4338ca';
      ctx.beginPath();
      ctx.moveTo(-bodyWidth * 0.6, -baseHeight * 0.6);
      ctx.lineTo(bodyWidth * 0.6, -baseHeight * 0.6);
      ctx.lineTo(bodyWidth * 0.8, 0);
      ctx.lineTo(-bodyWidth * 0.8, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, -baseHeight * 0.78, headRadius * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.moveTo(-headRadius, -baseHeight * 0.78);
      ctx.lineTo(-headRadius * 1.3, -baseHeight * 0.95);
      ctx.lineTo(0, -baseHeight * 1.05);
      ctx.lineTo(headRadius * 1.2, -baseHeight * 0.98);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.ellipse(headRadius * 0.35, -baseHeight * 0.8, headRadius * 0.2, headRadius * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.ellipse(headRadius * 0.35, -baseHeight * 0.71, 7, mouthOpen * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

    } else if (style === 'Black & White Vintage 50s/70s') {
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.moveTo(-bodyWidth * 0.7, -baseHeight * 0.65);
      ctx.lineTo(bodyWidth * 0.7, -baseHeight * 0.65);
      ctx.lineTo(bodyWidth * 0.9, 0);
      ctx.lineTo(-bodyWidth * 0.9, 0);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#e4e4e7';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(bodyWidth * 0.7, -baseHeight * 0.65);
      ctx.lineTo(bodyWidth * 0.9, 0);
      ctx.stroke();

      ctx.fillStyle = '#d4d4d8';
      ctx.beginPath();
      ctx.arc(0, -baseHeight * 0.78, headRadius * 0.85, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#09090b';
      ctx.fillRect(-headRadius * 1.2, -baseHeight * 0.86, headRadius * 2.4, 7);
      ctx.beginPath();
      ctx.roundRect(-headRadius * 0.8, -baseHeight * 0.98, headRadius * 1.6, baseHeight * 0.14, [8, 8, 0, 0]);
      ctx.fill();

      ctx.fillStyle = '#27272a';
      ctx.fillRect(headRadius * 0.2, -baseHeight * 0.73, 10, Math.max(2, mouthOpen * 0.8));

    } else {
      // Hollywood Cinema
      const coatGrad = ctx.createLinearGradient(0, -baseHeight * 0.65, 0, 0);
      coatGrad.addColorStop(0, '#1e293b');
      coatGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = coatGrad;
      ctx.beginPath();
      ctx.roundRect(-bodyWidth * 0.65, -baseHeight * 0.65, bodyWidth * 1.3, baseHeight * 0.7, 12);
      ctx.fill();

      const skinGrad = ctx.createRadialGradient(0, -baseHeight * 0.78, 5, 0, -baseHeight * 0.78, headRadius);
      skinGrad.addColorStop(0, '#fed7aa');
      skinGrad.addColorStop(1, '#9a3412');
      ctx.fillStyle = skinGrad;
      ctx.beginPath();
      ctx.arc(0, -baseHeight * 0.78, headRadius * 0.85, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(headRadius * 0.35, -baseHeight * 0.8, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#450a0a';
      ctx.beginPath();
      ctx.ellipse(headRadius * 0.35, -baseHeight * 0.73, 7, mouthOpen * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Name tag above character
    ctx.restore();
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(x - 50, y - baseHeight * 1.15, 100, 24, 6);
    ctx.fill();
    ctx.strokeStyle = isSpeaking ? '#38bdf8' : 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = isSpeaking ? '#38bdf8' : '#e2e8f0';
    ctx.font = '700 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${name} ${isSpeaking ? '🗣️' : ''}`, x, y - baseHeight * 1.15 + 16);
    ctx.restore();
  }

  private renderMangaOnomatopoeia(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    style: VisualStyle,
    time: number,
    clip: VideoClip,
    clipTime: number
  ) {
    ctx.save();
    const isBW = style === 'Manga B&W Inchiostrato';

    // Cycle through onomatopoeia
    const sfx = this.onomatopoeiaPool[Math.floor((clipTime * 1.8) % this.onomatopoeiaPool.length)];
    if (!sfx) {
      ctx.restore();
      return;
    }

    const posX = w * sfx.x;
    const posY = h * sfx.y + Math.sin(time * 5) * 6;
    const scale = 1.0 + Math.sin(time * 8) * 0.12;

    ctx.translate(posX, posY);
    ctx.scale(scale, scale);
    ctx.rotate(-0.15);

    // Dynamic Japanese Kanji Onomatopoeia SFX
    ctx.font = '900 42px "Cinzel", "Noto Sans JP", impact, sans-serif';
    ctx.textAlign = 'center';

    // Stroke
    ctx.strokeStyle = isBW ? '#ffffff' : '#000000';
    ctx.lineWidth = 7;
    ctx.strokeText(sfx.kanji, 0, 0);

    // Fill
    ctx.fillStyle = isBW ? '#000000' : '#f59e0b';
    ctx.fillText(sfx.kanji, 0, 0);

    // Romaji subtitle below
    ctx.font = '800 12px "JetBrains Mono", monospace';
    ctx.fillStyle = isBW ? '#000000' : '#ffffff';
    ctx.fillText(`[${sfx.romaji}]`, 0, 20);

    ctx.restore();
  }

  private renderAtmosphereFx(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    style: VisualStyle,
    time: number,
    clip: VideoClip
  ) {
    if (style === 'Black & White Vintage 50s/70s') {
      if (Math.random() > 0.35) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1;
        const scratchX = Math.random() * w;
        ctx.beginPath();
        ctx.moveTo(scratchX, 0);
        ctx.lineTo(scratchX + (Math.random() - 0.5) * 6, h);
        ctx.stroke();
      }

      const flicker = (Math.sin(time * 30) + Math.cos(time * 45)) * 0.03;
      const vigGrad = ctx.createRadialGradient(w / 2, h / 2, h * 0.4, w / 2, h / 2, w * 0.75);
      vigGrad.addColorStop(0, `rgba(0, 0, 0, 0)`);
      vigGrad.addColorStop(1, `rgba(0, 0, 0, ${0.65 + flicker})`);
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, w, h);

    } else if (style === 'Film Cinema Hollywood') {
      const flareY = h * 0.48;
      const flareGrad = ctx.createLinearGradient(0, flareY, w, flareY);
      flareGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
      flareGrad.addColorStop(0.35, 'rgba(6, 182, 212, 0.15)');
      flareGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.65)');
      flareGrad.addColorStop(0.65, 'rgba(6, 182, 212, 0.15)');
      flareGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = flareGrad;
      ctx.fillRect(0, flareY - 4, w, 8);

      ctx.fillStyle = '#000000';
      const barH = h * 0.08;
      ctx.fillRect(0, 0, w, barH);
      ctx.fillRect(0, h - barH, w, barH);

    } else if (style === '3D Pixar Cartoon') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      for (const p of this.particles) {
        const px = ((p.x * w + p.vx * time * 1000) % w + w) % w;
        const py = ((p.y * h + p.vy * time * 500) % h + h) % h;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (style === 'Cyberpunk Neo-Tokyo Anime') {
      // Digital Rain streaks
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 25; i++) {
        const rx = (i * (w / 25) + time * 100) % w;
        const ry = (time * 600 + i * 40) % h;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 8, ry + 25);
        ctx.stroke();
      }
    }
  }

  private renderClipTransitionEffect(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    type: string,
    fadeProgress: number, // 0 (start of transition) to 1 (end)
    style: VisualStyle
  ) {
    ctx.save();
    const alpha = 1.0 - fadeProgress;

    if (type === 'Ink-Splash' || style.includes('Manga')) {
      // Dynamic Manga Ink bloom
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.85})`;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, Math.max(w, h) * fadeProgress * 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'Smash-Cut') {
      // White flash cut
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
      ctx.fillRect(0, 0, w, h);
    } else {
      // Whip-pan blur motion lines
      ctx.fillStyle = `rgba(15, 23, 42, ${alpha * 0.5})`;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.restore();
  }

  private renderCinematicSubtitles(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    clip: VideoClip,
    clipTime: number,
    clipDuration: number
  ) {
    const dialogue = this.getCurrentDialogue(clip, clipTime);
    if (!dialogue) return;

    ctx.save();
    const subY = h * 0.88;
    const padding = 18;
    ctx.font = '700 17px system-ui, -apple-system, sans-serif';
    const text = `"${dialogue.text}"`;
    const speaker = dialogue.speaker.toUpperCase();
    const fullText = `${speaker}: ${text}`;
    const textWidth = ctx.measureText(fullText).width;

    ctx.fillStyle = 'rgba(10, 15, 25, 0.88)';
    ctx.beginPath();
    ctx.roundRect((w - textWidth) / 2 - padding, subY - 24, textWidth + padding * 2, 40, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${speaker}: `, w / 2 - textWidth / 2 + ctx.measureText(`${speaker}: `).width / 2, subY);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, w / 2 + ctx.measureText(`${speaker}: `).width / 2, subY);

    ctx.restore();
  }

  private renderProductionHud(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    project: Project,
    clipIndex: number,
    clipTime: number,
    totalTime: number
  ) {
    ctx.save();

    // Top-left HUD badge: CineVeo AI Engine
    ctx.fillStyle = 'rgba(11, 15, 23, 0.85)';
    ctx.beginPath();
    ctx.roundRect(18, 18, 280, 34, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Red recording pulse indicator
    const pulse = (Math.sin(totalTime * 5) + 1) / 2;
    ctx.fillStyle = `rgba(239, 68, 68, ${0.6 + pulse * 0.4})`;
    ctx.beginPath();
    ctx.arc(34, 35, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`CINEVEO AI • CLIP ${clipIndex + 1}/${project.clips.length} [60FPS]`, 48, 39);

    // Audio Visualizer spectrum dancing bars in HUD
    for (let b = 0; b < 6; b++) {
      const bH = 4 + Math.abs(Math.sin(totalTime * 12 + b * 1.5)) * 14;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(250 + b * 4, 39 - bH / 2, 2.5, bH);
    }

    // Top-right HUD badge: Style & Camera Move
    const rightBadgeText = `${project.style} • ${project.clips[clipIndex]?.cameraMovement?.slice(0, 24) || 'Camera Active'}`;
    ctx.font = '500 11px system-ui, sans-serif';
    const rbWidth = ctx.measureText(rightBadgeText).width + 24;

    ctx.fillStyle = 'rgba(11, 15, 23, 0.85)';
    ctx.beginPath();
    ctx.roundRect(w - rbWidth - 18, 18, rbWidth, 34, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.fillText(rightBadgeText, w - rbWidth - 6, 39);

    ctx.restore();
  }

  public getCurrentDialogue(clip: VideoClip, clipTime: number) {
    if (!clip.dialogues || clip.dialogues.length === 0) return null;
    const clipDur = clip.durationSeconds || 15;
    const count = clip.dialogues.length;
    const sliceDur = clipDur / count;
    const index = Math.min(count - 1, Math.floor(clipTime / sliceDur));
    return clip.dialogues[index];
  }

  // HD Video Exporter using MediaRecorder
  public async exportVideoHD(
    project: Project,
    resolution: '1080p' | '4K' | '720p',
    fps: number = 60,
    onProgress: (percent: number, status: string) => void
  ): Promise<Blob> {
    const dim = resolution === '4K' ? { w: 3840, h: 2160 } : resolution === '1080p' ? { w: 1920, h: 1080 } : { w: 1280, h: 720 };
    
    let exportW = dim.w;
    let exportH = dim.h;
    if (project.aspectRatio === '9:16') {
      exportW = dim.h;
      exportH = dim.w;
    } else if (project.aspectRatio === '1:1') {
      exportW = Math.min(dim.w, dim.h);
      exportH = exportW;
    } else if (project.aspectRatio === '21:9') {
      exportW = dim.w;
      exportH = Math.round((dim.w * 9) / 21);
    }

    const canvas = document.createElement('canvas');
    canvas.width = exportW;
    canvas.height = exportH;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Impossibile inizializzare il contesto Canvas 2D per il rendering HD');

    const totalDuration = project.clips.reduce((acc, c) => acc + (c.durationSeconds || 15), 0);
    const stream = canvas.captureStream(fps);

    const audioDest = audioEngine.getAudioStreamDestination();
    if (audioDest) {
      audioDest.stream.getAudioTracks().forEach(track => stream.addTrack(track));
      audioEngine.startStyleAmbience(project.style, audioDest);
    }

    let mimeType = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8') ? 'video/webm;codecs=vp8' : 'video/webm';
    }

    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: resolution === '4K' ? 16000000 : 8000000
    });

    const recordedChunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    return new Promise((resolve, reject) => {
      recorder.onstop = () => {
        audioEngine.stopAmbience();
        const finalBlob = new Blob(recordedChunks, { type: 'video/webm' });
        resolve(finalBlob);
      };

      recorder.onerror = (err) => {
        audioEngine.stopAmbience();
        reject(err);
      };

      recorder.start();

      const startTime = performance.now();
      const intervalMs = 1000 / fps;

      const renderInterval = setInterval(() => {
        const elapsed = (performance.now() - startTime) / 1000;
        const progressPercent = Math.min(100, Math.round((elapsed / totalDuration) * 100));

        if (elapsed >= totalDuration) {
          clearInterval(renderInterval);
          onProgress(100, 'Finalizzazione file ad alta definizione...');
          recorder.stop();
          return;
        }

        let accumulated = 0;
        let activeIndex = 0;
        let localTime = 0;

        for (let i = 0; i < project.clips.length; i++) {
          const cDur = project.clips[i].durationSeconds || 15;
          if (elapsed >= accumulated && elapsed < accumulated + cDur) {
            activeIndex = i;
            localTime = elapsed - accumulated;
            break;
          }
          accumulated += cDur;
        }

        this.renderFrame(ctx, exportW, exportH, project, activeIndex, localTime, elapsed, {
          showSubtitles: true,
          showWatermark: true,
          exportMode: true,
          showOnomatopoeia: true
        });

        onProgress(
          progressPercent,
          `Rendering HD [${resolution}] Clip ${activeIndex + 1}/${project.clips.length} (${elapsed.toFixed(1)}s / ${totalDuration.toFixed(1)}s)...`
        );
      }, intervalMs);
    });
  }
}

export const videoEngine = new VideoEngine();
