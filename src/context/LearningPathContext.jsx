import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { EventType, Idea, dayKey } from '../domain/learningEvent';
import { coverage, coveredTerms, emptyPathState, nextNewWords, remainingToday } from '../domain/learningPath';
import { normalizeTerm } from '../domain/word';
import { useLearning } from './LearningContext';
import { useRepositories } from './RepositoryContext';

const LearningPathContext = createContext(null);

/**
 * Essential vocabulary path (#19): the vocabulary list (loaded on demand),
 * the user's progress along it and the derived coverage.
 */
export function LearningPathProvider({ children }) {
  const { vocabulary, learningPath } = useRepositories();
  const { record, cards, preferences, now } = useLearning();
  const [list, setList] = useState(null);
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    learningPath.get().then((s) => !cancelled && setState(s));
    return () => {
      cancelled = true;
    };
  }, [learningPath]);

  /** Loads the vocabulary list the first time a screen needs it. */
  const loadList = useCallback(() => {
    if (list || error) return;
    vocabulary
      .list()
      .then(setList)
      .catch(() => setError('Could not load the vocabulary list.'));
  }, [list, error, vocabulary]);

  const update = useCallback(
    async (change) => {
      const current = (await learningPath.get()) ?? emptyPathState();
      setState(await learningPath.save(change(current)));
    },
    [learningPath],
  );

  const completePlacement = useCallback(
    async (startRank, knownTerms) => {
      await update((s) => ({
        ...s,
        placement: { startRank, completedAt: now().toISOString() },
        known: [...new Set([...s.known, ...knownTerms.map(normalizeTerm)])],
      }));
      await record({ idea: Idea.LEARN, type: EventType.PLACEMENT_COMPLETED, meta: { startRank, known: knownTerms.length } });
    },
    [update, record, now],
  );

  const markKnown = useCallback(
    async (entry) => {
      await update((s) => ({ ...s, known: [...new Set([...s.known, entry.term])] }));
      await record({ idea: Idea.LEARN, type: EventType.WORD_MARKED_KNOWN, term: entry.term, meta: { rank: entry.rank } });
    },
    [update, record],
  );

  const recordLearned = useCallback(
    (term) =>
      update((s) => {
        const day = dayKey(now());
        return { ...s, learnedByDay: { ...s.learnedByDay, [day]: [...(s.learnedByDay[day] ?? []), term] } };
      }),
    [update, now],
  );

  const addExtraToday = useCallback(
    (count) =>
      update((s) => {
        const day = dayKey(now());
        return { ...s, extraByDay: { ...s.extraByDay, [day]: (s.extraByDay[day] ?? 0) + count } };
      }),
    [update, now],
  );

  const value = useMemo(() => {
    const quota = preferences?.newWordsPerDay ?? 10;
    const covered = list && state ? coveredTerms(list, state, cards) : null;
    return {
      list,
      state,
      error,
      ready: Boolean(list && state),
      loadList,
      source: vocabulary.source,
      quota,
      remainingToday: state ? remainingToday(state, quota, now()) : 0,
      learnedToday: state ? (state.learnedByDay[dayKey(now())]?.length ?? 0) : 0,
      coverage: covered ? coverage(list, covered) : null,
      covered,
      nextWords: (savedTerms, count) => (list && state ? nextNewWords(list, state, savedTerms, count) : []),
      completePlacement,
      markKnown,
      recordLearned,
      addExtraToday,
    };
  }, [list, state, error, loadList, vocabulary, preferences, cards, now, completePlacement, markKnown, recordLearned, addExtraToday]);

  return <LearningPathContext.Provider value={value}>{children}</LearningPathContext.Provider>;
}

export function useLearningPath() {
  const value = useContext(LearningPathContext);
  if (!value) throw new Error('useLearningPath must be used inside <LearningPathProvider>');
  return value;
}
