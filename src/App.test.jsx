import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import AppProviders from './context/AppProviders';
import { EventType, Idea, createEvent } from './domain/learningEvent';
import { createReviewCard } from './domain/scheduling';
import { nextNewWords } from './domain/learningPath';
import { createLocalStorageLearningEventRepository } from './repositories/learningEvents/LocalStorageLearningEventRepository';
import { createLocalStoragePreferencesRepository } from './repositories/preferences/LocalStoragePreferencesRepository';
import { createLocalStorageReviewRepository } from './repositories/review/LocalStorageReviewRepository';
import { createLocalStorageLearningPathRepository } from './repositories/learningPath/LocalStorageLearningPathRepository';
import { createNgslVocabularyRepository } from './repositories/vocabulary/NgslVocabularyRepository';
import { createMemoryStorage } from './repositories/shared/jsonStore';
import { buildWord, createFakeSavedWords, createFakeWordLookup } from './test/fakes';

const NOW = new Date('2026-11-19T10:00:00');

function fakeTranslation(available = true) {
  return {
    availability: async () => (available ? 'available' : 'unavailable'),
    translate: async (text) =>
      available ? { status: 'ok', text: `ES: ${text}` } : { status: 'error', code: 'unavailable', message: 'Translation is not available in this browser.' },
  };
}

