/**
 * Decorator (#12, P13): keeps only the pictures that the judge (local AI)
 * says show the meaning of the word. Pictures it could not judge go last;
 * pictures it rejects are dropped. Without a definition, or when the judge is
 * not available on this device, images pass through unchanged.
 *
 * Pictures are judged one at a time as the sources answer, so the first good
 * one is shown (through `onPartial`) without waiting for the rest.
 *
 * @param {import('../contracts').ImageRepository} images
 * @param {import('../contracts').ImageJudgeRepository} judge
 * @param {{ maxJudged?: number }} [options]  Limits the work per word.
 * @returns {import('../contracts').ImageRepository}
 */
export function withImageRelevance(images, judge, { maxJudged = 6 } = {}) {
  return {
    async findImages(term, { definition, onPartial, ...options } = {}) {
      if (!definition || (await judge.availability()) !== 'available') {
        return images.findImages(term, { onPartial, ...options });
      }

      const accepted = [];
      const unknown = [];
      const seen = new Set();
      let chain = Promise.resolve();
      const current = () => [...accepted, ...unknown];

      const consider = (list) => {
        for (const image of list) {
          if (seen.has(image.url) || seen.size >= maxJudged) continue;
          seen.add(image.url);
          chain = chain.then(async () => {
            const verdict = await judge.judge(image, { term, definition, signal: options.signal });
            if (verdict === 'match') accepted.push({ ...image, checked: true });
            else if (verdict === 'unknown') unknown.push(image);
            if (verdict === 'match') onPartial?.(current());
          });
        }
      };

      consider(await images.findImages(term, { ...options, onPartial: consider }));
      await chain;
      return current();
    },
  };
}
