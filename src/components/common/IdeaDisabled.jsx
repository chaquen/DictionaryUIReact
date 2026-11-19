import Alert from 'react-bootstrap/Alert';
import { Link } from 'react-router-dom';

/** Shown when a route belongs to an idea switched off in the Lab (FR-010). */
export default function IdeaDisabled({ title }) {
  return (
    <Alert variant="secondary">
      <strong>{title}</strong> is turned off. You can turn it on again in the <Link to="/lab">Lab</Link>.
    </Alert>
  );
}
