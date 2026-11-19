import { useCallback, useEffect, useState } from 'react';
import { EventType, Idea } from '../domain/learningEvent';
import { normalizeTerm } from '../domain/word';
import { useLearning } from '../context/LearningContext';
import { useRepositories } from '../context/RepositoryContext';

/**
 * The user's collection of saved words. Saving a word also creates its
 * review card (#1) and records a learning event (FR-009).
 */
export function useSavedWords() {
  const { savedWords } = useRepositories();
  const learning = useLearning();
  const { ensureCards, removeCard, record, loading: learningLoading } = learning;
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setWords(await savedWords.list());
      setError(null);
    } catch {
      setError('Could not load your saved words.');
    } finally {
      setLoading(false);
    }
  }, [savedWords]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Words saved before spaced repetition existed get their review card once.
  const termsKey = words.map((w) => w.word).join('|');
  useEffect(() => {
    if (!loading && !learningLoading && termsKey) ensureCards(termsKey.split('|'));
  }, [loading, learningLoading, termsKey, ensureCards]);

  const mutate = useCallback(
    async (operation) => {
      let failure = null;
      try {
        await operation();
      } catch {
        failure = 'Could not update your saved words.';
      }
      await refresh();
      // Set after refresh, which clears the error when the list loads.
      if (failure) setError(failure);
      return !failure;
    },
    [refresh],
  );

  const isSaved = useCallback(
    (term) => words.some((w) => normalizeTerm(w.word) === normalizeTerm(term)),
    [words],
  );

  const save = useCallback(
    async (word) => {
      const isNew = !isSaved(word.word);
      const ok = await mutate(() => savedWords.save(word));
      if (ok && isNew) {
        await ensureCards([word.word]);
        await record({ idea: Idea.COLLECTION, type: EventType.WORD_SAVED, term: word.word });
      }
    },
    [isSaved, mutate, savedWords, ensureCards, record],
  );

  const remove = useCallback(
    async (term) => {
      const ok = await mutate(() => savedWords.remove(term));
      if (ok) await removeCard(term);
    },
    [mutate, savedWords, removeCard],
  );

  return { words, loading, error, save, remove, isSaved };
}
