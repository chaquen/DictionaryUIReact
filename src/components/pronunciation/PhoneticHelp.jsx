import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import { HourglassSplit } from 'react-bootstrap-icons';
import { SOUND_TIPS, sounds, spanishRespelling } from '../../domain/phonetics';
import { useSpeech } from '../../hooks/useSpeech';
import { BiLabel, HelpLine } from '../../i18n/Help';

/**
 * Pronunciation aids under a word (#2): the IPA with the sounds that are hard
 * for Spanish speakers marked (tap one to see how to make it), a Spanish-style
 * spelling ("ken-TROUL") and a slow playback of the recording.
 */
export default function PhoneticHelp({ term, ipa, audioUrl = null, className = 'ms-4 mb-2' }) {
  const speak = useSpeech();
  const [open, setOpen] = useState(null);
  if (!ipa) return null;

  const hard = [...new Set(sounds(ipa).filter((s) => SOUND_TIPS[s]))];
  const respelling = spanishRespelling(ipa);
  const tip = open && SOUND_TIPS[open];

  return (
    <div className={className} data-testid="phonetic-help">
      <div className="d-flex flex-wrap align-items-center gap-2">
        <span className="text-muted">{ipa}</span>
        {hard.map((sound) => (
          <Button
            key={sound}
            variant={open === sound ? 'warning' : 'outline-warning'}
            size="sm"
            className="py-0 px-2 text-dark"
            onClick={() => setOpen(open === sound ? null : sound)}
            aria-label={`How to say /${sound}/`}
            aria-pressed={open === sound}
          >
            /{sound}/
          </Button>
        ))}
        <Button
          variant="link"
          size="sm"
          className="p-0"
          onClick={() => speak({ text: term, audioUrl, rate: 0.7 })}
          aria-label={`Listen to "${term}" slowly`}
        >
          <HourglassSplit className="me-1" aria-hidden="true" />
          <BiLabel id="phonetic.slow">Slow</BiLabel>
        </Button>
      </div>
      {respelling && (
        <div className="small">
          Sounds like: <strong>{respelling}</strong>
          <HelpLine id="phonetic.sayLike" vars={{ text: respelling }} />
        </div>
      )}
      {tip && (
        <div className="small border rounded p-2 mt-1 bg-light" role="note">
          <strong>/{open}/</strong> {tip.tip}
          <HelpLine id={`sound.${tip.id}`} />
        </div>
      )}
    </div>
  );
}
