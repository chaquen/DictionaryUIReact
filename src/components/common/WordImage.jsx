import Button from 'react-bootstrap/Button';
import { ArrowRepeat } from 'react-bootstrap-icons';
import { useWordImages } from '../../hooks/useWordImages';
import { useHelp } from '../../i18n/Help';
import SpanishHelp from './SpanishHelp';

/**
 * Compact picture of a word (#12, FR-006): a rounded thumbnail with a small
 * "another image" button on its corner (when there are more) and a one-line credit underneath (author · license, linked to the file page).
 * Renders nothing when there is no good image or the idea is turned off.
 */
export default function WordImage({ term, source, partOfSpeech, definition }) {
  const { image, count, next, broken } = useWordImages(term, { source, partOfSpeech, definition });
  const { help } = useHelp();
  if (!image) return null;

  const credit = `${image.author} · ${image.license}`;
  const tip = (english, id) => (help(id) ? `${english} · ${help(id)}` : english);

  return (
    <figure className="word-image mb-0">
      <div className="position-relative">
        <img
          key={image.url}
          src={image.url}
          alt={`Picture for "${term}"`}
          className={`word-image-img${image.source === 'arasaac' ? ' word-image-img--pictogram' : ''}`}
          loading="lazy"
          onError={() => broken(image.url)}
        />
        <div className="word-image-actions">
          {count > 1 && (
            <Button
              variant="light"
              size="sm"
              className="shadow-sm"
              onClick={next}
              aria-label="Another image"
              title={tip('Another image', 'image.another')}
            >
              <ArrowRepeat aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
      <figcaption>
        {image.caption && (
          <span className="word-image-caption d-block" data-testid="image-caption">
            {image.caption}
          </span>
        )}
        {image.caption && <SpanishHelp key={image.url} text={image.caption} term={term} />}
        <span className="word-image-credit text-truncate d-block" title={`${image.title} — ${credit}`}>
          <a href={image.pageUrl} target="_blank" rel="noreferrer">
            {credit}
          </a>
        </span>
      </figcaption>
    </figure>
  );
}
