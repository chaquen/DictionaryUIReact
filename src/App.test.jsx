import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import AppProviders from './context/AppProviders';
import { EventType, Idea, createEvent } from './domain/learningEvent';
import { createReviewCard } from './domain/scheduling';
import { createLocalStorageLearningEventRepository } from './repositories/learningEvents/LocalStorageLearningEventRepository';
import { createLocalStoragePreferencesRepository } from './repositories/preferences/LocalStoragePreferencesRepository';
import { createLocalStorageReviewRepository } from './repositories/review/LocalStorageReviewRepository';
import { createMemoryStorage } from './repositories/shared/jsonStore';
import { buildWord, createFakeSavedWords, createFakeWordLookup } from './test/fakes';

const NOW = new Date('2026-11-19T10:00:00');

function renderApp({ saved = [], dictionary, route = '/', cards = [], events = [], clock = () => NOW } = {}) {
  const storage = createMemoryStorage();
  const repositories = {
    wordLookup: createFakeWordLookup(dictionary),
    savedWords: createFakeSavedWords(saved),
    learningEvents: createLocalStorageLearningEventRepository({ storage }),
    preferences: createLocalStoragePreferencesRepository({ storage }),
    review: createLocalStorageReviewRepository({ storage }),
  };
  repositories.review.saveAll(cards);
  events.forEach((e) => repositories.learningEvents.append(e));
  render(
    <AppProviders repositories={repositories} clock={clock}>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </AppProviders>,
  );
  return repositories;
}

