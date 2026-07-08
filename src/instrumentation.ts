/**
 * Next.js instrumentation file — runs once when the server starts.
 *
 * This sets up a server-side setInterval that calls the auto-generate cron
 * endpoint every 3 hours. This ensures every user always has a fresh task
 * waiting for them, even if they haven't manually requested one.
 *
 * The interval calls /api/tasks/auto-generate which:
 *   1. Expires old pending tasks
 *   2. Generates new tasks for users who don't have an active task
 *
 * Note: In serverless environments (Vercel), this won't work — you'd need
 * an external cron service (e.g., cron-job.org, Vercel Cron, or GitHub Actions).
 * For self-hosted / dev servers, this works perfectly.
 */

export async function register() {
  // Only run on the server (not during build)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const AUTO_GENERATE_INTERVAL_MS = 3 * 60 * 60 * 1000 // 3 hours

    // Run once immediately on startup (after a short delay to let the server start)
    setTimeout(async () => {
      try {
        const baseUrl = `http://localhost:${process.env.PORT || 3000}`
        await fetch(`${baseUrl}/api/tasks/auto-generate`, { method: 'POST' })
        console.log('[cron] Auto-generate task ran on startup')
      } catch (err) {
        console.error('[cron] Auto-generate failed on startup:', err)
      }
    }, 10000) // 10 seconds after startup

    // Then run every 3 hours
    setInterval(async () => {
      try {
        const baseUrl = `http://localhost:${process.env.PORT || 3000}`
        await fetch(`${baseUrl}/api/tasks/auto-generate`, { method: 'POST' })
        console.log('[cron] Auto-generate task ran on schedule')
      } catch (err) {
        console.error('[cron] Auto-generate failed:', err)
      }
    }, AUTO_GENERATE_INTERVAL_MS)

    console.log(`[cron] Auto-generate scheduled every 3 hours (${AUTO_GENERATE_INTERVAL_MS / 1000 / 60} min)`)
  }
}
