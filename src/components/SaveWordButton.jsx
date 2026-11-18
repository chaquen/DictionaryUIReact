import Button from 'react-bootstrap/Button';
import { BookmarkCheckFill, BookmarkPlus } from 'react-bootstrap-icons';

export default function SaveWordButton({ saved, onSave, onRemove }) {
  return saved ? (
    <Button variant="success" onClick={onRemove} title="Remove from my words">
      <BookmarkCheckFill className="me-1" aria-hidden="true" /> Saved
    </Button>
  ) : (
    <Button variant="outline-primary" onClick={onSave}>
      <BookmarkPlus className="me-1" aria-hidden="true" /> Save word
    </Button>
  );
}
