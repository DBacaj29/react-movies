// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { SavedMoviesProvider } from './components/SavedMoviesContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <SavedMoviesProvider>
        <App />
      </SavedMoviesProvider>
    </BrowserRouter>
  </React.StrictMode>
);
