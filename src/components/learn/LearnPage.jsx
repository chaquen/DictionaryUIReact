import { useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import { Link } from 'react-router-dom';
import { isVerbDefinition } from '../../domain/inflect';
import { Idea } from '../../domain/learningEvent';
import { LookupStatus } from '../../domain/word';
import { useLearningPath } from '../../context/LearningPathContext';
import { useWordLookup } from '../../hooks/useWordLookup';
import { usePrefetchImages } from '../../hooks/useWordImages';
import { Bi, BiLabel, HelpLine } from '../../i18n/Help';
import SpanishHelp from '../common/SpanishHelp';
import WordImage from '../common/WordImage';
import PronounceButton from '../PronounceButton';
import WordDetails from '../WordDetails';
import CoverageMeter from './CoverageMeter';
import PlacementTest from './PlacementTest';

/** Word built from the vocabulary list when the dictionary does not have it. */
const wordFromEntry = (entry) => ({
  word: entry.term,
  phonetic: null,
  audioUrl: null,
  meanings: [{ partOfSpeech: '', definitions: [{ text: entry.definition, example: null }], synonyms: [], antonyms: [] }],
  sourceUrls: [],
});

/** First dictionary example, preferring one that contains the word itself. */
function exampleOf(word, term) {
  const examples = (word?.meanings ?? []).flatMap((m) => m.definitions.map((d) => d.example)).filter(Boolean);
  return examples.find((e) => e.toLowerCase().includes(term.toLowerCase())) ?? examples[0] ?? null;
}

/** The example with the word highlighted. */
function Highlighted({ text, term }) {
  const at = text.toLowerCase().indexOf(term.toLowerCase());
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <mark className="px-0 rounded-1">{text.slice(at, at + term.length)}</mark>
      {text.slice(at + term.length)}
    </>
  );
}

/** Example of use with the word highlighted. */
function ExampleBox({ example, term }) {
  return (
    <figure className="word-example mb-2" data-testid="word-example">
      <figcaption className="small text-muted">
        <BiLabel id="learn.example">Example</BiLabel>
      </figcaption>
      <blockquote className="mb-1">
        “<Highlighted text={example} term={term} />”
      </blockquote>
      <SpanishHelp text={example} term={term} />
    </figure>
  );
}

