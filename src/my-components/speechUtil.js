import React from 'react';
import { FileEarmarkPlayFill } from 'react-bootstrap-icons';
function SpeechSynthesis({playButtonRef}) {

  return (
    <>  
      <FileEarmarkPlayFill
        color="royalblue"
        size={20}
        className="align-top"
        onClick={playButtonRef }
     />
    </>
  );
}
export default SpeechSynthesis;
