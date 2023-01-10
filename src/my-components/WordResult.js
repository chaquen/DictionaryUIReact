import React from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Alert from 'react-bootstrap/Alert';
import ListUtil from './ListUtil'
import SpeechSynthesis from './speechUtil';

function WordResult({ data }) {
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
    <Alert variant={data.code == 200 ? 'success' : 'danger' }>
      {data.code == 200 ? <><SpeechSynthesis playButtonRef={()=>playButtonRef(data.response.word)} />  {data.response.word}</> : data.message }
    </Alert>
  { data.code == 200 ? 
      <>
        <img src={data.response.urlImage} style={{ width: '100px', height: '100px', borderRadius: '50%' }} />  
        <Accordion defaultActiveKey="0" flush>
          {
            data.response.results.map((result, index) => (
              <Accordion.Item eventKey={index} key={index}>
              <Accordion.Header><SpeechSynthesis playButtonRef={()=>playButtonRef(`${result.definition}`)} />  Mean ({result.partOfSpeech}) {data.word} # {index+1}  - <strong> {result.definition} </strong> - </Accordion.Header>
              <Accordion.Body>                
                {result.typeOf && <ListUtil txtAlter='Meanings about context' data={result.typeOf}/>}
              </Accordion.Body>           
              <Accordion.Body>
                {result.usageOf && <ListUtil txtAlter='Usage of' data={result.usageOf}/>}
              </Accordion.Body> 
              <Accordion.Body>
                {
                  result.synonyms && 
                     <>
                      <Alert variant='light'>Synonyms</Alert>
                      <ListUtil data={result.synonyms}/>
                     </>
                }           
              </Accordion.Body>                                 
            </Accordion.Item>
            ))
          }

        </Accordion>  
      </>
    : ''
  }    
  </>
  );
}

export default WordResult;
