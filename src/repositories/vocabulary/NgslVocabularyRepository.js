/**
 * `VocabularyListRepository` adapter for the NGSL 1.2 (CC BY-SA 4.0, see
 * src/data/ngsl/ATTRIBUTION.md). The list is loaded on demand so it does not
 * weigh on the initial page load.
 *
 * @param {{ load?: () => Promise<{ default: { columns: string[], words: Array<[string, number, number, string]> } }> }} [options]
 * @returns {import('../contracts').VocabularyListRepository}
 */
export function createNgslVocabularyRepository({ load = () => import('../../data/ngsl/ngsl-1.2.json') } = {}) {
  let cache = null;

  return {
    source: {
      name: 'New General Service List 1.2',
      authors: 'Browne, Culligan & Phillips',
      license: 'CC BY-SA 4.0',
      url: 'https://www.newgeneralservicelist.com',
    },
    async list() {
      cache ??= load().then((module) =>
        (module.default ?? module).words
          .map(([term, rank, perMillion, definition]) => ({ term, rank, perMillion, definition }))
          .sort((a, b) => a.rank - b.rank),
      );
      return cache;
    },
  };
}
