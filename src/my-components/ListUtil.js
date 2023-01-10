import ListGroup from 'react-bootstrap/ListGroup';
import Alert from 'react-bootstrap/Alert';
import SpeechSynthesis from './speechUtil'


function ListUtil({txtAlter,data, variant = 'dark'}) {
  function playButtonRef(text) {
    if (!window.speechSynthesis)
    {
      alert("This browser don't support speech Synthesis API")
      return;
    }   
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }
  return (

    <>
      {txtAlter && <Alert  variant={variant}>
       {txtAlter}
      </Alert>}
      <ListGroup>
      {
        data.map(res => 
      
          res && <ListGroup.Item><SpeechSynthesis playButtonRef={()=>playButtonRef(res)}/>{res}</ListGroup.Item>
        
        )
      } 
      
    </ListGroup>
    </>
  );
}

export default ListUtil;