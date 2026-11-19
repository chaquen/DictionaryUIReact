import Container from 'react-bootstrap/Container';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useLearning } from './context/LearningContext';
import { useSavedWords } from './hooks/useSavedWords';
import IdeaDisabled from './components/common/IdeaDisabled';
import HomePage from './components/home/HomePage';
import LabPage from './components/lab/LabPage';
import LearnPage from './components/learn/LearnPage';
import AppNav from './components/layout/AppNav';
import ReviewPage from './components/review/ReviewPage';
import SavedWordsGrid from './components/SavedWordsGrid';
import WordSearch from './components/WordSearch';

export default function App() {
  const savedWords = useSavedWords();
  const learning = useLearning();
  const navigate = useNavigate();
  const reviewEnabled = learning.isEnabled('review');
  const learnEnabled = learning.isEnabled('learn');
  const dueCount = reviewEnabled ? learning.dueCardsNow(savedWords.words.map((w) => w.word)).length : 0;

  return (
    <>
      <AppNav
        dueCount={dueCount}
        wordCount={savedWords.words.length}
        reviewEnabled={reviewEnabled}
        learnEnabled={learnEnabled}
      />

      <Container as="main" className="pb-5">
        <Routes>
          <Route path="/" element={<HomePage savedWords={savedWords} />} />
          <Route
            path="/learn"
            element={
              learnEnabled ? <LearnPage savedWords={savedWords} /> : <IdeaDisabled title="Essential vocabulary path" />
            }
          />
          <Route
            path="/review"
            element={
              reviewEnabled ? <ReviewPage savedWords={savedWords} /> : <IdeaDisabled title="Spaced repetition" />
            }
          />
          <Route
            path="/words"
            element={<SavedWordsGrid savedWords={savedWords} onGoToSearch={() => navigate('/search')} />}
          />
          <Route path="/search" element={<WordSearch savedWords={savedWords} />} />
          <Route path="/lab" element={<LabPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </>
  );
}
