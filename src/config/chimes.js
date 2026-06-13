export const DEFAULT_CHIME_URL = "https://mgsqrwnwppjmijenbfys.supabase.co/storage/v1/object/public/chimes/public/wind-chimes-37762.mp3";

export const CHIME_CATEGORIES = ["Gentle", "Standard", "Urgent", "Fun"];

export const PRESET_CHIMES = [
  { id: "preset-wind-chimes", name: "Wind Chimes", url: DEFAULT_CHIME_URL, category: "Gentle" },
  { id: "preset-bell", name: "Bell", url: "https://mgsqrwnwppjmijenbfys.supabase.co/storage/v1/object/public/chimes/public/bell.mp3", category: "Standard" },
  { id: "preset-gentle-ding", name: "Gentle Ding", url: "https://mgsqrwnwppjmijenbfys.supabase.co/storage/v1/object/public/chimes/public/gentle-ding.mp3", category: "Gentle" },
  { id: "preset-chime", name: "Chime", url: "https://mgsqrwnwppjmijenbfys.supabase.co/storage/v1/object/public/chimes/public/chime.mp3", category: "Standard" },
  { id: "preset-soft-buzzer", name: "Soft Buzzer", url: "https://mgsqrwnwppjmijenbfys.supabase.co/storage/v1/object/public/chimes/public/soft-buzzer.mp3", category: "Urgent" },
  { id: "preset-xylophone", name: "Xylophone", url: "https://mgsqrwnwppjmijenbfys.supabase.co/storage/v1/object/public/chimes/public/xylophone.mp3", category: "Fun" },
  { id: "preset-birds", name: "Birds", url: "https://mgsqrwnwppjmijenbfys.supabase.co/storage/v1/object/public/chimes/public/birds.mp3", category: "Gentle" },
  { id: "preset-school-bell", name: "School Bell", url: "https://mgsqrwnwppjmijenbfys.supabase.co/storage/v1/object/public/chimes/public/school-bell.mp3", category: "Urgent" },
  { id: "preset-marimba", name: "Marimba", url: "https://mgsqrwnwppjmijenbfys.supabase.co/storage/v1/object/public/chimes/public/marimba.mp3", category: "Fun" },
  { id: "preset-piano", name: "Piano", url: "https://mgsqrwnwppjmijenbfys.supabase.co/storage/v1/object/public/chimes/public/piano.mp3", category: "Gentle" },
];

export const DEFAULT_WARNING_CHIME_URL = "https://mgsqrwnwppjmijenbfys.supabase.co/storage/v1/object/public/chimes/public/gentle-ding.mp3";

export const PRESET_WARNING_CHIMES = [
  { id: "preset-warning-gentle", name: "Gentle Warning", url: DEFAULT_CHIME_URL, category: "Gentle" },
  { id: "preset-warning-ding", name: "Warning Ding", url: "https://mgsqrwnwppjmijenbfys.supabase.co/storage/v1/object/public/chimes/public/gentle-ding.mp3", category: "Standard" },
  { id: "preset-warning-bell", name: "Warning Bell", url: "https://mgsqrwnwppjmijenbfys.supabase.co/storage/v1/object/public/chimes/public/bell.mp3", category: "Urgent" },
  { id: "preset-warning-chirp", name: "Chirp", url: "https://mgsqrwnwppjmijenbfys.supabase.co/storage/v1/object/public/chimes/public/xylophone.mp3", category: "Fun" },
];

export function isPresetSound(soundId) {
  return soundId?.startsWith("preset-");
}

export function findPresetChime(soundId) {
  return PRESET_CHIMES.find(c => c.id === soundId) || null;
}

export function findPresetWarningChime(soundId) {
  return PRESET_WARNING_CHIMES.find(c => c.id === soundId) || null;
}

export function resolveSoundUrl(soundId, userSounds, defaultSoundUrl, fallbackUrl) {
  if (!soundId) return fallbackUrl;

  const preset = findPresetChime(soundId);
  if (preset) return preset.url;

  const userSound = userSounds?.find(s => s.id === soundId);
  if (userSound) return userSound.storage_url;

  if (soundId === "__default__" && defaultSoundUrl) return defaultSoundUrl;

  return fallbackUrl;
}

export default {
  CHIME_CATEGORIES,
  PRESET_CHIMES,
  PRESET_WARNING_CHIMES,
  DEFAULT_CHIME_URL,
  DEFAULT_WARNING_CHIME_URL,
  isPresetSound,
  findPresetChime,
  findPresetWarningChime,
  resolveSoundUrl,
};
