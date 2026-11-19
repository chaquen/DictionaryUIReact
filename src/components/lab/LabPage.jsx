import { Fragment, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import { Download } from 'react-bootstrap-icons';
import { IDEAS } from '../../domain/ideas';
import { dayKey } from '../../domain/learningEvent';
import { reviewStats, summarizeByIdea } from '../../domain/metrics';
import { STRATEGIES } from '../../domain/scheduling';
import { useLearning } from '../../context/LearningContext';
import { useRepositories } from '../../context/RepositoryContext';
import { downloadText } from '../../utils/download';
import DeviceCard from './DeviceCard';
import { Bi, BiLabel, HelpLine } from '../../i18n/Help';
import { DEFAULT_HELP_LANGUAGE, HELP_LANGUAGES, NO_HELP } from '../../i18n/languages';

const percent = (value) => (value === null || value === undefined ? '—' : `${Math.round(value * 100)} %`);

/** Experiment lab (FR-009, FR-010): turn ideas on and off, pick the algorithm, read and export the metrics. */
export default function LabPage() {
  const learning = useLearning();
  const { learningEvents } = useRepositories();
  const [exportStatus, setExportStatus] = useState(null);
  const ideas = summarizeByIdea(learning.events);
  const review = reviewStats(learning.events);

  if (!learning.preferences) return null;

  async function exportEvents() {
    const json = await learningEvents.exportJson();
    const ok = downloadText(`dictionary-learning-events-${dayKey(learning.now())}.json`, json);
    setExportStatus(
      ok
        ? { text: `Exported ${learning.events.length} events.`, help: 'lab.exported', vars: { n: learning.events.length } }
        : { text: 'This browser cannot download files.', help: 'lab.exportFailed' },
    );
  }

  return (
    <section aria-label="Lab">
      <Bi id="lab.title" as="h1" className="h3 mb-0">
        Lab
      </Bi>
      <Bi id="lab.intro" className="text-muted mb-0" helpClassName="mb-3">
        Turn ideas on and off and compare how much they help you learn. Your data stays in this browser.
      </Bi>

      <Card className="shadow-sm mb-3">
        <Card.Body>
          <Card.Title as="h2" className="h5">
            <BiLabel id="lab.ideas">Ideas</BiLabel>
          </Card.Title>
          {IDEAS.map((idea) => (
            <Form.Check
              key={idea.id}
              type="switch"
              role="switch"
              id={`flag-${idea.id}`}
              label={
                <>
                  {`${idea.number ? `#${idea.number} ` : ''}${idea.title} — ${idea.description}`}
                  <HelpLine id={`idea.${idea.id}`} />
                </>
              }
              checked={learning.isEnabled(idea.id)}
              onChange={(e) => learning.updatePreferences({ flags: { [idea.id]: e.target.checked } })}
            />
          ))}
        </Card.Body>
      </Card>

      <Card className="shadow-sm mb-3">
        <Card.Body>
          <Card.Title as="h2" className="h5">
            <BiLabel id="lab.algorithm">Review algorithm</BiLabel>
          </Card.Title>
          <Bi id="lab.algorithm.note" className="small text-muted mb-0">
            Applies to newly saved words. Existing words keep the algorithm that created them.
          </Bi>
          {STRATEGIES.map((s) => (
            <Form.Check
              key={s.id}
              type="radio"
              name="scheduling-strategy"
              id={`strategy-${s.id}`}
              label={
                <>
                  {`${s.name} — ${s.description}`}
                  <HelpLine id={`strategy.${s.id}`} />
                </>
              }
              checked={learning.preferences.schedulingStrategy === s.id}
              onChange={() => learning.updatePreferences({ schedulingStrategy: s.id })}
            />
          ))}
        </Card.Body>
      </Card>

      <Card className="shadow-sm mb-3">
        <Card.Body>
          <Card.Title as="h2" className="h5">
            <BiLabel id="lab.newWords">New words per day</BiLabel>
          </Card.Title>
          <Form.Select
            aria-label="New words per day"
            value={learning.preferences.newWordsPerDay}
            onChange={(e) => learning.updatePreferences({ newWordsPerDay: Number(e.target.value) })}
            style={{ maxWidth: 160 }}
          >
            {[3, 5, 10, 15, 20, 30].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Form.Select>
        </Card.Body>
      </Card>

      <Card className="shadow-sm mb-3">
        <Card.Body>
          <Card.Title as="h2" className="h5">
            <BiLabel id="lab.helpLanguage">Help language</BiLabel>
          </Card.Title>
          <Bi id="lab.helpLanguage.note" className="small text-muted mb-0">
            The interface stays in English; choose the language of the help line.
          </Bi>
          <Form.Select
            aria-label="Help language"
            value={learning.preferences.helpLanguage ?? DEFAULT_HELP_LANGUAGE}
            onChange={(e) => learning.updatePreferences({ helpLanguage: e.target.value })}
            style={{ maxWidth: 220 }}
          >
            {HELP_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name} ({l.englishName})
              </option>
            ))}
            <option value={NO_HELP}>No help (English only)</option>
          </Form.Select>
        </Card.Body>
      </Card>

      <DeviceCard />

      <Card className="shadow-sm mb-3">
        <Card.Body>
          <Card.Title as="h2" className="h5">
            <BiLabel id="lab.usage">Usage by idea</BiLabel>
          </Card.Title>
          {ideas.length === 0 ? (
            <Bi id="lab.noActivity" className="text-muted mb-0" helpClassName="mb-0">
              No activity yet.
            </Bi>
          ) : (
            <Table size="sm" responsive className="mb-0">
              <thead>
                <tr>
                  <th>Idea</th>
                  <th>Uses</th>
                  <th>Active days</th>
                  <th>Success</th>
                </tr>
              </thead>
              <tbody>
                {ideas.map((row) => (
                  <tr key={row.idea}>
                    <td>{row.idea}</td>
                    <td>{row.uses}</td>
                    <td>{row.activeDays}</td>
                    <td>{percent(row.successRate)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Card className="shadow-sm mb-3">
        <Card.Body>
          <Card.Title as="h2" className="h5">
            <BiLabel id="lab.quality">Review quality</BiLabel>
          </Card.Title>
          <dl className="row mb-0">
            <dt className="col-sm-7">Reviews</dt>
            <dd className="col-sm-5">{review.reviews}</dd>
            <dt className="col-sm-7">Remembered</dt>
            <dd className="col-sm-5">{percent(review.successRate)}</dd>
            <dt className="col-sm-7">Remembered after 7+ days (goal ≥ 80 %)</dt>
            <dd className="col-sm-5">
              {percent(review.longGapRecall)} ({review.longGapReviews} reviews)
            </dd>
            <dt className="col-sm-7">FSRS-6 prediction log loss (lower is better)</dt>
            <dd className="col-sm-5">
              {review.fsrsLogLoss === null ? '—' : review.fsrsLogLoss.toFixed(3)} ({review.fsrsPredictions} predictions)
            </dd>
            {review.byStrategy.map((s) => (
              <Fragment key={s.strategy}>
                <dt className="col-sm-7">Remembered with {s.strategy}</dt>
                <dd className="col-sm-5">
                  {percent(s.successRate)} ({s.reviews} reviews)
                </dd>
              </Fragment>
            ))}
          </dl>
        </Card.Body>
      </Card>

      <Button variant="outline-primary" onClick={exportEvents}>
        <Download className="me-1" aria-hidden="true" /> <BiLabel id="lab.export">Export data (JSON)</BiLabel>
      </Button>
      {exportStatus && (
        <Alert variant="info" className="mt-3">
          {exportStatus.text}
          <HelpLine id={exportStatus.help} vars={exportStatus.vars} />
        </Alert>
      )}
    </section>
  );
}
