import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';
import { RepositoryProvider } from './context/RepositoryContext';
import { buildWord, createFakeSavedWords, createFakeWordLookup } from './test/fakes';

function renderApp({ saved = [], dictionary } = {}) {
  const repositories = {
    wordLookup: createFakeWordLookup(dictionary),
    savedWords: createFakeSavedWords(saved),
  };
  render(
    <RepositoryProvider repositories={repositories}>
      <App />
    </RepositoryProvider>,
  );
  return repositories;
}

describe('App', () => {
  it('shows an empty state that leads to the search', async () => {
    const user = userEvent.setup();
    renderApp();

    expect(await screen.findByText(/haven't saved any words yet/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /search your first word/i }));

    expect(screen.getByRole('searchbox', { name: /word to search/i })).toBeInTheDocument();
  });

  it('lists saved words on load', async () => {
    renderApp({ saved: [buildWord({ word: 'bank' })] });

    expect(await screen.findByText('bank')).toBeInTheDocument();
    expect(screen.getByText(/\+1 more definition\b/)).toBeInTheDocument();
  });

  it('searches a word, saves it and shows it in My words', async () => {
    const user = userEvent.setup();
    const { savedWords } = renderApp();

    await user.click(await screen.findByRole('button', { name: /search your first word/i }));
    await user.type(screen.getByRole('searchbox'), 'Hello{Enter}');

    expect(await screen.findByRole('heading', { name: /hello/i })).toBeInTheDocument();
    expect(screen.getByText('A greeting said when meeting someone.')).toBeInTheDocument();
    expect(screen.getByText('hi')).toBeInTheDocument();
    expect(screen.getByText('goodbye')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /save word/i }));
    expect(await screen.findByRole('button', { name: /saved/i })).toBeInTheDocument();
    expect((await savedWords.list()).map((w) => w.word)).toEqual(['hello']);

    await user.click(screen.getByRole('button', { name: /my words/i }));
    const grid = await screen.findByRole('region', { name: /my words/i });
    expect(within(grid).getByText('hello')).toBeInTheDocument();
  });

  it('tells the user when a word does not exist', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(await screen.findByRole('button', { name: /^search$/i }));
    await user.type(screen.getByRole('searchbox'), 'qwertyzx{Enter}');

    expect(await screen.findByText('No definitions found for "qwertyzx".')).toBeInTheDocument();
  });

  it('validates empty searches without calling the dictionary', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(await screen.findByRole('button', { name: /search your first word/i }));
    await user.click(within(screen.getByRole('search')).getByRole('button', { name: /search/i }));

    expect(screen.getByText('Write a word to search.')).toBeInTheDocument();
  });

  it('tells the user when a word cannot be saved', async () => {
    const user = userEvent.setup();
    const { savedWords } = renderApp();
    savedWords.save = async () => {
      throw new Error('QuotaExceededError');
    };

    await user.click(await screen.findByRole('button', { name: /search your first word/i }));
    await user.type(screen.getByRole('searchbox'), 'hello{Enter}');
    await user.click(await screen.findByRole('button', { name: /save word/i }));

    expect(await screen.findByText('Could not update your saved words.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save word/i })).toBeInTheDocument();
  });

  it('removes a saved word', async () => {
    const user = userEvent.setup();
    renderApp({ saved: [buildWord({ word: 'bank' })] });

    await user.click(await screen.findByRole('button', { name: 'Remove "bank"' }));

    expect(await screen.findByText(/haven't saved any words yet/i)).toBeInTheDocument();
  });
});
