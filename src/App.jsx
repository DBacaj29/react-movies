// Importing built-in React hooks from the React library
// A Hook is used to 'hook' into React features such as state and lifecycle methods. Allowing function components to acces states and other react features. 
// A state is where one stores property values that belong to the component
// Components serve the same purpose as a function in JS. They are independent and reusable bits of code. 
// Properties (props) are real values passed to and received by the component (function)
//Effects are code that run after render

import { useEffect, useState } from 'react'

// Importing reusable React components
// These are modular (independant and reusable) building blocks for the UI
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'

// Importing a third-party hook from the 'react-use' library for debouncing input
import { useDebounce } from 'react-use'

// Importing helper functions that interact with the Appwrite backend
import { getTrendingMovies, updateSearchCount } from './appwrite.js'

// The base URL of the external movie API (The Movie Database - TMDb)
const API_BASE_URL = 'https://api.themoviedb.org/3';

// Getting the API key securely from the environment variables (not hardcoded)
// `import.meta.env` is a Vite-specific way to access .env variables
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// Configuration object for fetch requests: sets HTTP method and authorization headers
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}` // Uses bearer token for API access, a type of token used for authentication and authorization. Holds user credentials and indicate authorization for requests and access
  }
}

// This is the main component of your app – the core building block of any React application
// Components are reusable UI pieces that return JSX (HTML-like syntax) and contain logic
const App = () => {

  // 🎯 useState: This React Hook lets you add state (data that changes over time) to your component

  // Holds the current value of the search input field
  const [searchTerm, setSearchTerm] = useState('');

  // Stores an error message string (if any occurs during fetch)
  const [errorMessage, setErrorMessage] = useState('');

  // The list of movies from the API (either from a search or popular)
  const [movieList, setMovieList] = useState([]);

  // Trending movies stored from your Appwrite backend
  const [trendingMovies, setTrendingMovies] = useState([]);

  // Indicates whether the app is currently loading data (used to show spinner)
  const [isLoading, setIsLoading] = useState(false);

  // Stores a debounced version of the user's input (updated after delay)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Keeps track of the current page number for pagination
  const [currentPage, setCurrentPage] = useState(1);

  //Stores total number of available pages
  const [totalPages, setTotalPages] = useState(1);

  // 🔁 useDebounce delays updating the search term for 500ms after the user stops typing
  // This prevents making API calls too often as the user types
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  // 🎬 This function fetches movies from the TMDb API
  // It supports both searching (via query) and browsing (via discover endpoint)
const fetchMovies = async (query = '', page = 1) => {
  setIsLoading(true);
  setErrorMessage('');

  try {
    const endpoint = query
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${page}`;

    const response = await fetch(endpoint, API_OPTIONS);

    if (!response.ok) {
      throw new Error('Failed to fetch movies');
    }

    const data = await response.json();

    if (data.results.length === 0) {
      setErrorMessage('No movies found.');
      setMovieList([]);
      return;
    }

    setMovieList(data.results || []);

    // ✅ Save the total number of pages returned by the API
    setTotalPages(data.total_pages);

    // Optional: Only save max of e.g. 500 (TMDb API only returns 500 pages max)
   /*  setTotalPages(Math.min(data.total_pages, 500)); */

    // setTotalPages(Math.min(data.total_pages, 500));

    if (query && data.results.length > 0) {
      await updateSearchCount(query, data.results[0]);
    }
  } catch (error) {
    console.error(`Error Fetching Movies: ${error}`);
    setErrorMessage('Error Fetching Movies. Please Try Again Later.');
  } finally {
    setIsLoading(false);
  }
};


  // 📈 Loads trending movies from Appwrite backend (separate from TMDb)
  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies); // Save results in state
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  // 🪝 useEffect Hook: Allows you to perform side effects in function components
  // This runs whenever debouncedSearchTerm or currentPage changes
  // React calls this function AFTER the render happens
  useEffect(() => {
    fetchMovies(debouncedSearchTerm, currentPage);
  }, [debouncedSearchTerm, currentPage]); // Dependency array: rerun only if these values change

  // On first page load, fetch trending movies once
  useEffect(() => {
    loadTrendingMovies();
  }, []); // Empty array = run once on component mount (component is created and inseted into the DOM)

  // When user types a new search, reset page to 1
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  // 🔽 JSX – what the component actually renders (UI structure)
  return (
    <main>
      <div className="pattern">
        <div className="wrapper">

          {/* === Header Section === */}
          <header>
            <img src="./hero.png" alt="Hero Banner" />
            <h1>
              Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle
            </h1>

            {/* Search component is a controlled input: value comes from state */}
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </header>

          {/* === Trending Movies Section (from Appwrite) === */}
          {trendingMovies.length > 0 && (
            <section className="trending">
              <h2>Trending Movies</h2>
              <ul>
                {trendingMovies.map((movie, index) => (
                  <li key={movie.$id}>
                    <p>{index + 1}</p>
                    <img src={movie.poster_url} alt={movie.title} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* === All Movies Section (from TMDb) === */}
          <section className="all-movies">
            <h2>All Movies</h2>

            {isLoading ? (
              // Show spinner while loading
              <Spinner />
            ) : errorMessage ? (
              // Show error message if API call failed
              <p className="text-red-500">{errorMessage}</p>
            ) : (
              <>
                <ul>
                  {/* Render each movie result using a reusable MovieCard component */}
                  {movieList.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </ul>

                {/* === Pagination Buttons === */}
                {/* This div wraps all pagination controls */}
                <div className="pagination-buttons">

                  {/* "First" button: goes to the first page (page 1) */}
                  <button
                    onClick={() => {
                      // Only navigate if we're not already on the first page AND not currently loading
                      if (currentPage !== 1 && !isLoading) {
                        window.scrollTo({ top: 1155, behavior: 'smooth' }); // Scroll to top of the page smoothly
                        setCurrentPage(1); // Change state to go to the first page
                      }
                    }}
                    // Disable button if we're on the first page or a fetch is in progress
                    disabled={currentPage === 1 || isLoading}
                  >
                    First
                  </button>

                  {/* "Previous" button: goes back one page */}
                  <button
                    onClick={() => {
                      // Only allow previous if we're not on page 1 and not loading
                      if (currentPage > 1 && !isLoading) {
                        window.scrollTo({ top: 1155, behavior: 'smooth' }); // Scroll to top
                        setCurrentPage((prev) => Math.max(prev - 1, 1)); // Decrease currentPage by 1 but never below 1
                      }
                    }}
                    // Disable if already on first page or data is loading
                    disabled={currentPage === 1 || isLoading}
                  >
                    Previous
                  </button>

                  {/* Display current page and total page count */}
                  <span>Page {currentPage} of {totalPages}</span>

                  {/* "Next" button: goes forward one page */}
                  <button
                    onClick={() => {
                      // Only go forward if not on the last page and not loading
                      if (currentPage < totalPages && !isLoading) {
                        window.scrollTo({ top: 1155, behavior: 'smooth' }); // Scroll to top
                        setCurrentPage((prev) => prev + 1); // Increase currentPage by 1
                      }
                    }}
                    // Disable if on last page or loading in progress
                    disabled={currentPage === totalPages || isLoading}
                  >
                     Next
                  </button>

                  {/* "Last" button: jumps directly to the last page */}
{/*                   <button
                    onClick={() => {
                      if (currentPage !== totalPages && !isLoading) {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setCurrentPage(totalPages); // Will now only go as far as totalPages from API
                      }
                    }}
                    disabled={currentPage === totalPages || isLoading}
                  >
                    Last
                  </button> */}
                </div>
              </>
            )}
          </section>

        </div>
      </div>
    </main>
  )
}

// Exporting the App component so it can be used in other files (like main.jsx)
export default App