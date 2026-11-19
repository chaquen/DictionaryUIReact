import { describe, expect, it } from 'vitest';
import { createRepositories } from './index';

describe('createRepositories (composition root)', () => {
  it('composes every repository the app uses', () => {
    const repositories = createRepositories();
    expect(Object.keys(repositories).sort()).toEqual(
      ['images', 'learningEvents', 'learningPath', 'preferences', 'review', 'savedWords', 'translation', 'vocabulary', 'wordLookup'].sort(),
    );
    expect(typeof repositories.images.findImages).toBe('function');
  });
});
