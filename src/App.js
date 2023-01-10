import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import WordResult  from './my-components/WordSeach';
import Nav from 'react-bootstrap/Nav';
import GridUtil from './my-components/GridUtil' 
import axios from 'axios';


function App() {
  const [item, setItem] = useState('');
  const [data, setData] = useState(null);

  // useEffect(() => {
  //   // Efecto secundario que se ejecutará aquí
  //   if(item == 'home')
  //     handleClick()
  // },item);
  async function handleClick(value) {
    if(value == 'home')
    {
      const response = await axios.get(
        `https://localhost:44384/api/Words/GetWords`
      );

      setData(response.data);
      setItem(value)
    }
    if(value == 'search')
    {
      setItem(value)
    }
  }
   return (
    <div className="App">
      <Nav
        activeKey="/home"
        onSelect={(selectedKey) => handleClick(selectedKey)}
      >
        <Nav.Item>
          <Nav.Link eventKey="home">Home</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="search">Search</Nav.Link>
        </Nav.Item>
      </Nav>
      <> 
      {item === 'home' ?  <GridUtil data={data}/> : ''}    
      {item === 'search' ? <WordResult></WordResult> : ' ' }        
      </>
    </div>
  );
}

export default App;
