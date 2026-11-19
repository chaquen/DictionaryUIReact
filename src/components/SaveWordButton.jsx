import Button from 'react-bootstrap/Button';
import { BookmarkCheckFill, BookmarkPlus } from 'react-bootstrap-icons';
import { BiLabel } from '../i18n/Help';

export default function SaveWordButton({ saved, onSave, onRemove }) {
  return saved ? (
    <Button variant="success" onClick={onRemove} title="Remove from my words">
      <BookmarkCheckFill className="me-1" aria-hidden="true" /> <BiLabel id="word.saved">Saved</BiLabel>
    </Button>
  ) : (
    <Button variant="outline-primary" onClick={onSave}>
      <BookmarkPlus className="me-1" aria-hidden="true" /> <BiLabel id="word.save">Save word</BiLabel>
    </Button>
  );
}
