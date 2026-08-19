import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  parseScheduleDirective,
  isEligibleForMerge,
  fetchOpenPullRequests,
  mergePullRequest,
  postComment,
  addLabels,
} from '../../.github/scripts/scheduled-merge.js'

describe('scheduledMerge - parseScheduleDirective', () => {
  it('returns null for null, empty, or non-matching string', () => {
    expect(parseScheduleDirective(null)).toBeNull()
    expect(parseScheduleDirective('')).toBeNull()
    expect(parseScheduleDirective('This is a normal PR description without schedule')).toBeNull()
    expect(parseScheduleDirective('/schedule invalid-date-text')).toBeNull()
  })

  it('parses standard ISO date format', () => {
    const text = '## Summary\n\n/schedule 2026-08-20T18:00:00Z\n\nReady for merge.'
    const result = parseScheduleDirective(text)
    expect(result).not.toBeNull()
    expect(result.scheduledDate.toISOString()).toBe('2026-08-20T18:00:00.000Z')
  })

  it('parses date with explicit UTC timezone', () => {
    const text = '/schedule 2026-08-20 18:00 UTC'
    const result = parseScheduleDirective(text)
    expect(result).not.toBeNull()
    expect(result.scheduledDate.toISOString()).toBe('2026-08-20T18:00:00.000Z')
  })

  it('handles markdown formatted directives (e.g. bold, backticks)', () => {
    const text = 'Merge trigger: /schedule **2026-08-20 18:00 UTC**'
    const result = parseScheduleDirective(text)
    expect(result).not.toBeNull()
    expect(result.scheduledDate.toISOString()).toBe('2026-08-20T18:00:00.000Z')
  })

  it('handles colon syntax (/schedule: <date>)', () => {
    const text = '/schedule: 2026-08-20 18:00 UTC'
    const result = parseScheduleDirective(text)
    expect(result).not.toBeNull()
    expect(result.scheduledDate.toISOString()).toBe('2026-08-20T18:00:00.000Z')
  })

  it('applies default UTC timezone when date has no timezone offset', () => {
    const text = '/schedule 2026-08-20 18:00'
    const result = parseScheduleDirective(text, 'UTC')
    expect(result).not.toBeNull()
    expect(result.scheduledDate.getUTCFullYear()).toBe(2026)
    expect(result.scheduledDate.getUTCMonth()).toBe(7) // 0-indexed August
    expect(result.scheduledDate.getUTCDate()).toBe(20)
    expect(result.scheduledDate.getUTCHours()).toBe(18)
  })
})

