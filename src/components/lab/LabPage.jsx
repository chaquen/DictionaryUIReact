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
    setExportStatus(ok ? `Exported ${learning.events.length} events.` : 'This browser cannot download files.');
  }

  return (
    <section aria-label="Lab">
      <h1 className="h3">Lab</h1>
      <p className="text-muted">
        Turn ideas on and off and compare how much they help you learn. Your data stays in this browser.
      </p>

      <Card className="shadow-sm mb-3">
        <Card.Body>
          <Card.Title as="h2" className="h5">
            Ideas
          </Card.Title>
          {IDEAS.map((idea) => (
            <Form.Check
              key={idea.id}
              type="switch"
              role="switch"
              id={`flag-${idea.id}`}
              label={`#${idea.number} ${idea.title} — ${idea.description}`}
              checked={learning.isEnabled(idea.id)}
              onChange={(e) => learning.updatePreferences({ flags: { [idea.id]: e.target.checked } })}
            />
          ))}
        </Card.Body>
      </Card>

      <Card className="shadow-sm mb-3">
        <Card.Body>
          <Card.Title as="h2" className="h5">
            Review algorithm
          </Card.Title>
          <p className="small text-muted">
            Applies to newly saved words. Existing words keep the algorithm that created them.
          </p>
          {STRATEGIES.map((s) => (
            <Form.Check
              key={s.id}
              type="radio"
              name="scheduling-strategy"
              id={`strategy-${s.id}`}
              label={`${s.name} — ${s.description}`}
              checked={learning.preferences.schedulingStrategy === s.id}
              onChange={() => learning.updatePreferences({ schedulingStrategy: s.id })}
            />
          ))}
        </Card.Body>
      </Card>

      <Card className="shadow-sm mb-3">
        <Card.Body>
          <Card.Title as="h2" className="h5">
            Usage by idea
          </Card.Title>
          {ideas.length === 0 ? (
            <p className="text-muted mb-0">No activity yet.</p>
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
            Review quality
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
        <Download className="me-1" aria-hidden="true" /> Export data (JSON)
      </Button>
      {exportStatus && (
        <Alert variant="info" className="mt-3">
          {exportStatus}
        </Alert>
      )}
    </section>
  );
}
