// Import the React library, which is necessary to use JSX and React features.
// React is the core library for building user interfaces.
import React from 'react';

// Import ReactDOM, specifically the client version for React 18+.
// ReactDOM is responsible for rendering React components into the actual DOM.
import ReactDOM from 'react-dom/client';

// Import BrowserRouter from react-router-dom package.
// BrowserRouter enables client-side routing using the HTML5 History API,
// allowing your React app to have multiple pages/views without full reloads.
import { BrowserRouter } from 'react-router-dom';

// Import the root component of the app from a local file named App.jsx.
// This component typically contains the app’s main UI and routing logic.
import App from './App.jsx';

// Import the main CSS file which contains global styles.
// The styles will be bundled and applied globally in the app.
import './index.css';

// Import the SavedMoviesProvider component, a Context Provider.
// This component wraps parts of the app that need access to saved movies state,
// allowing any child component to consume the saved movies context.
import { SavedMoviesProvider } from './components/SavedMoviesContext';

// Create a React root for rendering by selecting the HTML element with id 'root'.
// React 18+ uses `createRoot` instead of the older `ReactDOM.render` to enable concurrent features.
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the React app inside the root element.
// The JSX passed to `root.render` will be converted to HTML and inserted into the DOM.
root.render(
  // React.StrictMode is a development tool that activates additional checks and warnings
  // for its children to help identify potential problems.
  <React.StrictMode>
    {/* Wrap the app in BrowserRouter to enable routing functionality */}
    <BrowserRouter>
      {/* Wrap the app in SavedMoviesProvider to provide saved movies state context to descendants */}
      <SavedMoviesProvider>
        {/* Render the main App component */}
        <App />
      </SavedMoviesProvider>
    </BrowserRouter>
  </React.StrictMode>
);
