import { useCallback, useEffect, useRef, useState } from 'react';
import { useRepositories } from '../context/RepositoryContext';

/**
 * Searches words through the configured `WordLookupRepository`.
 * A new search cancels the previous one, so results never arrive out of order.
 */
export function useWordLookup() {
  const { wordLookup } = useRepositories();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const controllerRef = useRef(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const search = useCallback(
    async (term) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setLoading(true);
      try {
        const outcome = await wordLookup.findByTerm(term, { signal: controller.signal });
        if (!controller.signal.aborted) setResult(outcome);
      } catch (error) {
        if (error?.name !== 'AbortError') {
          setResult({ status: 'error', message: 'Unexpected error while searching.' });
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [wordLookup],
  );

  return { search, loading, result };
}
