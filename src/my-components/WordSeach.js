import 'bootstrap/dist/css/bootstrap.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WordResult from './WordResult';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

function WordSearch() {
  const [text, setText] = useState('');
  const [data, setData] = useState(null);

  async function handleClick() {
    const response = await axios.get(
      `https://localhost:44384/api/Words/GetWord/?word=${text}`
    );
    //if(response == 500)
    setData(response.data);
  }

  return (
    <div>
      {/* <input
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <Button onClick={handleClick}>Search World</Button>
      {data && <WordResult data={data} />} */}

      <>
      

      <InputGroup className="mb-3">
        <Form.Control
          placeholder="Write the word to search"
          aria-label="Write the word to search"
          aria-describedby="btn-search"
          onChange={(event) => setText(event.target.value)}
        />
        <Button variant="outline-secondary" id="btn-search" 
         onClick={handleClick}
         >
          Search word
        </Button>
      </InputGroup>
      {data && <WordResult data={data} />}
    </>
    </div>
  );
}

export default WordSearch;