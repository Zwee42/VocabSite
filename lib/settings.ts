export interface TrainerSettings {
  reverse: boolean;
  typing: boolean;
}

const STORAGE_KEY = 'vocab_trainer_settings';
const DEFAULTS: TrainerSettings = { reverse: false, typing: false };

export function getSettings(): TrainerSettings {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(s: TrainerSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}
