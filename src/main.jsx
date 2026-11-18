import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';
import { RepositoryProvider } from './context/RepositoryContext';
import { createRepositories } from './repositories';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RepositoryProvider repositories={createRepositories()}>
      <App />
    </RepositoryProvider>
  </React.StrictMode>,
);
