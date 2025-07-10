// Import React Router hooks to get route params and navigation functionality
import { useParams, useNavigate } from 'react-router-dom';
// - useParams: lets you access dynamic route parameters (e.g., the `:id` from /movie/:id)
// - useNavigate: provides navigation capabilities like going back a page

// React hooks
import { useEffect, useState } from 'react';
// - useState: manage component-local state (movie data, loading, error)
// - useEffect: run code (side effect) when component mounts or updates

// Import your custom saved-movie management hook (assumes it's implemented elsewhere)
import { useSavedMovies } from './SavedMoviesContext';
// - useSavedMovies: custom hook (context) to access and modify the list of saved movies

// Setup constants for API interaction
const API_BASE_URL = 'https://api.themoviedb.org/3'; // Base URL for TMDB
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;   // TMDB API key from environment variables

// Configuration object for fetch() requests to TMDB
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`, // Secure bearer token authorization
  },
};

// Define the MovieDetail functional component
const MovieDetail = () => {
  const { id } = useParams();       // Extract the dynamic movie ID from URL
  const navigate = useNavigate();   // Allows navigation (e.g., back button)

  // Get access to saved movie state/functions from context
  const { savedMovies, saveMovie, removeMovie } = useSavedMovies();

  // Local state for the current movie being viewed
  const [movie, setMovie] = useState(null);   // Movie object from TMDB API
  const [loading, setLoading] = useState(true); // Indicates if data is still loading
  const [error, setError] = useState(null);     // Stores any fetch error messages

  // Boolean: is the current movie already saved?
  const isSaved = savedMovies.some((m) => m.id === movie?.id);
  // - Optional chaining protects against `movie` being null initially

  // Fetch the movie data from TMDB on component mount or when ID changes
  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);     // Show loading state
      setError(null);       // Reset previous errors

      try {
        const res = await fetch(`${API_BASE_URL}/movie/${id}`, API_OPTIONS);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.status_message || 'Failed to fetch movie');
        }

        const data = await res.json(); // Parse JSON response
        setMovie(data);                // Update movie state
      } catch (err) {
        setError(err.message);        // Capture and store any error messages
      } finally {
        setLoading(false);            // Hide loading state
      }
    };

    fetchMovie(); // Trigger the async function
  }, [id]);       // Only re-run if movie ID changes

  // Conditional rendering: loading, error, or empty result states
  if (loading) return <p className="text-white text-center mt-10">Loading movie details...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">Error: {error}</p>;
  if (!movie) return <p className="text-white text-center mt-10">No movie found.</p>;

  // If data is loaded and valid, render the movie detail UI
  return (
    <main className="min-h-screen bg-primary px-5 py-12 max-w-5xl mx-auto text-white">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)} // Navigate back to previous page
        className="mb-8 px-6 py-2 bg-gradient-to-r from-[#6e48aa] to-[#9d50bb] text-white rounded-xl shadow-lg hover:scale-105 transition-all"
      >
        ← Back
      </button>

      {/* Movie card container: flex layout */}
      <div className="flex flex-col md:flex-row gap-10 items-start bg-dark-100 p-6 rounded-2xl shadow-inner shadow-light-100/10">
        
        {/* Movie poster image */}
        <img
          className="w-full md:w-[300px] h-auto rounded-lg object-cover"
          src={
            movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`  // TMDB image URL
              : '/No-Poster-1.png'                                     // Fallback image
          }
          alt={movie.title}
        />

        {/* Movie details text column */}
        <div className="flex flex-col gap-4 flex-1">
          <h2 className="text-3xl font-bold text-white">{movie.title}</h2>

          {/* Genre list (if available) */}
          {movie.genres && movie.genres.length > 0 && (
            <p className="text-gray-100">
              <strong>Genres:</strong> {movie.genres.map((g) => g.name).join(', ')}
            </p>
          )}

          {/* Average vote (rating) */}
          <p className="text-gray-100">
            <strong>Rating:</strong> {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
          </p>

          {/* Release date */}
          <p className="text-gray-100">
            <strong>Release Date:</strong> {movie.release_date || 'N/A'}
          </p>

          {/* Overview/description */}
          <p className="text-light-200 leading-relaxed mt-2">
            <strong>Description:</strong> {movie.overview || 'No description available.'}
          </p>

          {/* Save/Remove button */}
          <button
            onClick={() => {
              if (isSaved) {
                removeMovie(movie.id); // If saved, remove it
              } else {
                saveMovie(movie);      // Otherwise, save it
              }
            }}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-[#3ca55c] to-[#b5ac49] text-white rounded-lg shadow-md hover:scale-105 transition-transform"
            disabled={loading} // Disable button while loading
          >
            {isSaved ? 'Tag ur' : 'Stoppa i fickan'}
            {/* Swedish phrases for remove/save */}
          </button>
        </div>
      </div>
    </main>
  );
};

// Export the MovieDetail component so it can be routed to from App.jsx
export default MovieDetail;
