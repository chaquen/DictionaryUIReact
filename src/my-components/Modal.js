import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ListUtil from './ListUtil'

function ModalUtil({show,data,handleClose}) {
  console.log(data.results)  

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{data.word}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {
                data.results && <ListUtil txtAlter='Definitions' data={data.results.map(d => `(${d.partOfSpeech}) : ${d.definition} `  )} variant="light"/>                
            }
            <br></br>
            {
                data.results && <ListUtil txtAlter='Synonyms' data={data.results.map(d => d.synonyms ).flat(1)} variant="light"/>
            }
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Ok
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
export default ModalUtil;

