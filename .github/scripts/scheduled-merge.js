/**
 * Scheduled PR Merge Script
 *
 * Scans open pull requests targeting allowed production branches ('main', 'master')
 * for a `/schedule <datetime>` directive in the PR description, and automatically
 * merges eligible PRs once the scheduled time has arrived.
 */

/**
 * Parses the `/schedule <datetime>` directive from text (PR body / description).
 *
 * Supported examples:
 * - `/schedule 2026-08-20 18:00 UTC`
 * - `/schedule 2026-08-20T18:00:00Z`
 * - `/schedule 2026-08-20 14:00 EDT`
 * - `/schedule: 2026-08-20 18:00` (defaults to UTC if no offset specified)
 * - `/schedule **2026-08-20 18:00 UTC**`
 *
 * @param {string} text - PR body or comment text
 * @param {string} [defaultTimezone='UTC'] - Default timezone if not present
 * @returns {{ raw: string, scheduledDate: Date } | null}
 */
export function parseScheduleDirective(text, defaultTimezone = 'UTC') {
  if (!text || typeof text !== 'string') return null

  // Match /schedule or /schedule: anywhere in text followed by directive value
  const match = text.match(/\/schedule(?::|\s)\s*([^\r\n]+)/i)
  if (!match) return null

  let rawDateStr = match[1].trim()
  // Clean markdown formatting (bold, italic, backticks)
  rawDateStr = rawDateStr.replaceAll(/[*_`]/g, '').trim()

  if (!rawDateStr) return null

  // Check if explicit timezone or offset is in the string (Z, +05:00, -0400, or text timezone like UTC, EST, etc.)
  const hasTimezoneOrOffset = /(?:Z|[+-]\d{2}:?\d{2}|\b[A-Za-z]{2,4}\b)$/i.test(rawDateStr)

  let parsedDate

  if (!hasTimezoneOrOffset) {
    // If no timezone/offset is present, treat according to defaultTimezone (default UTC)
    if (defaultTimezone === 'UTC') {
      const isoFormatted = rawDateStr.replaceAll(' ', 'T')
      const utcAttempt = new Date(isoFormatted.endsWith('Z') ? isoFormatted : `${isoFormatted}Z`)
      if (!isNaN(utcAttempt.getTime())) {
        parsedDate = utcAttempt
      }
    } else {
      const withTz = new Date(`${rawDateStr} ${defaultTimezone}`)
      if (!isNaN(withTz.getTime())) {
        parsedDate = withTz
      }
    }
  } else {
    parsedDate = new Date(rawDateStr)
  }

  if (!parsedDate || isNaN(parsedDate.getTime())) {
    parsedDate = new Date(rawDateStr)
  }

  if (isNaN(parsedDate.getTime())) {
    // Try appending default timezone as last attempt
    parsedDate = new Date(`${rawDateStr} ${defaultTimezone}`)
  }

  if (isNaN(parsedDate.getTime())) {
    return null
  }

  return {
    raw: rawDateStr,
    scheduledDate: parsedDate,
  }
}

/**
 * Determines whether a pull request is eligible for automated scheduled merging.
 *
 * @param {Object} options
 * @param {Object} options.pr - Pull request object from GitHub API
 * @param {string[]} [options.allowedBranches=['main', 'master']] - Allowed target branches
 * @param {Date} [options.now=new Date()] - Current timestamp
 * @returns {{ eligible: boolean, reason?: string, pending?: boolean, scheduledDate?: Date }}
 */
export function isEligibleForMerge({ pr, allowedBranches = ['main', 'master'], now = new Date() }) {
  if (!pr || pr.state !== 'open') {
    return { eligible: false, reason: 'PR is not open' }
  }

  if (pr.draft) {
    return { eligible: false, reason: 'PR is a draft' }
  }

  const baseBranch = pr.base?.ref
  if (!allowedBranches.includes(baseBranch)) {
    return {
      eligible: false,
      reason: `Target branch '${baseBranch}' is not in allowed branches [${allowedBranches.join(', ')}]`,
    }
  }

  const scheduleInfo = parseScheduleDirective(pr.body)
  if (!scheduleInfo) {
    return { eligible: false, reason: 'No /schedule directive found in PR description' }
  }

  if (now.getTime() < scheduleInfo.scheduledDate.getTime()) {
    return {
      eligible: false,
      pending: true,
      reason: `Scheduled time (${scheduleInfo.scheduledDate.toISOString()}) has not arrived yet. Current: ${now.toISOString()}`,
      scheduledDate: scheduleInfo.scheduledDate,
    }
  }

  return {
    eligible: true,
    scheduledDate: scheduleInfo.scheduledDate,
  }
}

/**
 * GitHub API Client Helper Functions using native fetch
 */
export async function fetchOpenPullRequests({ githubToken, owner, repo }) {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=100`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'teachy-time-scheduled-merge',
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to fetch pull requests (${res.status}): ${text}`)
  }

  return await res.json()
}

export async function mergePullRequest({ githubToken, owner, repo, pullNumber, mergeMethod = 'squash' }) {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/merge`
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'teachy-time-scheduled-merge',
    },
    body: JSON.stringify({
      merge_method: mergeMethod,
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.message || `Failed to merge PR #${pullNumber} (HTTP ${res.status})`)
  }

  return data
}

export async function postComment({ githubToken, owner, repo, pullNumber, commentBody }) {
  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${pullNumber}/comments`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'teachy-time-scheduled-merge',
    },
    body: JSON.stringify({ body: commentBody }),
  })

  return res.ok
}

export async function addLabels({ githubToken, owner, repo, pullNumber, labels }) {
  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${pullNumber}/labels`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'teachy-time-scheduled-merge',
    },
    body: JSON.stringify({ labels }),
  })

  return res.ok
}

