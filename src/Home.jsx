// Import React hooks and utilities
import { useEffect, useState, useRef } from 'react';  
//  useState: declares state variables in functional components  
//  useEffect: runs side effects (data fetching, subscriptions) after render  
//  useRef: holds mutable values (e.g., DOM refs) that persist across renders

import { Link } from 'react-router-dom';  
//  Link: component to navigate between routes without full page reload

// Import child components
import Search from './components/Search.jsx';  
import Spinner from './components/Spinner.jsx';  
import MovieCard from './components/MovieCard.jsx';  

// Import a debounce hook and Appwrite service functions
import { useDebounce } from 'react-use';  
//  useDebounce: delays updates to avoid rapid successive calls
import { getTrendingMovies, updateSearchCount } from './appwrite.js';  
//  getTrendingMovies: fetches top searches from backend  
//  updateSearchCount: logs search frequency

// Base URL and authentication options for The Movie Database API
const API_BASE_URL = 'https://api.themoviedb.org/3';  
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;  
//  import.meta.env: Vite’s way to access environment variables at build time
const API_OPTIONS = {
  method: 'GET',  // HTTP method
  headers: {
    accept: 'application/json',  
    Authorization: `Bearer ${API_KEY}`  // Bearer token auth
  }
};

const Home = () => {
  // Local state declarations
  const [searchTerm, setSearchTerm] = useState('');  
  //  searchTerm: current text input; setSearchTerm: updates it

  const [errorMessage, setErrorMessage] = useState('');  
  //  errorMessage: stores any fetch errors to display

  const [movieList, setMovieList] = useState([]);  
  //  movieList: array of movies from search or discover

  const [trendingMovies, setTrendingMovies] = useState([]);  
  //  trendingMovies: top 5 from Appwrite backend

  const [isLoading, setIsLoading] = useState(false);  
  //  isLoading: toggles Spinner display

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');  
  //  debouncedSearchTerm: value updated after debounce delay

  const [currentPage, setCurrentPage] = useState(1);  
  //  currentPage: pagination tracker

  const [totalPages, setTotalPages] = useState(1);  
  //  totalPages: from API response

  const [genres, setGenres] = useState([]);  
  //  genres: list of available movie genres

  const [selectedGenre, setSelectedGenre] = useState('');  
  //  selectedGenre: for filtering by genre ID

  const [minRating, setMinRating] = useState(0);  
  //  minRating: for filtering by vote_average

  const allMoviesRef = useRef(null);  
  //  allMoviesRef: DOM reference to scroll into view

  // Persisted savedMovies: initialized from localStorage
  const [savedMovies, setSavedMovies] = useState(() => {
    try {
      const saved = localStorage.getItem('savedMovies');
      return saved ? JSON.parse(saved) : [];  
      //  JSON.parse: converts stored string back to JS array
    } catch {
      return [];  // Fallback if parsing fails
    }
  });

  // Debounce the searchTerm—to wait 500ms after typing stops
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  // Fetch movies from TMDB API (search or discover)
  const fetchMovies = async (query = '', page = 1) => {
    setIsLoading(true);             // Show spinner
    setErrorMessage('');            // Clear previous errors

    try {
      // Choose endpoint based on whether user provided a query
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${page}`;

      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error('Failed to fetch movies');  
        // Non-2xx status codes trigger catch
      }

      const data = await response.json();  
      // Parse JSON payload

      if (data.results.length === 0) {
        setErrorMessage('No movies found.');
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);  
      setTotalPages(data.total_pages);  

      // If this was a search, log it and refresh trending
      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
        await loadTrendingMovies();  
      }
    } catch (error) {
      console.error(`Error Fetching Movies: ${error}`);
      setErrorMessage('Error Fetching Movies. Please Try Again Later.');
    } finally {
      setIsLoading(false);  // Always hide spinner when done
    }
  };

  // Load trending movies from Appwrite backend
  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  };

  // On mount: fetch available genres for filter dropdown
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/genre/movie/list`, API_OPTIONS);
        const data = await res.json();
        setGenres(data.genres);
      } catch (err) {
        console.error("Error fetching genres:", err);
      }
    };
    fetchGenres();
  }, []);  
  // Empty deps array: runs once after initial render

  // Refetch movies when debounced term or page changes
  useEffect(() => {
    fetchMovies(debouncedSearchTerm, currentPage);
  }, [debouncedSearchTerm, currentPage]);

  // On mount: load trending movies once
  useEffect(() => {
    loadTrendingMovies();
  }, []);

  // Reset to first page whenever a new search begins
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  // Persist savedMovies array to localStorage on every change
  useEffect(() => {
    localStorage.setItem('savedMovies', JSON.stringify(savedMovies));
  }, [savedMovies]);

  // Add a movie to saved list if not already present
  const handleSaveMovie = (movie) => {
    if (!savedMovies.some((m) => m.id === movie.id)) {
      setSavedMovies((prev) => [...prev, movie]);
    }
  };

  // Remove a movie from saved list
  const handleRemoveMovie = (movie) => {
    setSavedMovies((prev) => prev.filter((m) => m.id !== movie.id));
  };

  // Apply genre and rating filters to movieList before rendering
  const filteredMovies = movieList.filter((movie) => {
    const meetsRating = movie.vote_average >= minRating;
    const meetsGenre = !selectedGenre || movie.genre_ids?.includes(Number(selectedGenre));
    return meetsRating && meetsGenre;
  });

  return (
    <main>
      <div className="pattern">
        <div className="wrapper">

          {/* Header with hero image and search bar */}
          <header>
            <img src="./hero.png" alt="Hero Banner" />
            <h1>
              Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle
            </h1>
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </header>

          {/* Trending Movies */}
          {trendingMovies.length > 0 && (
            <section className="trending">
              <h2>Trending Movies</h2>
              <ul>
                {trendingMovies.map((movie, index) => (
                  <li key={movie.$id}>
                    <p>{index + 1}</p>  {/* Display rank */}
                    <Link to={`/movie/${movie.movie_id}`}>
                      <img
                        className="cursor-pointer"
                        src={movie.poster_url}
                        alt={movie.title}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Filters Section */}
          <section className="movie-filters text-white mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Genre dropdown */}
              <select
                className="bg-dark-100 text-white px-4 py-2 rounded-lg"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                <option value="">All Genres</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>

              {/* Rating slider */}
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full max-w-xs"
              />
              <span className="text-light-200">Min Rating: {minRating.toFixed(1)}</span>
            </div>
          </section>

          {/* All Movies Listing */}
          <div ref={allMoviesRef}></div> {/* Anchor for scroll-into-view */}
          <section className="all-movies">
            <h2>All Movies</h2>
            {/* Show spinner while loading */}
            {isLoading ? (
              <Spinner />  
            ) : errorMessage ? (
              <p className="text-red-500">{errorMessage}</p>
            ) : (
              <>
                <ul>
                  {filteredMovies.map((movie) => (
                    <li key={movie.id}>
                      <Link to={`/movie/${movie.id}`}>
                        <MovieCard
                          movie={movie}
                          isSaved={savedMovies.some((m) => m.id === movie.id)}
                          onSave={() => handleSaveMovie(movie)}
                          onRemove={() => handleRemoveMovie(movie)}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Pagination Controls */}
                <div className="pagination-buttons">
                  {/* First page */}
                  <button
                    onClick={() => {
                      if (currentPage !== 1 && !isLoading) {
                        allMoviesRef.current?.scrollIntoView({ behavior: 'smooth' });
                        setCurrentPage(1);
                      }
                    }}
                    disabled={currentPage === 1 || isLoading}
                  >
                    First
                  </button>

                  {/* Previous page */}
                  <button
                    onClick={() => {
                      if (currentPage > 1 && !isLoading) {
                        allMoviesRef.current?.scrollIntoView({ behavior: 'smooth' });
                        setCurrentPage((prev) => Math.max(prev - 1, 1));
                      }
                    }}
                    disabled={currentPage === 1 || isLoading}
                  >
                    Previous
                  </button>

                  <span>Page {currentPage} of {totalPages}</span>

                  {/* Next page */}
                  <button
                    onClick={() => {
                      if (currentPage < totalPages && !isLoading) {
                        allMoviesRef.current?.scrollIntoView({ behavior: 'smooth' });
                        setCurrentPage((prev) => prev + 1);
                      }
                    }}
                    disabled={currentPage === totalPages || isLoading}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </section>

          {/* Saved Movies Section */}
          {savedMovies.length > 0 && (
            <section className="all-movies mt-10">
              <h2>Saved Movies</h2>
              <ul>
                {savedMovies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    isSaved={true}
                    onRemove={() => handleRemoveMovie(movie)}
                  />
                ))}
              </ul>
            </section>
          )}

        </div>
      </div>
    </main>
  );
};

export default Home;  
// Export component so it can be imported elsewhere
