import { EventType, addDays, dayKey } from './learningEvent';

/**
 * Game mechanics (#18), derived only from learning events: there is no
 * separate state that could drift from what the user actually did.
 */

/** Experience points per event type; correct answers earn a bonus. */
export const XP_RULES = Object.freeze({
  [EventType.WORD_SAVED]: { base: 5, correctBonus: 0 },
  [EventType.WORD_REVIEWED]: { base: 10, correctBonus: 5 },
  [EventType.WORD_MARKED_KNOWN]: { base: 1, correctBonus: 0 },
  [EventType.PLACEMENT_COMPLETED]: { base: 10, correctBonus: 0 },
});

/** Events that keep a streak alive (searching alone does not count). */
const STREAK_TYPES = new Set(Object.keys(XP_RULES));

export const xpOf = (event) => {
  const rule = XP_RULES[event.type];
  if (!rule) return 0;
  return rule.base + (event.correct ? rule.correctBonus : 0);
};

/** Total XP needed to reach `level` (level 1 = 0 XP, 2 = 50, 3 = 150, 4 = 300…). */
export const xpForLevel = (level) => 25 * level * (level - 1);

export function levelFor(xp) {
  const level = Math.floor((1 + Math.sqrt(1 + (4 * xp) / 25)) / 2);
  const floor = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, xpIntoLevel: xp - floor, xpForNextLevel: next - floor };
}

export const ACHIEVEMENTS = Object.freeze([
  { id: 'first-word', title: 'First word', description: 'Save your first word.', check: (s) => s.saved >= 1 },
  { id: 'ten-words', title: 'Word collector', description: 'Save 10 words.', check: (s) => s.saved >= 10 },
  { id: 'first-review', title: 'First review', description: 'Complete your first review.', check: (s) => s.reviews >= 1 },
  { id: 'fifty-reviews', title: 'Dedicated', description: 'Complete 50 reviews.', check: (s) => s.reviews >= 50 },
  { id: 'perfect-ten', title: 'Sharp memory', description: 'Remember 10 words in a row.', check: (s) => s.bestCorrectRun >= 10 },
  { id: 'streak-3', title: 'On fire', description: 'Keep a 3-day streak.', check: (s) => s.bestStreak >= 3 },
  { id: 'streak-7', title: 'Habit', description: 'Keep a 7-day streak.', check: (s) => s.bestStreak >= 7 },
]);

/** Lengths of runs of consecutive days, in chronological order. */
function dayRuns(sortedDays) {
  const runs = [];
  let previous = null;
  for (const day of sortedDays) {
    const expected = previous ? dayKey(addDays(new Date(`${previous}T12:00:00`), 1)) : null;
    if (day === expected) runs[runs.length - 1].length += 1;
    else runs.push({ end: day, length: 1 });
    runs[runs.length - 1].end = day;
    previous = day;
  }
  return runs;
}

/**
 * @param {import('./learningEvent').LearningEvent[]} events
 * @param {Date} now
 */
export function computeProgress(events, now) {
  const ordered = [...events].sort((a, b) => a.at.localeCompare(b.at));
  const stats = { saved: 0, reviews: 0, correctRun: 0, bestCorrectRun: 0, bestStreak: 0 };
  const unlockedAt = {};
  const activeDays = new Set();
  let xp = 0;

  const unlock = (at) => {
    for (const a of ACHIEVEMENTS) {
      if (!unlockedAt[a.id] && a.check(stats)) unlockedAt[a.id] = at;
    }
  };

  for (const event of ordered) {
    xp += xpOf(event);
    if (event.type === EventType.WORD_SAVED) stats.saved += 1;
    if (event.type === EventType.WORD_REVIEWED) {
      stats.reviews += 1;
      stats.correctRun = event.correct ? stats.correctRun + 1 : 0;
      stats.bestCorrectRun = Math.max(stats.bestCorrectRun, stats.correctRun);
    }
    if (STREAK_TYPES.has(event.type)) {
      activeDays.add(dayKey(event.at));
      stats.bestStreak = Math.max(...dayRuns([...activeDays].sort()).map((r) => r.length));
    }
    unlock(event.at);
  }

  const runs = dayRuns([...activeDays].sort());
  const last = runs[runs.length - 1];
  const today = dayKey(now);
  const yesterday = dayKey(addDays(now, -1));
  const alive = Boolean(last) && (last.end === today || last.end === yesterday);

  return {
    xp,
    ...levelFor(xp),
    streak: alive ? last.length : 0,
    bestStreak: stats.bestStreak,
    activeToday: last?.end === today,
    /** The user had a streak and lost it: show it clearly (US-002). */
    streakLost: !alive && Boolean(last),
    achievements: ACHIEVEMENTS.map(({ id, title, description }) => ({
      id,
      title,
      description,
      unlockedAt: unlockedAt[id] ?? null,
    })),
  };
}
