import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { computeProgress } from '../domain/gamification';
import { EventType, Idea, createEvent } from '../domain/learningEvent';
import { applyReview, dueCards, isCorrect, missingCards, nextDueDate } from '../domain/scheduling';
import { normalizeTerm } from '../domain/word';
import { useRepositories } from './RepositoryContext';

const LearningContext = createContext(null);

/**
 * Shared learning state: event log, preferences (idea flags, algorithm) and
 * review cards. Game progress and due cards are derived from it.
 *
 * @param {{ clock?: () => Date, children: React.ReactNode }} props
 */
export function LearningProvider({ clock: clockProp, children }) {
  // Stable clock so callbacks and effects do not change on every render.
  const clockRef = useRef(clockProp);
  clockRef.current = clockProp;
  const clock = useCallback(() => (clockRef.current ? clockRef.current() : new Date()), []);
  const { learningEvents, preferences: preferencesRepo, review } = useRepositories();
  const [events, setEvents] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([learningEvents.list(), preferencesRepo.get(), review.list()]).then(([e, p, c]) => {
      if (cancelled) return;
      setEvents(e);
      setPreferences(p);
      setCards(c);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [learningEvents, preferencesRepo, review]);

  const record = useCallback(
    async (input) => {
      const event = createEvent(input, clock());
      await learningEvents.append(event);
      setEvents((current) => [...current, event]);
      return event;
    },
    [learningEvents, clock],
  );

  const updatePreferences = useCallback(
    async (changes) => setPreferences(await preferencesRepo.update(changes)),
    [preferencesRepo],
  );

  const saveCards = useCallback(
    async (changed) => {
      if (changed.length === 0) return;
      await review.saveAll(changed);
      setCards(await review.list());
    },
    [review],
  );

  /** Creates review cards for words that do not have one (new or previously saved words). */
  const ensureCards = useCallback(
    async (terms) => {
      const strategy = preferences?.schedulingStrategy;
      if (!strategy) return;
      await saveCards(missingCards(terms, await review.list(), strategy, clock()));
    },
    [preferences?.schedulingStrategy, review, saveCards, clock],
  );

  const removeCard = useCallback(
    async (term) => {
      await review.remove(term);
      setCards(await review.list());
    },
    [review],
  );

  /** Answers a review: reschedules the card and records the event (with the FSRS-6 shadow prediction). */
  const rate = useCallback(
    async (term, grade) => {
      const card = cards.find((c) => normalizeTerm(c.term) === normalizeTerm(term));
      if (!card) return null;
      const now = clock();
      const result = applyReview(card, grade, now);
      await saveCards([result.card]);
      await record({
        idea: Idea.REVIEW,
        type: EventType.WORD_REVIEWED,
        term: card.term,
        correct: isCorrect(grade),
        meta: {
          grade,
          strategy: card.strategy,
          elapsedDays: Number(result.elapsedDays.toFixed(3)),
          predictedRecall: result.predictedRecall,
        },
      });
      return result.card;
    },
    [cards, clock, record, saveCards],
  );

  const value = useMemo(() => {
    const now = clock();
    return {
      loading,
      events,
      record,
      preferences,
      updatePreferences,
      isEnabled: (ideaId) => preferences?.flags?.[ideaId] !== false,
      cards,
      ensureCards,
      removeCard,
      rate,
      dueCardsNow: (terms) => {
        const allowed = terms ? new Set(terms.map(normalizeTerm)) : null;
        return dueCards(cards, clock()).filter((c) => !allowed || allowed.has(normalizeTerm(c.term)));
      },
      nextDue: (terms) => {
        const allowed = terms ? new Set(terms.map(normalizeTerm)) : null;
        return nextDueDate(
          cards.filter((c) => !allowed || allowed.has(normalizeTerm(c.term))),
          clock(),
        );
      },
      progress: computeProgress(events, now),
      now: clock,
    };
  }, [loading, events, record, preferences, updatePreferences, cards, ensureCards, removeCard, rate, clock]);

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}

export function useLearning() {
  const value = useContext(LearningContext);
  if (!value) throw new Error('useLearning must be used inside <LearningProvider>');
  return value;
}
