// Import routing components from React Router DOM
import { Routes, Route } from 'react-router-dom';
// - Routes: the container that holds all <Route> definitions
// - Route: maps a specific URL path to a React component

// Import the components/pages rendered for specific routes
import Home from './Home.jsx'; // Main landing page (search, trending, results, etc.)
import MovieDetail from './components/MovieDetail.jsx'; // Individual movie page based on movie ID

// Define the main App component
const App = () => {
  return (
    // Routes is the wrapper that contains all route definitions.
    <Routes>
      {/* 
        First route:
        - path="/" matches the root of the URL
        - element={<Home />} renders the Home component when URL is just "/"
      */}
      <Route path="/" element={<Home />} />

      {/* 
        Second route:
        - path="/movie/:id" uses a dynamic route parameter called 'id'
        - e.g., /movie/123 or /movie/abcde
        - :id is a placeholder that can be accessed via useParams() in MovieDetail
        - element={<MovieDetail />} renders the MovieDetail component for that ID
      */}
      <Route path="/movie/:id" element={<MovieDetail />} />
    </Routes>
  );
};

// Export the App component so it can be used as the root of the React app (e.g. in main.jsx)
export default App;
