import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import { Trash } from 'react-bootstrap-icons';
import { countDefinitions, firstDefinition } from '../domain/word';
import PronounceButton from './PronounceButton';
import WordDetailsModal from './WordDetailsModal';

export default function SavedWordsGrid({ savedWords, onGoToSearch }) {
  const [selected, setSelected] = useState(null);
  const { words, loading, error, remove } = savedWords;

  if (loading) {
    return <Spinner animation="border" role="status" aria-label="Loading saved words" />;
  }

  return (
    <section aria-label="My words">
      {error && <Alert variant="danger">{error}</Alert>}

      {words.length === 0 ? (
        <Alert variant="info" className="text-center">
          <p className="mb-2">You haven&apos;t saved any words yet.</p>
          <Button onClick={onGoToSearch}>Search your first word</Button>
        </Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-3">
          {words.map((word) => {
            const more = countDefinitions(word) - 1;
            return (
              <Col key={word.word}>
                <Card className="h-100 shadow-sm">
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="text-capitalize">
                      <PronounceButton text={word.word} audioUrl={word.audioUrl} />
                      {word.word}
                    </Card.Title>
                    {word.phonetic && (
                      <Card.Subtitle className="mb-2 text-muted">{word.phonetic}</Card.Subtitle>
                    )}
                    <Card.Text className="flex-grow-1">
                      {firstDefinition(word) ?? 'No definitions available.'}
                      {more > 0 && (
                        <span className="text-muted">
                          {' '}
                          (+{more} more {more === 1 ? 'definition' : 'definitions'})
                        </span>
                      )}
                    </Card.Text>
                    <div className="d-flex gap-2">
                      <Button variant="primary" onClick={() => setSelected(word)}>
                        Details
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={() => remove(word.word)}
                        aria-label={`Remove "${word.word}"`}
                      >
                        <Trash aria-hidden="true" />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <WordDetailsModal word={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
