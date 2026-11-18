import { useState } from 'react';
import Badge from 'react-bootstrap/Badge';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useSavedWords } from './hooks/useSavedWords';
import SavedWordsGrid from './components/SavedWordsGrid';
import WordSearch from './components/WordSearch';

const TABS = { HOME: 'home', SEARCH: 'search' };

export default function App() {
  const [tab, setTab] = useState(TABS.HOME);
  const savedWords = useSavedWords();

  return (
    <>
      <Navbar bg="primary" data-bs-theme="dark" expand="sm" className="mb-4">
        <Container>
          <Navbar.Brand>Dictionary</Navbar.Brand>
          <Nav activeKey={tab} onSelect={(key) => setTab(key)} className="flex-row gap-3">
            <Nav.Link eventKey={TABS.HOME}>
              My words{' '}
              <Badge bg="light" text="dark" pill>
                {savedWords.words.length}
              </Badge>
            </Nav.Link>
            <Nav.Link eventKey={TABS.SEARCH}>Search</Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <Container as="main" className="pb-5">
        {tab === TABS.HOME ? (
          <SavedWordsGrid savedWords={savedWords} onGoToSearch={() => setTab(TABS.SEARCH)} />
        ) : (
          <WordSearch savedWords={savedWords} />
        )}
      </Container>
    </>
  );
}
