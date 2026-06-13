import { DEFAULT_CHIME_URL as defaultChimeUrl, DEFAULT_WARNING_CHIME_URL as defaultWarningChimeUrl } from './constants'
export const DEFAULT_CHIME_URL = defaultChimeUrl
export const DEFAULT_WARNING_CHIME_URL = defaultWarningChimeUrl


const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mgsqrwnwppjmijenbfys.supabase.co'
const STORAGE_BASE_URL = `${SUPABASE_URL}/storage/v1/object/public/chimes/public`

export const CHIME_CATEGORIES = ['Gentle', 'Standard', 'Urgent', 'Fun']

export const PRESET_CHIMES = [
  { id: 'preset-wind-chimes', name: 'Wind Chimes', url: DEFAULT_CHIME_URL, category: 'Gentle' },
  { id: 'preset-bell', name: 'Bell', url: `${STORAGE_BASE_URL}/bell.mp3`, category: 'Standard' },
  { id: 'preset-gentle-ding', name: 'Gentle Ding', url: `${STORAGE_BASE_URL}/gentle-ding.mp3`, category: 'Gentle' },
  { id: 'preset-chime', name: 'Chime', url: `${STORAGE_BASE_URL}/chime.mp3`, category: 'Standard' },
  { id: 'preset-soft-buzzer', name: 'Soft Buzzer', url: `${STORAGE_BASE_URL}/soft-buzzer.mp3`, category: 'Urgent' },
  { id: 'preset-xylophone', name: 'Xylophone', url: `${STORAGE_BASE_URL}/xylophone.mp3`, category: 'Fun' },
  { id: 'preset-birds', name: 'Birds', url: `${STORAGE_BASE_URL}/birds.mp3`, category: 'Gentle' },
  { id: 'preset-school-bell', name: 'School Bell', url: `${STORAGE_BASE_URL}/school-bell.mp3`, category: 'Urgent' },
  { id: 'preset-marimba', name: 'Marimba', url: `${STORAGE_BASE_URL}/marimba.mp3`, category: 'Fun' },
  { id: 'preset-piano', name: 'Piano', url: `${STORAGE_BASE_URL}/piano.mp3`, category: 'Gentle' },
]

export const PRESET_WARNING_CHIMES = [
  { id: 'preset-warning-gentle', name: 'Gentle Warning', url: DEFAULT_CHIME_URL, category: 'Gentle' },
  { id: 'preset-warning-ding', name: 'Warning Ding', url: `${STORAGE_BASE_URL}/gentle-ding.mp3`, category: 'Standard' },
  { id: 'preset-warning-bell', name: 'Warning Bell', url: `${STORAGE_BASE_URL}/bell.mp3`, category: 'Urgent' },
  { id: 'preset-warning-chirp', name: 'Chirp', url: `${STORAGE_BASE_URL}/xylophone.mp3`, category: 'Fun' },
]

export function isPresetSound(soundId) {
  return soundId?.startsWith('preset-')
}

export function findPresetChime(soundId) {
  return PRESET_CHIMES.find(c => c.id === soundId) || null
}

export function findPresetWarningChime(soundId) {
  return PRESET_WARNING_CHIMES.find(c => c.id === soundId) || null
}

export function resolveSoundUrl(soundId, userSounds, defaultSoundUrl, fallbackUrl) {
  if (!soundId) return fallbackUrl

  const preset = findPresetChime(soundId)
  if (preset) return preset.url

  const userSound = userSounds?.find(s => s.id === soundId)
  if (userSound) return userSound.storage_url

  if (soundId === '__default__' && defaultSoundUrl) return defaultSoundUrl

  return fallbackUrl
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
}
