import { describe, it, expect, beforeEach } from 'vitest'
import { useAudioStore } from '@/services/stores/useAudioStore'
import { DEFAULT_CHIME_URL } from '@/config/constants'

describe('useAudioStore', () => {
  beforeEach(() => {
    useAudioStore.getState().resetAudio()
  })

  it('initializes with default audio settings', () => {
    const state = useAudioStore.getState()
    expect(state.audioSrc).toBe(DEFAULT_CHIME_URL)
    expect(state.isPlaying).toBe(false)
    expect(state.userSounds).toEqual([])
    expect(state.defaultSound).toBeNull()
    expect(state.warningLeadMinutes).toBe(3)
    expect(state.warningChimeId).toBeNull()
  })

  it('updates audio playback state and tracks', () => {
    useAudioStore.getState().setAudioSrc('https://example.com/custom.mp3')
    useAudioStore.getState().setIsPlaying(true)
    useAudioStore.getState().setUserSounds([{ id: 1, sound_name: 'Bell' }])
    useAudioStore.getState().setDefaultSound('https://example.com/default.mp3')
    useAudioStore.getState().setWarningLeadMinutes(5)
    useAudioStore.getState().setWarningChimeId('warn-chime-1')

    const state = useAudioStore.getState()
    expect(state.audioSrc).toBe('https://example.com/custom.mp3')
    expect(state.isPlaying).toBe(true)
    expect(state.userSounds).toHaveLength(1)
    expect(state.defaultSound).toBe('https://example.com/default.mp3')
    expect(state.warningLeadMinutes).toBe(5)
    expect(state.warningChimeId).toBe('warn-chime-1')
  })

  it('resets audio state cleanly via resetAudio', () => {
    useAudioStore.getState().setIsPlaying(true)
    useAudioStore.getState().setWarningLeadMinutes(10)

    useAudioStore.getState().resetAudio()
    expect(useAudioStore.getState().isPlaying).toBe(false)
    expect(useAudioStore.getState().warningLeadMinutes).toBe(3)
  })
})
