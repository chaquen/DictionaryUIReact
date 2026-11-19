/** Interleaves lists (first of each, then the second of each…) without duplicate URLs. */
function interleave(lists) {
  const merged = [];
  const seen = new Set();
  for (let i = 0; i < Math.max(0, ...lists.map((l) => l.length)); i += 1) {
    for (const list of lists) {
      const image = list[i];
      if (image && !seen.has(image.url)) {
        seen.add(image.url);
        merged.push(image);
      }
    }
  }
  return merged;
}

/**
 * Composite `ImageRepository` (#12): asks every source in parallel and
 * interleaves their results in order of preference, so "Another image" moves
 * between sources. A source that fails or takes longer than `timeoutMs`
 * contributes nothing. `onPartial` receives the merged list each time a
 * source answers, so fast sources are shown without waiting for slow ones.
 *
 * `verbOrder` changes the preference for verbs (`partOfSpeech: 'verb'`): the
 * sources are then shown one after the other (not interleaved), so all the
 * pictures of the action come before those of the noun.
 *
 * @param {import('../contracts').ImageRepository[]} repositories  In order of preference.
 * @param {{ timeoutMs?: number, verbOrder?: number[] }} [options]  `verbOrder`: indexes of `repositories`.
 * @returns {import('../contracts').ImageRepository}
 */
export function combineImageRepositories(repositories, { timeoutMs = 15000, verbOrder = null } = {}) {
  const withinTime = (promise) =>
    Promise.race([promise, new Promise((resolve) => setTimeout(() => resolve([]), timeoutMs))]);

  return {
    async findImages(term, { onPartial, ...options } = {}) {
      const byVerb = options.partOfSpeech === 'verb' && Boolean(verbOrder);
      const ordered = byVerb ? verbOrder.map((i) => repositories[i]) : repositories;
      const merge = (lists) => (byVerb ? interleave([lists.flat()]) : interleave(lists));
      const lists = ordered.map(() => []);
      await Promise.all(
        ordered.map((repository, index) =>
          withinTime(
            repository.findImages(term, options).catch((error) => {
              if (error?.name === 'AbortError') throw error;
              return [];
            }),
          ).then((images) => {
            lists[index] = images;
            if (images.length) onPartial?.(merge(lists));
          }),
        ),
      );
      return merge(lists);
    },
  };
}
