import Card from 'react-bootstrap/Card';
import { useCapabilities } from '../../hooks/useCapabilities';
import { BiLabel } from '../../i18n/Help';

const SPEECH = {
  checking: 'Checking…',
  local: 'On this device',
  downloadable: 'On this device after a download (first "Say it")',
  cloud: "Through Google's servers",
  unavailable: 'Not available',
};
const STATES = {
  checking: 'Checking…',
  granted: 'Allowed',
  prompt: 'Will ask the first time',
  denied: 'Blocked',
  unknown: 'Unknown',
  available: 'Ready',
  downloadable: 'Needs a download',
  downloading: 'Downloading',
  unavailable: 'Not available',
};

/** What this browser can do (FR-011): ideas that need a missing capability hide or explain why. */
export default function DeviceCard() {
  const { speech, microphone, localAi } = useCapabilities();
  return (
    <Card className="shadow-sm mb-3">
      <Card.Body>
        <Card.Title as="h2" className="h5">
          <BiLabel id="lab.device">This device</BiLabel>
        </Card.Title>
        <dl className="row mb-0" data-testid="device-capabilities">
          <dt className="col-sm-5">
            <BiLabel id="lab.device.speech">Speech recognition</BiLabel>
          </dt>
          <dd className="col-sm-7">{SPEECH[speech] ?? speech}</dd>
          <dt className="col-sm-5">
            <BiLabel id="lab.device.mic">Microphone</BiLabel>
          </dt>
          <dd className="col-sm-7">{STATES[microphone] ?? microphone}</dd>
          <dt className="col-sm-5">
            <BiLabel id="lab.device.ai">On-device AI</BiLabel>
          </dt>
          <dd className="col-sm-7 mb-0">{STATES[localAi] ?? localAi}</dd>
        </dl>
      </Card.Body>
    </Card>
  );
}
