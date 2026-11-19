import { useCallback, useEffect, useRef, useState } from 'react';
import { EventType, Idea } from '../domain/learningEvent';
import { useLearning } from '../context/LearningContext';
import { useRepositories } from '../context/RepositoryContext';

/**
 * Images of a word (#12): loads them once per term, records when one is shown
 * and when the user asks for another one (the success signal of FR-006).
 *
 * @param {string} term
 * @param {{ source?: string, partOfSpeech?: 'verb', definition?: string }} [options]  `source`: where the image is shown (stored in the
 *   events); `partOfSpeech`: 'verb' to look for pictures of the action; `definition`: lets the local AI keep
 *   only pictures of that meaning.
 * @returns {{ image: import('../repositories/contracts').WordImage | null, count: number, loading: boolean, next: () => void, broken: (url: string) => void }}
 */
export function useWordImages(term, { source = 'details', partOfSpeech, definition } = {}) {
  const { images: repository } = useRepositories();
  const learning = useLearning();
  const enabled = learning.isEnabled('images') && Boolean(repository);
  const { record } = learning;
  const [state, setState] = useState({ term: null, images: [], index: 0 });
  const recorded = useRef(null);
  const [failed, setFailed] = useState(() => new Set());
  const broken = useCallback((url) => setFailed((f) => new Set(f).add(url)), []);

  useEffect(() => {
    if (!enabled || !term) return undefined;
    const controller = new AbortController();
    repository
      .findImages(term, {
        signal: controller.signal,
        partOfSpeech,
        definition,
        // Show the first images as soon as one source answers; keep the current one when more arrive.
        onPartial: (images) =>
          !controller.signal.aborted &&
          setState((s) => ({ term, images, index: s.term === term ? s.index : 0, done: false })),
      })
      .then((images) => setState((s) => ({ term, images, index: s.term === term ? s.index : 0, done: true })))
      .catch(() => {});
    return () => controller.abort();
  }, [enabled, repository, term, partOfSpeech, definition]);

  // Pictures whose file did not load (e.g. a thumbnail service that failed) are skipped.
  const images = enabled && state.term === term ? state.images.filter((i) => !failed.has(i.url)) : [];
  const image = images[state.index % Math.max(images.length, 1)] ?? null;
  const loading = enabled && Boolean(term) && !(state.term === term && state.done);

  useEffect(() => {
    if (!image || recorded.current === term) return;
    recorded.current = term;
    record({ idea: Idea.IMAGES, type: EventType.IMAGE_SHOWN, term, meta: { source, from: image.source, checked: Boolean(image.checked) } });
  }, [image, term, source, record]);

  const next = useCallback(() => {
    setState((s) => ({ ...s, index: (s.index + 1) % s.images.length }));
    record({ idea: Idea.IMAGES, type: EventType.IMAGE_REJECTED, term, meta: { source, action: 'another' } });
  }, [record, term, source]);

  return { image, count: images.length, loading, next, broken };
}

/**
 * Asks for the images of the next words in the background, so slow sources
 * (Openverse can take ~10 s on a new search) are ready when the word appears.
 *
 * @param {{ term: string, partOfSpeech?: 'verb', definition?: string }[]} upcoming
 */
export function usePrefetchImages(upcoming) {
  const { images: repository } = useRepositories();
  const learning = useLearning();
  const enabled = learning.isEnabled('images') && Boolean(repository);
  const key = JSON.stringify(upcoming);

  useEffect(() => {
    if (!enabled || !key) return;
    // Not cancelled on purpose: the next card asks for the same word and finds it in the sources' cache.
    JSON.parse(key).forEach(({ term, partOfSpeech, definition }) => {
      repository.findImages(term, { partOfSpeech, definition }).catch(() => {});
    });
  }, [enabled, repository, key]);
}