describe('App — search and collection', () => {
  it('shows an empty home that leads to the search', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(await screen.findByRole('button', { name: /search your first word/i }));

    expect(screen.getByRole('searchbox', { name: /word to search/i })).toBeInTheDocument();
  });

  it('lists saved words', async () => {
    renderApp({ saved: [buildWord({ word: 'bank' })], route: '/words' });

    expect(await screen.findByText('bank')).toBeInTheDocument();
    expect(screen.getByText(/\+1 more definition\b/)).toBeInTheDocument();
  });

  it('searches a word, saves it and shows it in My words', async () => {
    const user = userEvent.setup();
    const { savedWords, review, learningEvents } = renderApp({ route: '/search' });

    await user.type(await screen.findByRole('searchbox'), 'Hello{Enter}');

    expect(await screen.findByRole('heading', { name: /hello/i })).toBeInTheDocument();
    expect(screen.getByText('A greeting said when meeting someone.')).toBeInTheDocument();
    expect(screen.getByText('hi')).toBeInTheDocument();
    expect(screen.getByText('goodbye')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /save word/i }));
    expect(await screen.findByRole('button', { name: /saved/i })).toBeInTheDocument();
    expect((await savedWords.list()).map((w) => w.word)).toEqual(['hello']);
    expect((await review.list()).map((c) => [c.term, c.strategy])).toEqual([['hello', 'fsrs6']]);
    expect((await learningEvents.list()).map((e) => e.type)).toEqual([EventType.WORD_SAVED]);

    await user.click(screen.getByRole('link', { name: /my words/i }));
    const grid = await screen.findByRole('region', { name: /my words/i });
    expect(within(grid).getByText('hello')).toBeInTheDocument();
  });

  it('tells the user when a word does not exist', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(await screen.findByRole('link', { name: /^search$/i }));
    await user.type(screen.getByRole('searchbox'), 'qwertyzx{Enter}');

    expect(await screen.findByText('No definitions found for "qwertyzx".')).toBeInTheDocument();
  });

  it('validates empty searches without calling the dictionary', async () => {
    const user = userEvent.setup();
    renderApp({ route: '/search' });

    await user.click(within(await screen.findByRole('search')).getByRole('button', { name: /search/i }));

    expect(screen.getByText('Write a word to search.')).toBeInTheDocument();
  });

  it('tells the user when a word cannot be saved', async () => {
    const user = userEvent.setup();
    const { savedWords } = renderApp({ route: '/search' });
    savedWords.save = async () => {
      throw new Error('QuotaExceededError');
    };

    await user.type(await screen.findByRole('searchbox'), 'hello{Enter}');
    await user.click(await screen.findByRole('button', { name: /save word/i }));

    expect(await screen.findByText('Could not update your saved words.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save word/i })).toBeInTheDocument();
  });

  it('removes a saved word and its review card', async () => {
    const user = userEvent.setup();
    const { review } = renderApp({ saved: [buildWord({ word: 'bank' })], route: '/words' });

    await user.click(await screen.findByRole('button', { name: 'Remove "bank"' }));

    expect(await screen.findByText(/haven't saved any words yet/i)).toBeInTheDocument();
    expect(await review.list()).toEqual([]);
  });
});

describe('App — spaced repetition (#1)', () => {
  it('creates review cards for words saved before and reviews them', async () => {
    const user = userEvent.setup();
    const { review, learningEvents } = renderApp({ saved: [buildWord({ word: 'bank' })], route: '/review' });

    expect(await screen.findByRole('heading', { name: /bank/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /show answer/i }));
    expect(screen.getAllByText('A greeting said when meeting someone.').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Good' }));

    expect(await screen.findByText(/all caught up/i)).toBeInTheDocument();
    expect(screen.getByText(/you reviewed 1 word and remembered 1/i)).toBeInTheDocument();
    expect(screen.getByText(/next review:/i)).toBeInTheDocument();

    const [card] = await review.list();
    expect(card.reviews).toBe(1);
    const [event] = await learningEvents.list();
    expect(event).toMatchObject({ idea: Idea.REVIEW, type: EventType.WORD_REVIEWED, term: 'bank', correct: true });
    expect(event.meta).toMatchObject({ grade: 3, strategy: 'fsrs6', predictedRecall: null });
  });

  it('shows how many words are due on the home screen and in the navigation', async () => {
    renderApp({ saved: [buildWord({ word: 'bank' }), buildWord({ word: 'run' })] });

    expect(await screen.findByText(/you have/i)).toHaveTextContent('You have 2 words to review today.');
    expect(screen.getByRole('link', { name: /review/i })).toHaveTextContent('2');
  });

  it('says when nothing is due', async () => {
    const later = new Date(NOW.getTime() + 3 * 86_400_000).toISOString();
    renderApp({
      saved: [buildWord({ word: 'bank' })],
      cards: [{ ...createReviewCard('bank', 'leitner', NOW), due: later }],
      route: '/review',
    });

    expect(await screen.findByText(/all caught up/i)).toBeInTheDocument();
  });
});

describe('App — game mechanics (#18)', () => {
  it('shows XP, level, streak and achievements derived from events', async () => {
    const yesterday = new Date(NOW.getTime() - 86_400_000);
    renderApp({
      saved: [buildWord({ word: 'bank' })],
      events: [
        createEvent({ idea: Idea.COLLECTION, type: EventType.WORD_SAVED, term: 'bank' }, yesterday),
        createEvent({ idea: Idea.REVIEW, type: EventType.WORD_REVIEWED, term: 'bank', correct: true }, NOW),
      ],
    });

    expect(await screen.findByTestId('xp')).toHaveTextContent('20');
    expect(screen.getByTestId('streak')).toHaveTextContent('2');
    expect(screen.getByText('First word')).toHaveTextContent('(unlocked)');
    expect(screen.getByText('Word collector')).toHaveTextContent('(locked)');
  });

  it('warns when the streak was lost', async () => {
    const lastWeek = new Date(NOW.getTime() - 7 * 86_400_000);
    renderApp({ events: [createEvent({ idea: Idea.COLLECTION, type: EventType.WORD_SAVED, term: 'x' }, lastWeek)] });

    expect(await screen.findByText(/your streak ended/i)).toBeInTheDocument();
    expect(screen.getByTestId('streak')).toHaveTextContent('0');
  });
});

describe('App — Lab (FR-009, FR-010)', () => {
  it('turns ideas off and hides them', async () => {
    const user = userEvent.setup();
    const { preferences } = renderApp({ saved: [buildWord({ word: 'bank' })], route: '/lab' });

    await user.click(await screen.findByRole('switch', { name: /spaced repetition/i }));
    await user.click(screen.getByRole('switch', { name: /game mechanics/i }));

    expect((await preferences.get()).flags).toEqual({ review: false, gamification: false });
    expect(screen.queryByRole('link', { name: /^review/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /home/i }));
    expect(screen.queryByTestId('xp')).not.toBeInTheDocument();
    expect(screen.queryByText(/to review today/i)).not.toBeInTheDocument();
  });

  it('switches the algorithm for new words', async () => {
    const user = userEvent.setup();
    const { preferences, review } = renderApp({ route: '/lab' });

    await user.click(await screen.findByRole('radio', { name: /leitner/i }));
    expect((await preferences.get()).schedulingStrategy).toBe('leitner');

    await user.click(screen.getByRole('link', { name: /^search$/i }));
    await user.type(screen.getByRole('searchbox'), 'hello{Enter}');
    await user.click(await screen.findByRole('button', { name: /save word/i }));
    await screen.findByRole('button', { name: /saved/i });

    expect((await review.list())[0].strategy).toBe('leitner');
  });

  it('shows usage by idea and exports the events', async () => {
    const user = userEvent.setup();
    URL.createObjectURL = vi.fn(() => 'blob:events');
    URL.revokeObjectURL = vi.fn();
    renderApp({
      route: '/lab',
      events: [
        createEvent({ idea: Idea.REVIEW, type: EventType.WORD_REVIEWED, term: 'a', correct: true, meta: { elapsedDays: 8 } }, NOW),
      ],
    });

    const usage = (await screen.findByText('Usage by idea')).closest('.card');
    expect(within(usage).getByRole('cell', { name: 'review' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /export data/i }));
    expect(await screen.findByText('Exported 1 events.')).toBeInTheDocument();
    expect(URL.createObjectURL).toHaveBeenCalled();
  });
});
