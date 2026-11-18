import { useCallback, useEffect, useState } from 'react';
import { normalizeTerm } from '../domain/word';
import { useRepositories } from '../context/RepositoryContext';

/** The user's collection of saved words. */
export function useSavedWords() {
  const { savedWords } = useRepositories();
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
    },
    [refresh],
  );

  const save = useCallback((word) => mutate(() => savedWords.save(word)), [mutate, savedWords]);
  const remove = useCallback((term) => mutate(() => savedWords.remove(term)), [mutate, savedWords]);
  const isSaved = useCallback(
    (term) => words.some((w) => normalizeTerm(w.word) === normalizeTerm(term)),
    [words],
  );

  return { words, loading, error, save, remove, isSaved };
}
