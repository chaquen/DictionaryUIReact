import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import CardGroup from 'react-bootstrap/CardGroup';
import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from './Modal';
import SpeechSynthesis from './speechUtil'


function GridUtil({data}) {
  const [show, setShow] = useState(false);
  const [dataModal, setDataModal] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = (data) => {
    setShow(true);
    setDataModal(data)   
  };
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
    <CardGroup>
      {data.map((result, idx) => (
        <Col key={idx}>
          <Card >             
            <Card.Body>
            <Card.Img variant="top" 
                src={result.urlImage} 
                style={{ width: '409px', height: '160px'}} />
              <Card.Title><SpeechSynthesis textInputRef={result.word} playButtonRef={()=>playButtonRef(result.word)}/> {result.word.toUpperCase()}</Card.Title>
              <Card.Text>                
                {result.results[0].definition}. <b>and {result.results.length} more definitions.</b>               
              </Card.Text>
              <Button variant="info" onClick={(event) => handleShow(result)}>
                Look for more information
              </Button>
            </Card.Body>
          </Card>
        </Col>
      ))}
      
    </CardGroup>
        
      <Modal show={show} handleClose={handleClose} data={dataModal}/>
    </>
  );
}

export default GridUtil;