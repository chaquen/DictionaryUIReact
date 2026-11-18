import Button from 'react-bootstrap/Button';
import { VolumeUpFill } from 'react-bootstrap-icons';
import { useSpeech } from '../hooks/useSpeech';

/** Accessible button that reads a text (or plays its recording) aloud. */
export default function PronounceButton({ text, audioUrl = null, label, size = 18 }) {
  const speak = useSpeech();
  return (
    <Button
      variant="link"
      className="p-0 me-2 align-baseline"
      aria-label={label ?? `Pronounce "${text}"`}
      title={label ?? `Pronounce "${text}"`}
      onClick={(event) => {
        event.stopPropagation();
        speak({ text, audioUrl });
      }}
    >
      <VolumeUpFill size={size} aria-hidden="true" />
    </Button>
  );
}
