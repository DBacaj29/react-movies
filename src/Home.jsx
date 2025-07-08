import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

import Search from './components/Search.jsx';
import Spinner from './components/Spinner.jsx';
import MovieCard from './components/MovieCard.jsx';

import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from './appwrite.js';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [minRating, setMinRating] = useState(0);
  const allMoviesRef = useRef(null);


  // Saved movies state (persisted in localStorage)
  const [savedMovies, setSavedMovies] = useState(() => {
    try {
      // Try loading from localStorage on initial render
      const saved = localStorage.getItem('savedMovies');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Debounce user input to avoid excessive API calls
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

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
    setTotalPages(data.total_pages);

    if (query && data.results.length > 0) {
      await updateSearchCount(query, data.results[0]);
      await loadTrendingMovies();  // <-- refresh trending movies list here
    }
  } catch (error) {
    console.error(`Error Fetching Movies: ${error}`);
    setErrorMessage('Error Fetching Movies. Please Try Again Later.');
  } finally {
    setIsLoading(false);
  }
};


  // Load trending movies from backend (Appwrite)
  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  };

  // Fetch genres for filter dropdown
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

  // Fetch movies on search term or page change
  useEffect(() => {
    fetchMovies(debouncedSearchTerm, currentPage);
  }, [debouncedSearchTerm, currentPage]);

  // Load trending movies once on component mount
  useEffect(() => {
    loadTrendingMovies();
  }, []);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  // Persist saved movies to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('savedMovies', JSON.stringify(savedMovies));
  }, [savedMovies]);

  // Handler to save a movie
  const handleSaveMovie = (movie) => {
    if (!savedMovies.some((m) => m.id === movie.id)) {
      setSavedMovies((prev) => [...prev, movie]);
    }
  };

  // Handler to remove a movie from saved
  const handleRemoveMovie = (movie) => {
    setSavedMovies((prev) => prev.filter((m) => m.id !== movie.id));
  };

  // Filter movies by selected genre and rating before displaying
  const filteredMovies = movieList.filter((movie) => {
    const meetsRating = movie.vote_average >= minRating;
    const meetsGenre =
      !selectedGenre || movie.genre_ids?.includes(Number(selectedGenre));
    return meetsRating && meetsGenre;
  });

  return (
    <main>
      <div className="pattern">
        <div className="wrapper">

          {/* Header with hero image and search input */}
          <header>
            <img src="./hero.png" alt="Hero Banner" />
            <h1>
              Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle
            </h1>

            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </header>

          {/* Trending movies from backend */}
          {trendingMovies.length > 0 && (
            <section className="trending">
              <h2>Trending Movies</h2>
              <ul>
                {trendingMovies.map((movie, index) => (
                  <li key={movie.$id}>
                    <p>{index + 1}</p>
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

          {/* Filters for genre and rating */}
          <section className="movie-filters text-white mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
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

          {/* All movies listing */}
            <div ref={allMoviesRef}></div>
            <section className="all-movies">

            <h2>All Movies</h2>

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


                {/* Pagination controls */}
                <div className="pagination-buttons">
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
