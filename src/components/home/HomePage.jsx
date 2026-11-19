import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Row from 'react-bootstrap/Row';
import { Award, BookmarkStar, Fire, Lock } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { useLearning } from '../../context/LearningContext';

function GameProgress({ progress }) {
  const { streak, activeToday, level, xp, xpIntoLevel, xpForNextLevel, achievements } = progress;
  const unlocked = achievements.filter((a) => a.unlockedAt).length;

  return (
    <>
      <Row xs={1} md={2} className="g-3 mb-3">
        <Col>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Subtitle className="text-muted mb-2">Streak</Card.Subtitle>
              <div className="d-flex align-items-center gap-2">
                <Fire size={28} className={streak > 0 ? 'text-danger' : 'text-muted'} aria-hidden="true" />
                <span className="display-6" data-testid="streak">
                  {streak}
                </span>
                <span>{streak === 1 ? 'day' : 'days'}</span>
              </div>
              {streak > 0 && !activeToday && (
                <small className="text-muted">Study today to keep your streak.</small>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Subtitle className="text-muted mb-2">Level {level}</Card.Subtitle>
              <div className="mb-2">
                <span className="display-6" data-testid="xp">
                  {xp}
                </span>{' '}
                XP
              </div>
              <ProgressBar
                now={xpIntoLevel}
                max={xpForNextLevel}
                label={`${xpIntoLevel}/${xpForNextLevel}`}
                aria-label={`Progress to level ${level + 1}`}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm mb-3">
        <Card.Body>
          <Card.Subtitle className="text-muted mb-3">
            Achievements {unlocked}/{achievements.length}
          </Card.Subtitle>
          <div className="d-flex flex-wrap gap-2">
            {achievements.map((a) => (
              <Badge
                key={a.id}
                bg={a.unlockedAt ? 'warning' : 'light'}
                text="dark"
                className="border fw-normal p-2"
                title={a.description}
              >
                {a.unlockedAt ? <Award className="me-1" aria-hidden="true" /> : <Lock className="me-1" aria-hidden="true" />}
                {a.title}
                <span className="visually-hidden">{a.unlockedAt ? ' (unlocked)' : ' (locked)'}</span>
              </Badge>
            ))}
          </div>
        </Card.Body>
      </Card>
    </>
  );
}

/** Start screen: what to study today (#1) and the game progress (#18). */
export default function HomePage({ savedWords }) {
  const learning = useLearning();
  const navigate = useNavigate();
  const terms = savedWords.words.map((w) => w.word);
  const due = learning.dueCardsNow(terms).length;
  const reviewEnabled = learning.isEnabled('review');
  const gameEnabled = learning.isEnabled('gamification');

  return (
    <section aria-label="Home">
      {gameEnabled && learning.progress.streakLost && (
        <Alert variant="warning">Your streak ended. Study today to start a new one!</Alert>
      )}

      {savedWords.words.length === 0 ? (
        <Alert variant="info" className="text-center">
          <p className="mb-2">Save words while you search and they will appear here to review.</p>
          <Button onClick={() => navigate('/search')}>Search your first word</Button>
        </Alert>
      ) : (
        reviewEnabled && (
          <Card className="shadow-sm mb-3">
            <Card.Body className="d-flex flex-wrap align-items-center justify-content-between gap-2">
              <div>
                <BookmarkStar className="me-2 text-primary" aria-hidden="true" />
                {due > 0 ? (
                  <>
                    You have <strong>{due}</strong> {due === 1 ? 'word' : 'words'} to review today.
                  </>
                ) : (
                  'All caught up. No words to review right now.'
                )}
              </div>
              <Button onClick={() => navigate('/review')} disabled={due === 0}>
                Start review
              </Button>
            </Card.Body>
          </Card>
        )
      )}

      {gameEnabled && <GameProgress progress={learning.progress} />}
    </section>
  );
}
