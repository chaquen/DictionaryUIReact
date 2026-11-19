import { EventType, dayKey } from './learningEvent';

/**
 * Metrics to compare MVP ideas (FR-009). Everything is derived from the
 * local event log, so it can also be recomputed from an exported file.
 */

const ratio = (part, total) => (total > 0 ? part / total : null);

/** Uses, active days and success rate of every idea present in the events. */
export function summarizeByIdea(events) {
  const byIdea = new Map();
  for (const event of events) {
    const s = byIdea.get(event.idea) ?? { idea: event.idea, uses: 0, days: new Set(), graded: 0, correct: 0 };
    s.uses += 1;
    s.days.add(dayKey(event.at));
    if (event.correct !== null && event.correct !== undefined) {
      s.graded += 1;
      if (event.correct) s.correct += 1;
    }
    byIdea.set(event.idea, s);
  }
  return [...byIdea.values()]
    .map(({ idea, uses, days, graded, correct }) => ({
      idea,
      uses,
      activeDays: days.size,
      successRate: ratio(correct, graded),
    }))
    .sort((a, b) => b.uses - a.uses);
}

/**
 * Review quality (#1):
 * - recall after 7+ days: the hypothesis "≥ 80 % correct in reviews at 7 days or more";
 * - FSRS-6 shadow calibration: how well its predictions match the user's answers
 *   (log loss: lower is better).
 */
export function reviewStats(events, longGapDays = 7) {
  const reviews = events.filter((e) => e.type === EventType.WORD_REVIEWED);
  const longGap = reviews.filter((e) => (e.meta?.elapsedDays ?? 0) >= longGapDays);
  const predicted = reviews.filter((e) => typeof e.meta?.predictedRecall === 'number');

  const eps = 1e-6;
  const logLoss = predicted.length
    ? predicted.reduce((sum, e) => {
        const p = Math.min(1 - eps, Math.max(eps, e.meta.predictedRecall));
        return sum - (e.correct ? Math.log(p) : Math.log(1 - p));
      }, 0) / predicted.length
    : null;

  const byStrategy = {};
  for (const e of reviews) {
    const id = e.meta?.strategy ?? 'unknown';
    const s = (byStrategy[id] ??= { reviews: 0, correct: 0 });
    s.reviews += 1;
    if (e.correct) s.correct += 1;
  }

  return {
    reviews: reviews.length,
    successRate: ratio(reviews.filter((e) => e.correct).length, reviews.length),
    longGapReviews: longGap.length,
    longGapRecall: ratio(longGap.filter((e) => e.correct).length, longGap.length),
    fsrsPredictions: predicted.length,
    fsrsLogLoss: logLoss,
    byStrategy: Object.entries(byStrategy).map(([strategy, s]) => ({
      strategy,
      reviews: s.reviews,
      successRate: ratio(s.correct, s.reviews),
    })),
  };
}