function NewWordCard({ entry, upcoming = [], onLearn, onKnow }) {
  usePrefetchImages(
    upcoming.map((e) => ({
      term: e.term,
      partOfSpeech: isVerbDefinition(e.definition) ? 'verb' : undefined,
      definition: e.definition || undefined,
    })),
  );
  const { search, result } = useWordLookup();
  const [busy, setBusy] = useState(false);
  const found = result?.status === LookupStatus.FOUND && result.word.word === entry.term ? result.word : null;
  const example = exampleOf(found, entry.term);

  useEffect(() => {
    search(entry.term);
  }, [entry.term, search]);

  async function act(action) {
    setBusy(true);
    await action();
    setBusy(false);
  }

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
          <h2 className="h3 mb-1">
            <PronounceButton text={entry.term} audioUrl={found?.audioUrl ?? null} size={24} />
            {entry.term}
          </h2>
          <Badge bg="light" text="dark" className="border" title="Frequency rank in everyday English">
            <BiLabel id="learn.rank" vars={{ rank: entry.rank }}>
              #{entry.rank} most common
            </BiLabel>
          </Badge>
        </div>
        {found?.phonetic && <p className="text-muted ms-4 mb-2">{found.phonetic}</p>}
        <div className="d-flex flex-column flex-sm-row align-items-start gap-3 mt-2 mb-2">
          <WordImage
            term={entry.term}
            source="learn"
            partOfSpeech={isVerbDefinition(entry.definition) ? 'verb' : undefined}
            definition={entry.definition || undefined}
          />
          <div className="flex-grow-1">
            <p className="lead mb-1">
              {entry.definition || (
                <>
                  No simple definition available.
                  <HelpLine id="learn.noDefinition" />
                </>
              )}
            </p>
            <SpanishHelp text={entry.definition ? `${entry.term}: ${entry.definition}` : entry.term} term={entry.term} />
            {example && <ExampleBox example={example} term={entry.term} />}
          </div>
        </div>
        {found && (
          <details className="mb-3">
            <summary>
              <BiLabel id="learn.moreMeanings">More meanings and examples</BiLabel>
            </summary>
            <WordDetails word={found} showHeader={false} />
          </details>
        )}
        <div className="d-flex flex-wrap gap-2 mt-2">
          <Button disabled={busy} onClick={() => act(() => onLearn(found ?? wordFromEntry(entry)))}>
            <BiLabel id="learn.learnIt">Learn it</BiLabel>
          </Button>
          <Button variant="outline-secondary" disabled={busy} onClick={() => act(onKnow)}>
            <BiLabel id="learn.knowIt">I know it</BiLabel>
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

/** Essential vocabulary path (#19): no need to know which words to search. */
export default function LearnPage({ savedWords }) {
  const path = useLearningPath();
  const { loadList } = path;

  useEffect(() => {
    loadList();
  }, [loadList]);

  if (path.error) {
    return (
      <Alert variant="danger">
        {path.error}
        <HelpLine id="learn.loadError" />
      </Alert>
    );
  }
  if (!path.ready) return <Spinner animation="border" role="status" aria-label="Loading vocabulary" />;

  const savedTerms = savedWords.words.map((w) => w.word);
  const [entry, ...upcoming] = path.remainingToday > 0 ? path.nextWords(savedTerms, 3) : [];

  async function learn(word) {
    const ok = await savedWords.save(word, { idea: Idea.LEARN, meta: { source: 'learn', rank: entry.rank } });
    if (ok) await path.recordLearned(entry.term);
  }

  return (
    <section aria-label="Learn">
      <Bi id="learn.title" as="h1" className="h3 mb-0" helpClassName="mb-3">
        Learn new words
      </Bi>

      {!path.state.placement ? (
        <PlacementTest list={path.list} onDone={(startRank, known) => path.completePlacement(startRank, known)} />
      ) : (
        <>
          <CoverageMeter />
          <Bi
            id="learn.today"
            vars={{ n: path.learnedToday, quota: path.quota }}
            className="text-muted mb-0"
            helpClassName="mb-3"
          >
            Today: {path.learnedToday} new {path.learnedToday === 1 ? 'word' : 'words'} (daily goal: {path.quota}). Words
            you learn go to your{' '}
            <Link to="/review">reviews</Link>.
          </Bi>
          {entry ? (
            <NewWordCard key={entry.term} entry={entry} upcoming={upcoming} onLearn={learn} onKnow={() => path.markKnown(entry)} />
          ) : path.remainingToday === 0 ? (
            <Alert variant="success">
              <Bi id="learn.doneToday" className="mb-0">
                Done for today! Come back tomorrow for more words, or keep going now.
              </Bi>
              <Button variant="success" onClick={() => path.addExtraToday(5)}>
                <BiLabel id="learn.moreButton">Learn 5 more</BiLabel>
              </Button>
            </Alert>
          ) : (
            <Alert variant="success">
              You have gone through the whole list. Impressive!
              <HelpLine id="learn.listDone" />
            </Alert>
          )}
        </>
      )}

      <p className="small text-muted mt-4 mb-0">
        Word list: <a href={path.source.url}>{path.source.name}</a> by {path.source.authors}, licensed{' '}
        <a href="https://creativecommons.org/licenses/by-sa/4.0/">{path.source.license}</a>. Pictograms: Sergio Palao,{' '}
        <a href="https://arasaac.org">ARASAAC</a> (Government of Aragon),{' '}
        <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA</a>.
      </p>
    </section>
  );
}
