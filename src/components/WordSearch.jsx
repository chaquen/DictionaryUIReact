import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Spinner from 'react-bootstrap/Spinner';
import { Search } from 'react-bootstrap-icons';
import { LookupStatus } from '../domain/word';
import { useWordLookup } from '../hooks/useWordLookup';
import { BiLabel, HelpLine } from '../i18n/Help';
import SaveWordButton from './SaveWordButton';
import WordDetails from './WordDetails';

export default function WordSearch({ savedWords }) {
  const [term, setTerm] = useState('');
  const [validation, setValidation] = useState(null);
  const { search, loading, result } = useWordLookup();

  function handleSubmit(event) {
    event.preventDefault();
    if (!term.trim()) {
      setValidation('Write a word to search.');
      return;
    }
    setValidation(null);
    search(term);
  }

  return (
    <section aria-label="Search words">
      <Form role="search" onSubmit={handleSubmit} noValidate className="mb-4">
        <InputGroup hasValidation>
          <Form.Control
            type="search"
            placeholder="Write an English word, e.g. serendipity"
            aria-label="Word to search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            isInvalid={Boolean(validation)}
            autoFocus
          />
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Spinner size="sm" animation="border" role="status" aria-label="Searching" />
            ) : (
              <>
                <Search className="me-1" aria-hidden="true" /> <BiLabel id="search.button">Search</BiLabel>
              </>
            )}
          </Button>
          <Form.Control.Feedback type="invalid">
            {validation}
            <HelpLine id="search.empty" />
          </Form.Control.Feedback>
        </InputGroup>
        <HelpLine id="search.hint" className="mt-1" />
      </Form>

      {savedWords.error && (
        <Alert variant="danger">
          {savedWords.error}
          <HelpLine id="search.saveError" />
        </Alert>
      )}
      {result?.status === LookupStatus.NOT_FOUND && (
        <Alert variant="warning">
          {result.message}
          <HelpLine id="search.notFound" />
        </Alert>
      )}
      {result?.status === LookupStatus.ERROR && (
        <Alert variant="danger">
          {result.message}
          <HelpLine id="search.error" />
        </Alert>
      )}
      {result?.status === LookupStatus.FOUND && (
        <WordDetails
          word={result.word}
          actions={
            <SaveWordButton
              saved={savedWords.isSaved(result.word.word)}
              onSave={() => savedWords.save(result.word, { meta: { source: 'search' } })}
              onRemove={() => savedWords.remove(result.word.word)}
            />
          }
        />
      )}
    </section>
  );
}
