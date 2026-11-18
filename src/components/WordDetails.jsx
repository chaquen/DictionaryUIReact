import Accordion from 'react-bootstrap/Accordion';
import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';
import PronounceButton from './PronounceButton';

function TermList({ title, terms }) {
  if (terms.length === 0) return null;
  return (
    <div className="mt-3">
      <h6 className="text-uppercase text-muted small mb-2">{title}</h6>
      <div className="d-flex flex-wrap gap-2">
        {terms.map((term) => (
          <Badge key={term} bg="light" text="dark" className="border fw-normal fs-6">
            {term}
          </Badge>
        ))}
      </div>
    </div>
  );
}

/** Full view of a domain `Word`: pronunciation, meanings, examples, synonyms and antonyms. */
export default function WordDetails({ word, actions = null, showHeader = true }) {
  return (
    <article>
      {showHeader && (
        <header className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <div>
            <h2 className="h3 mb-0 text-capitalize">
              <PronounceButton text={word.word} audioUrl={word.audioUrl} size={24} />
              {word.word}
            </h2>
            {word.phonetic && <span className="text-muted ms-4">{word.phonetic}</span>}
          </div>
          {actions}
        </header>
      )}

      <Accordion defaultActiveKey="0" alwaysOpen>
        {word.meanings.map((meaning, index) => (
          <Accordion.Item eventKey={String(index)} key={`${meaning.partOfSpeech}-${index}`}>
            <Accordion.Header>
              <span className="fst-italic me-2">{meaning.partOfSpeech}</span>
              <Badge bg="secondary" pill>
                {meaning.definitions.length}
              </Badge>
            </Accordion.Header>
            <Accordion.Body>
              <ListGroup as="ol" numbered variant="flush">
                {meaning.definitions.map((definition, i) => (
                  <ListGroup.Item as="li" key={i}>
                    <PronounceButton
                      text={definition.text}
                      label="Read definition aloud"
                      size={16}
                    />
                    {definition.text}
                    {definition.example && (
                      <div className="text-muted fst-italic ms-4">“{definition.example}”</div>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <TermList title="Synonyms" terms={meaning.synonyms} />
              <TermList title="Antonyms" terms={meaning.antonyms} />
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>

      {word.sourceUrls.length > 0 && (
        <p className="small text-muted mt-3 mb-0">
          Source:{' '}
          {word.sourceUrls.map((url) => (
            <a key={url} href={url} target="_blank" rel="noreferrer" className="me-2">
              {url}
            </a>
          ))}
        </p>
      )}
    </article>
  );
}