/**
 * Main execution runner
 */
export async function runScheduledMerge() {
  const githubToken = process.env.GITHUB_TOKEN
  const repoSlug = process.env.GITHUB_REPOSITORY
  const allowedBranches = (process.env.ALLOWED_BRANCHES || 'main,master').split(',').map((b) => b.trim())
  const mergeMethod = process.env.MERGE_METHOD || 'squash'
  const isDryRun = process.env.DRY_RUN === 'true'

  if (!githubToken) {
    console.error('Error: GITHUB_TOKEN environment variable is missing.')
    process.exit(1)
  }

  if (!repoSlug || !repoSlug.includes('/')) {
    console.error('Error: GITHUB_REPOSITORY environment variable is missing or invalid (expected "owner/repo").')
    process.exit(1)
  }

  const [owner, repo] = repoSlug.split('/')
  console.log(`Checking open PRs for ${owner}/${repo} targeting: [${allowedBranches.join(', ')}]...`)

  try {
    const pullRequests = await fetchOpenPullRequests({ githubToken, owner, repo })
    console.log(`Found ${pullRequests.length} open pull requests.`)

    const now = new Date()
    let mergedCount = 0

    for (const pr of pullRequests) {
      const evaluation = isEligibleForMerge({ pr, allowedBranches, now })

      if (!evaluation.eligible) {
        if (evaluation.pending) {
          console.log(`PR #${pr.number} ("${pr.title}"): ${evaluation.reason}`)
        }
        continue
      }

      console.log(`PR #${pr.number} ("${pr.title}") is ready for merge (scheduled for: ${evaluation.scheduledDate?.toISOString()}).`)

      if (isDryRun) {
        console.log(`[DRY RUN] Would merge PR #${pr.number} into ${pr.base.ref} using ${mergeMethod}.`)
        mergedCount++
        continue
      }

      try {
        console.log(`Merging PR #${pr.number} into ${pr.base.ref}...`)
        await mergePullRequest({
          githubToken,
          owner,
          repo,
          pullNumber: pr.number,
          mergeMethod,
        })

        await postComment({
          githubToken,
          owner,
          repo,
          pullNumber: pr.number,
          commentBody: `🚀 **Scheduled Merge Successful**: This pull request was scheduled to merge at \`${evaluation.scheduledDate?.toISOString()}\` and has been automatically merged into \`${pr.base.ref}\`.`,
        })

        console.log(`Successfully merged PR #${pr.number}.`)
        mergedCount++
      } catch (err) {
        console.error(`Failed to merge PR #${pr.number}: ${err.message}`)

        await postComment({
          githubToken,
          owner,
          repo,
          pullNumber: pr.number,
          commentBody: `⚠️ **Scheduled Merge Attempt Failed**: Unable to automatically merge PR #${pr.number}.\n\n**Reason:** ${err.message}\n\nPlease check for failing status checks, branch protection rules, or merge conflicts.`,
        })

        await addLabels({
          githubToken,
          owner,
          repo,
          pullNumber: pr.number,
          labels: ['schedule-merge-failed'],
        }).catch(() => {})
      }
    }

    console.log(`Scheduled merge run completed. Merged ${mergedCount} PR(s).`)
  } catch (error) {
    console.error(`Execution error: ${error.message}`)
    process.exit(1)
  }
}

// Auto-run if executed directly as entrypoint
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  const isDirectRun = process.argv[1] && process.argv[1].endsWith('scheduled-merge.js')
  if (isDirectRun) {
    await runScheduledMerge()
  }
}
