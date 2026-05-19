/**
 * System prompts used throughout the application.
 */
import hadesSystemPromptRaw from '../../prompts/hadesSystem.md?raw';
import susurroSystemPromptRaw from '../../prompts/susurroSystem.md?raw';

export interface HadesContext {
  date: string;          // ISO 8601 — e.g. "2026-05-16"
  weekday: string;       // Full name — e.g. "Sexta-feira"
  time: string;          // HH:mm — e.g. "13:21"
  timezone: string;      // IANA + abbreviation — e.g. "America/Sao_Paulo (BRT, UTC-3)"
  language: string;      // BCP 47 — e.g. "pt-BR"
  platform: string;      // e.g. "Windows 11 - Electron"
  activeSkills?: string; // Populated in Phase 4
  userMemory?: string;   // Populated in Phase 5
}

/**
 * Builds a rich HadesContext object from the current environment.
 * Called in useGemini.ts before each inference.
 */
export const buildHadesContext = (activeSkills: string = 'Nenhuma skill carregada ainda.', userMemory: string = 'Nenhuma memória consolidada ainda.'): HadesContext => {
  const now = new Date();
  const locale = 'pt-BR';

  const date = now.toLocaleDateString('en-CA'); // ISO 8601 YYYY-MM-DD
  const weekday = now.toLocaleDateString(locale, { weekday: 'long' });
  const time = now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  const timezone = (() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const abbr = now.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop() || '';
      const offset = now.toLocaleTimeString('en-US', { timeZoneName: 'longOffset' }).split(' ').pop() || '';
      return `${tz} (${abbr}, ${offset})`;
    } catch {
      return 'America/Sao_Paulo (BRT, UTC-3)';
    }
  })();

  return {
    date,
    weekday,
    time,
    timezone,
    language: locale,
    platform: 'Windows - Electron',
    activeSkills,
    userMemory,
  };
};

/**
 * Generates the full SOTA system prompt with 5 XML sections.
 * Based on the "Lost in the Middle" positional bias principle:
 * critical rules go at the TOP and BOTTOM of the prompt.
 */
export const getHadesSystemPrompt = (ctx: HadesContext): string => {
  let prompt = hadesSystemPromptRaw;
  prompt = prompt.replace('{{date}}', ctx.date);
  prompt = prompt.replace('{{weekday}}', ctx.weekday);
  prompt = prompt.replace('{{time}}', ctx.time);
  prompt = prompt.replace('{{timezone}}', ctx.timezone);
  prompt = prompt.replace('{{language}}', ctx.language);
  prompt = prompt.replace('{{platform}}', ctx.platform);
  prompt = prompt.replace('{{activeSkills}}', ctx.activeSkills || 'Nenhuma skill carregada ainda.');
  prompt = prompt.replace('{{userMemory}}', ctx.userMemory || 'Nenhuma memória consolidada ainda.');
  return prompt.trim();
};


export const SUSURRO_DEFAULT_SYSTEM_PROMPT = susurroSystemPromptRaw.trim();
