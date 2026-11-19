import Badge from 'react-bootstrap/Badge';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { NavLink } from 'react-router-dom';

function Count({ value, label }) {
  if (!value) return null;
  return (
    <Badge bg="light" text="dark" pill className="ms-1" aria-label={`${value} ${label}`}>
      {value}
    </Badge>
  );
}

/** Main navigation. Ideas switched off in the Lab are not shown (FR-010). */
export default function AppNav({ dueCount, wordCount, reviewEnabled }) {
  return (
    <Navbar bg="primary" data-bs-theme="dark" expand="md" collapseOnSelect className="mb-4">
      <Container>
        <Navbar.Brand as={NavLink} to="/">
          Dictionary
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end eventKey="home">
              Home
            </Nav.Link>
            {reviewEnabled && (
              <Nav.Link as={NavLink} to="/review" eventKey="review">
                Review
                <Count value={dueCount} label="due" />
              </Nav.Link>
            )}
            <Nav.Link as={NavLink} to="/words" eventKey="words">
              My words
              <Count value={wordCount} label="saved" />
            </Nav.Link>
            <Nav.Link as={NavLink} to="/search" eventKey="search">
              Search
            </Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link as={NavLink} to="/lab" eventKey="lab">
              Lab
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
