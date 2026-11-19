import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { BiLabel } from '../i18n/Help';
import PronounceButton from './PronounceButton';
import WordDetails from './WordDetails';

export default function WordDetailsModal({ word, onClose }) {
  return (
    <Modal show={Boolean(word)} onHide={onClose} size="lg" scrollable>
      {word && (
        <>
          <Modal.Header closeButton>
            <Modal.Title className="text-capitalize">
              <PronounceButton text={word.word} audioUrl={word.audioUrl} size={22} />
              {word.word}
              {word.phonetic && <small className="text-muted fs-6 ms-2">{word.phonetic}</small>}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <WordDetails word={word} showHeader={false} showImage />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onClose}>
              <BiLabel id="word.close">Close</BiLabel>
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
}
