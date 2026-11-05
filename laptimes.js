// Accepts what an attendant reads off the screen: "2:31.402", "2:31.4", "151.402" or "151"
export function parseLapTime(text) {
  const match = text.trim().match(/^(?:(\d{1,2}):)?(\d{1,3})(?:\.(\d{1,3}))?$/);
  if (!match) return null;
  const [, minutes, seconds, fraction = ''] = match;
  if (minutes !== undefined && Number(seconds) >= 60) return null;
  const ms = (Number(minutes ?? 0) * 60 + Number(seconds)) * 1000 + Number(fraction.padEnd(3, '0'));
  return ms > 0 ? ms : null;
}

export function formatLapTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(ms % 1000).padStart(3, '0')}`;
}

export function formatGap(ms) {
  return `+${(ms / 1000).toFixed(3)}`;
}

export function isPersonalBest(driver, ms) {
  return driver.bestLapMs === null || ms < driver.bestLapMs;
}

export function attemptsLeft(driver, maxAttempts) {
  return Math.max(0, maxAttempts - driver.attempts);
}

// Every saved lap uses an attempt, faster or not. The state before the save is kept so a
// mistyped time can be undone.
export function recordAttempt(driver, ms) {
  return {
    attempts: driver.attempts + 1,
    bestLapMs: isPersonalBest(driver, ms) ? ms : driver.bestLapMs,
    lastSave: { attempts: driver.attempts, bestLapMs: driver.bestLapMs },
  };
}

export function undoLastSave(driver) {
  return { attempts: driver.lastSave.attempts, bestLapMs: driver.lastSave.bestLapMs, lastSave: null };
}

export function leaderboard(roster) {
  return roster
    .filter((driver) => driver.attending && driver.bestLapMs !== null)
    .sort((a, b) => a.bestLapMs - b.bestLapMs || a.name.localeCompare(b.name));
}
