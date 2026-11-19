import { normalizeTerm } from '../../domain/word';
import { createJsonStore } from '../shared/jsonStore';

export const REVIEW_CARDS_STORAGE_KEY = 'dictionary-ui:review-cards:v1';

const isCard = (c) =>
  c && typeof c.term === 'string' && typeof c.strategy === 'string' && typeof c.due === 'string';

/**
 * `ReviewRepository` adapter: spaced-repetition cards in localStorage.
 *
 * @param {{ storage?: Storage, key?: string }} [options]
 * @returns {import('../contracts').ReviewRepository}
 */
export function createLocalStorageReviewRepository({
  storage = globalThis.localStorage,
  key = REVIEW_CARDS_STORAGE_KEY,
} = {}) {
  const store = createJsonStore({ storage, key, fallback: () => [], validate: Array.isArray });
  const read = () => store.read().filter(isCard);
  const same = (term) => (card) => normalizeTerm(card.term) === normalizeTerm(term);

  return {
    async list() {
      return read();
    },
    async saveAll(cards) {
      const incoming = new Map(cards.map((c) => [normalizeTerm(c.term), c]));
      const kept = read().filter((c) => !incoming.has(normalizeTerm(c.term)));
      store.write([...kept, ...incoming.values()]);
    },
    async remove(term) {
      store.write(read().filter((c) => !same(term)(c)));
    },
  };
}
