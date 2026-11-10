import { AspectRatio, Project, VisualStyle } from '../types';

export interface AnalyzeScriptParams {
  script: string;
  style: VisualStyle;
  targetDuration: number;
  maxClipDuration: number;
  aspectRatio: AspectRatio;
  userApiKey?: string;
}

export async function analyzeScriptWithAI(params: AnalyzeScriptParams): Promise<any> {
  const res = await fetch('/api/analyze-script', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Errore di rete del server' }));
    throw new Error(errorData.error || `Errore HTTP ${res.status}`);
  }

  const result = await res.json();
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Risposta non valida dal server');
  }

  return result.data;
}

export async function chatWithDirectorAI(message: string, projectContext: Partial<Project>, userApiKey?: string): Promise<string> {
  const res = await fetch('/api/chat-director', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      scriptContext: projectContext,
      userApiKey
    }),
  });

  if (!res.ok) {
    return 'Il Direttore AI è temporaneamente offline. Continua a modificare il copione nella finestra principale.';
  }

  const data = await res.json();
  return data.reply || 'Risposta elaborata';
}