describe('scheduledMerge - isEligibleForMerge', () => {
  const allowedBranches = ['main', 'master']
  const referenceTime = new Date('2026-08-20T18:30:00.000Z')

  it('rejects closed PRs', () => {
    const pr = {
      state: 'closed',
      draft: false,
      base: { ref: 'main' },
      body: '/schedule 2026-08-20 18:00 UTC',
    }
    const result = isEligibleForMerge({ pr, allowedBranches, now: referenceTime })
    expect(result.eligible).toBe(false)
    expect(result.reason).toContain('not open')
  })

  it('rejects draft PRs', () => {
    const pr = {
      state: 'open',
      draft: true,
      base: { ref: 'main' },
      body: '/schedule 2026-08-20 18:00 UTC',
    }
    const result = isEligibleForMerge({ pr, allowedBranches, now: referenceTime })
    expect(result.eligible).toBe(false)
    expect(result.reason).toContain('draft')
  })

  it('rejects PRs targeting non-production branches like dev or feature branches', () => {
    const pr = {
      state: 'open',
      draft: false,
      base: { ref: 'dev' },
      body: '/schedule 2026-08-20 18:00 UTC',
    }
    const result = isEligibleForMerge({ pr, allowedBranches, now: referenceTime })
    expect(result.eligible).toBe(false)
    expect(result.reason).toContain("Target branch 'dev' is not in allowed branches")
  })

  it('rejects PRs without a /schedule directive', () => {
    const pr = {
      state: 'open',
      draft: false,
      base: { ref: 'main' },
      body: 'Regular PR description without any schedule',
    }
    const result = isEligibleForMerge({ pr, allowedBranches, now: referenceTime })
    expect(result.eligible).toBe(false)
    expect(result.reason).toContain('No /schedule directive')
  })

  it('flags future scheduled PR as pending when scheduled time has not arrived', () => {
    const pr = {
      state: 'open',
      draft: false,
      base: { ref: 'main' },
      body: '/schedule 2026-08-20 20:00 UTC', // in the future relative to 18:30
    }
    const result = isEligibleForMerge({ pr, allowedBranches, now: referenceTime })
    expect(result.eligible).toBe(false)
    expect(result.pending).toBe(true)
    expect(result.reason).toContain('has not arrived yet')
  })

  it('marks PR as eligible when targeting main and scheduled time has arrived', () => {
    const pr = {
      state: 'open',
      draft: false,
      base: { ref: 'main' },
      body: '/schedule 2026-08-20 18:00 UTC', // in the past relative to 18:30
    }
    const result = isEligibleForMerge({ pr, allowedBranches, now: referenceTime })
    expect(result.eligible).toBe(true)
    expect(result.scheduledDate).toBeDefined()
  })

  it('marks PR as eligible when targeting master and scheduled time has arrived', () => {
    const pr = {
      state: 'open',
      draft: false,
      base: { ref: 'master' },
      body: '/schedule 2026-08-20 18:00 UTC',
    }
    const result = isEligibleForMerge({ pr, allowedBranches, now: referenceTime })
    expect(result.eligible).toBe(true)
  })
})

describe('scheduledMerge - API helpers', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetchOpenPullRequests fetches open PRs from GitHub API', async () => {
    const mockPulls = [{ id: 1, number: 10, title: 'Release v1.2' }]
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPulls,
    })

    const result = await fetchOpenPullRequests({
      githubToken: 'ghp_mock_token',
      owner: 'itanne99',
      repo: 'teachy-time',
    })

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/itanne99/teachy-time/pulls?state=open&per_page=100',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer ghp_mock_token',
        }),
      })
    )
    expect(result).toEqual(mockPulls)
  })

  it('fetchOpenPullRequests throws on error', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => 'Bad credentials',
    })

    await expect(
      fetchOpenPullRequests({
        githubToken: 'invalid_token',
        owner: 'itanne99',
        repo: 'teachy-time',
      })
    ).rejects.toThrow('Failed to fetch pull requests (401)')
  })

  it('mergePullRequest sends PUT merge request with specified merge method', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ merged: true, message: 'Pull Request successfully merged' }),
    })

    const result = await mergePullRequest({
      githubToken: 'ghp_mock_token',
      owner: 'itanne99',
      repo: 'teachy-time',
      pullNumber: 42,
      mergeMethod: 'squash',
    })

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/itanne99/teachy-time/pulls/42/merge',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ merge_method: 'squash' }),
      })
    )
    expect(result.merged).toBe(true)
  })

  it('postComment sends issue comment to PR', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 100 }),
    })

    const success = await postComment({
      githubToken: 'ghp_mock_token',
      owner: 'itanne99',
      repo: 'teachy-time',
      pullNumber: 42,
      commentBody: 'Merged successfully!',
    })

    expect(success).toBe(true)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/itanne99/teachy-time/issues/42/comments',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ body: 'Merged successfully!' }),
      })
    )
  })

  it('addLabels attaches label to PR', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ name: 'schedule-merge-failed' }],
    })

    const success = await addLabels({
      githubToken: 'ghp_mock_token',
      owner: 'itanne99',
      repo: 'teachy-time',
      pullNumber: 42,
      labels: ['schedule-merge-failed'],
    })

    expect(success).toBe(true)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/itanne99/teachy-time/issues/42/labels',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ labels: ['schedule-merge-failed'] }),
      })
    )
  })
})
