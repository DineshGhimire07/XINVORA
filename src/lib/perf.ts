/**
 * lib/perf.ts — Temporary profiling utilities for Add to Bag flow.
 * Remove this file after profiling is complete.
 */

export type TimingEntry = { name: string; ms: number }

/**
 * Wraps an already-started promise to record its elapsed time.
 * Safe for use inside Promise.all — does not serialize execution.
 */
export function timedPromise<T>(
  name: string,
  timings: TimingEntry[],
  promise: Promise<T>
): Promise<T> {
  const start = performance.now()
  return promise.then(result => {
    timings.push({ name, ms: performance.now() - start })
    return result
  })
}

/**
 * Prints a formatted timing summary sorted slowest → fastest.
 */
export function printTimingSummary(
  label: string,
  timings: TimingEntry[],
  totalMs?: number
) {
  const sorted = [...timings].sort((a, b) => b.ms - a.ms)

  console.log(`\n${label}`)
  console.log('-'.repeat(label.length))
  for (const t of sorted) {
    const dots = '.'.repeat(Math.max(2, 30 - t.name.length))
    console.log(`${t.name} ${dots} ${Math.round(t.ms)}ms`)
  }
  if (totalMs !== undefined) {
    console.log(`TOTAL ${'.'.repeat(24)} ${Math.round(totalMs)}ms`)
  }
  console.log('')
}