function renderApp({
  saved = [],
  dictionary,
  route = '/',
  cards = [],
  events = [],
  path = null,
  translationAvailable = true,
  images = {},
  clock = () => NOW,
} = {}) {
  const storage = createMemoryStorage();
  const repositories = {
    vocabulary: createNgslVocabularyRepository(),
    learningPath: createLocalStorageLearningPathRepository({ storage }),
    translation: fakeTranslation(translationAvailable),
    images: { findImages: async (term) => images[term] ?? [] },
    wordLookup: createFakeWordLookup(dictionary),
    savedWords: createFakeSavedWords(saved),
    learningEvents: createLocalStorageLearningEventRepository({ storage }),
    preferences: createLocalStoragePreferencesRepository({ storage }),
    review: createLocalStorageReviewRepository({ storage }),
  };
  repositories.review.saveAll(cards);
  if (path) repositories.learningPath.save(path);
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
  it('shows an empty home that leads to the search when the vocabulary path is off', async () => {
    const user = userEvent.setup();
    const { preferences } = renderApp({ route: '/lab' });
    await user.click(await screen.findByRole('switch', { name: /essential vocabulary path/i }));
    expect((await preferences.get()).flags.learn).toBe(false);

    await user.click(screen.getByRole('link', { name: /home/i }));
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

  it('lets you grade a word right away, without opening the answer', async () => {
    const user = userEvent.setup();
    const { review } = renderApp({ saved: [buildWord({ word: 'bank' })], route: '/review' });

    expect(await screen.findByRole('heading', { name: /bank/i })).toBeInTheDocument();
    expect(screen.queryByTestId('review-answer')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Easy' }));

    expect(await screen.findByText(/all caught up/i)).toBeInTheDocument();
    expect((await review.list())[0].reviews).toBe(1);
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

    expect((await preferences.get()).flags).toEqual({ learn: true, review: false, gamification: false, images: true, translation: true });
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

const START_OF_PATH = { startRank: 101, completedAt: NOW.toISOString() };

describe('App — essential vocabulary path (#19)', () => {
  it('runs the placement test the first time and then proposes words', async () => {
    const user = userEvent.setup();
    const { learningPath, learningEvents } = renderApp({ route: '/learn' });

    expect(await screen.findByText(/which of these words do you know/i)).toBeInTheDocument();
    // Know nothing in the first band → the path starts at rank 101.
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect((await learningPath.get()).placement.startRank).toBe(101);
    expect(await screen.findByText('#101 most common')).toBeInTheDocument();
    expect(screen.getByTestId('coverage')).toHaveTextContent(/\d+ %/);
    expect((await learningEvents.list()).map((e) => e.type)).toEqual([EventType.PLACEMENT_COMPLETED]);
  });

  it('starts further when the user knows the first band', async () => {
    const user = userEvent.setup();
    const { learningPath } = renderApp({ route: '/learn' });

    const group = await screen.findByRole('group', { name: /words to mark as known/i });
    for (const word of within(group).getAllByRole('checkbox')) await user.click(word);
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Next' })); // knows nothing in the second band

    expect((await learningPath.get()).placement.startRank).toBe(301);
  });

  it('"Learn it" saves the word with a review card; "I know it" skips it', async () => {
    const user = userEvent.setup();
    const { savedWords, review, learningEvents, learningPath } = renderApp({ route: '/learn', path: { placement: START_OF_PATH, known: [], learnedByDay: {}, extraByDay: {} } });

    const first = await screen.findByRole('heading', { level: 2 });
    const firstTerm = first.textContent.replace(/Pronounce.*?"/, '').trim();
    await user.click(screen.getByRole('button', { name: 'Learn it' }));

    await waitForTerm(savedWords, firstTerm);
    expect((await review.list()).map((c) => c.term)).toContain(firstTerm);

    const second = (await screen.findByText(/#10[2-9] most common/)).textContent;
    await user.click(screen.getByRole('button', { name: 'I know it' }));
    expect(await screen.findByText(/#10[3-9] most common/)).not.toHaveTextContent(second);

    const events = await learningEvents.list();
    expect(events.map((e) => [e.idea, e.type])).toEqual([
      [Idea.LEARN, EventType.WORD_SAVED],
      [Idea.LEARN, EventType.WORD_MARKED_KNOWN],
    ]);
    expect(events[0].meta).toMatchObject({ source: 'learn', rank: 101 });
    expect((await learningPath.get()).known).toHaveLength(1);
  });

  it('stops at the daily goal and lets the user ask for more', async () => {
    const user = userEvent.setup();
    const today = '2026-11-19';
    const learned = Array.from({ length: 10 }, (_, i) => `w${i}`);
    renderApp({ route: '/learn', path: { placement: START_OF_PATH, known: [], learnedByDay: { [today]: learned }, extraByDay: {} } });

    expect(await screen.findByText(/done for today/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /learn 5 more/i }));
    expect(await screen.findByRole('button', { name: 'Learn it' })).toBeInTheDocument();
  });

  it('shows coverage and today\'s words on the home screen', async () => {
    renderApp({ path: { placement: START_OF_PATH, known: [], learnedByDay: {}, extraByDay: {} } });

    expect(await screen.findByTestId('coverage')).toHaveTextContent(/your words cover \d+ %/i);
    expect(screen.getByText(/10 new words waiting for you today/i)).toBeInTheDocument();
  });
});

describe('App — Spanish help (FR-016)', () => {
  it('translates on request and records it', async () => {
    const user = userEvent.setup();
    const { learningEvents } = renderApp({ route: '/learn', path: { placement: START_OF_PATH, known: [], learnedByDay: {}, extraByDay: {} } });

    await user.click(await screen.findByRole('button', { name: /show in spanish/i }));

    expect(await screen.findByText(/^ES: /)).toBeInTheDocument();
    expect((await learningEvents.list()).map((e) => e.type)).toEqual([EventType.TRANSLATION_SHOWN]);
  });

  it('warns when the browser cannot translate and keeps working', async () => {
    const user = userEvent.setup();
    renderApp({ route: '/learn', translationAvailable: false, path: { placement: START_OF_PATH, known: [], learnedByDay: {}, extraByDay: {} } });

    await user.click(await screen.findByRole('button', { name: /show in spanish/i }));

    expect(await screen.findByText(/translation is not available/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Learn it' })).toBeEnabled();
  });

  it('is hidden when turned off in the Lab', async () => {
    const user = userEvent.setup();
    renderApp({ route: '/lab', path: { placement: START_OF_PATH, known: [], learnedByDay: {}, extraByDay: {} } });

    await user.click(await screen.findByRole('switch', { name: /spanish help/i }));
    await user.click(screen.getByRole('link', { name: /learn/i }));

    expect(await screen.findByRole('button', { name: 'Learn it' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /show in spanish/i })).not.toBeInTheDocument();
  });
});

describe('App — bilingual help (FR-017)', () => {
  it('shows Spanish help under the instructions by default and only English with "No help"', async () => {
    const user = userEvent.setup();
    renderApp({ route: '/learn' });

    expect(await screen.findByRole('heading', { name: 'Which of these words do you know?' })).toBeInTheDocument();
    expect(screen.getByText('¿Cuáles de estas palabras conoces?')).toHaveAttribute('lang', 'es');
    expect(screen.getByRole('button', { name: 'Next' })).toHaveTextContent('Next · Siguiente');

    await user.click(screen.getByRole('link', { name: 'Lab' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Help language' }), 'none');
    await user.click(screen.getByRole('link', { name: 'Learn' }));

    expect(await screen.findByRole('heading', { name: 'Which of these words do you know?' })).toBeInTheDocument();
    expect(screen.queryByText('¿Cuáles de estas palabras conoces?')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toHaveTextContent(/^Next$/);
  });
});

describe('App — images (#12)', () => {
  const picture = (n) => ({
    url: `https://img.test/${n}.jpg`,
    width: 480,
    height: 320,
    title: `Picture ${n}.jpg`,
    author: `Author ${n}`,
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    pageUrl: `https://commons.wikimedia.org/wiki/File:Picture_${n}.jpg`,
  });

  it('shows a picture with its attribution on the new word and offers another one', async () => {
    const user = userEvent.setup();
    const path = { placement: START_OF_PATH, known: [], learnedByDay: {}, extraByDay: {} };
    // The first new word is the NGSL word at the start of the path.
    const list = await createNgslVocabularyRepository().list();
    const { term } = nextNewWords(list, path, [], 1)[0];

    const { learningEvents } = renderApp({ route: '/learn', path, images: { [term]: [picture(1), picture(2)] } });

    expect(await screen.findByRole('img', { name: `Picture for "${term}"` })).toHaveAttribute('src', 'https://img.test/1.jpg');
    expect(screen.getByText(/Author 1/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /another image/i }));

    expect(screen.getByRole('img', { name: `Picture for "${term}"` })).toHaveAttribute('src', 'https://img.test/2.jpg');
    expect((await learningEvents.list()).map((e) => e.type)).toEqual([EventType.IMAGE_SHOWN, EventType.IMAGE_REJECTED]);
    expect((await learningEvents.list())[1].meta.action).toBe('another');
  });

  it('shows what the pictogram means when the source explains it', async () => {
    const path = { placement: START_OF_PATH, known: [], learnedByDay: {}, extraByDay: {} };
    const list = await createNgslVocabularyRepository().list();
    const { term } = nextNewWords(list, path, [], 1)[0];
    renderApp({ route: '/learn', path, images: { [term]: [{ ...picture(1), caption: 'Remain upright on your feet.' }] } });

    expect(await screen.findByTestId('image-caption')).toHaveTextContent('Remain upright on your feet.');
  });

  it('skips a picture whose file does not load', async () => {
    const path = { placement: START_OF_PATH, known: [], learnedByDay: {}, extraByDay: {} };
    const list = await createNgslVocabularyRepository().list();
    const { term } = nextNewWords(list, path, [], 1)[0];
    renderApp({ route: '/learn', path, images: { [term]: [picture(1), picture(2)] } });

    const first = await screen.findByRole('img', { name: `Picture for "${term}"` });
    fireEvent.error(first);

    expect(screen.getByRole('img', { name: `Picture for "${term}"` })).toHaveAttribute('src', 'https://img.test/2.jpg');
  });

  it('shows no image nor example when there are none', async () => {
    renderApp({ route: '/learn', path: { placement: START_OF_PATH, known: [], learnedByDay: {}, extraByDay: {} } });
    await screen.findByRole('button', { name: 'Learn it' });
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByTestId('word-example')).not.toBeInTheDocument();
  });

  it('shows a highlighted example of use', async () => {
    const path = { placement: START_OF_PATH, known: [], learnedByDay: {}, extraByDay: {} };
    const list = await createNgslVocabularyRepository().list();
    const { term } = nextNewWords(list, path, [], 1)[0];
    const example = `They ${term} it every day.`;
    const word = buildWord({
      word: term,
      meanings: [{ partOfSpeech: 'verb', definitions: [{ text: 'A meaning.', example }], synonyms: [], antonyms: [] }],
    });

    renderApp({ route: '/learn', path, dictionary: [word] });

    const box = await screen.findByTestId('word-example');
    expect(box).toHaveTextContent(example);
    expect(within(box).getByText(term, { selector: 'mark' })).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});

async function waitForTerm(savedWords, term) {
  for (let i = 0; i < 50; i += 1) {
    if ((await savedWords.list()).some((w) => w.word === term)) return;
    await new Promise((r) => setTimeout(r, 20));
  }
  throw new Error(`"${term}" was not saved`);
}
