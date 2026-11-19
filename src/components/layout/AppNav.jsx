import Badge from 'react-bootstrap/Badge';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { NavLink } from 'react-router-dom';
import { BiLabel } from '../../i18n/Help';

function Count({ value, label }) {
  if (!value) return null;
  return (
    <Badge bg="light" text="dark" pill className="ms-1" aria-label={`${value} ${label}`}>
      {value}
    </Badge>
  );
}

/** Main navigation. Ideas switched off in the Lab are not shown (FR-010). */
export default function AppNav({ dueCount, wordCount, reviewEnabled, learnEnabled }) {
  return (
    <Navbar bg="primary" data-bs-theme="dark" expand="md" collapseOnSelect className="mb-4">
      <Container>
        <Navbar.Brand as={NavLink} to="/">
          <BiLabel id="nav.brand">Dictionary</BiLabel>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end eventKey="home">
              <BiLabel id="nav.home">Home</BiLabel>
            </Nav.Link>
            {learnEnabled && (
              <Nav.Link as={NavLink} to="/learn" eventKey="learn">
                <BiLabel id="nav.learn">Learn</BiLabel>
              </Nav.Link>
            )}
            {reviewEnabled && (
              <Nav.Link as={NavLink} to="/review" eventKey="review">
                <BiLabel id="nav.review">Review</BiLabel>
                <Count value={dueCount} label="due" />
              </Nav.Link>
            )}
            <Nav.Link as={NavLink} to="/words" eventKey="words">
              <BiLabel id="nav.words">My words</BiLabel>
              <Count value={wordCount} label="saved" />
            </Nav.Link>
            <Nav.Link as={NavLink} to="/search" eventKey="search">
              <BiLabel id="nav.search">Search</BiLabel>
            </Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link as={NavLink} to="/lab" eventKey="lab">
              <BiLabel id="nav.lab">Lab</BiLabel>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
