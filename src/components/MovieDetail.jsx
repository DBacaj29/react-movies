import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Example: import your saved movies context/hook here
import { useSavedMovies } from './SavedMoviesContext';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  },
};

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Hook for managing saved movies (you must implement this)
  const { savedMovies, saveMovie, removeMovie } = useSavedMovies();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if this movie is saved
  const isSaved = savedMovies.some((m) => m.id === movie?.id);

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/movie/${id}`, API_OPTIONS);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.status_message || 'Failed to fetch movie');
        }
        const data = await res.json();
        setMovie(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  if (loading) return <p className="text-white text-center mt-10">Loading movie details...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">Error: {error}</p>;
  if (!movie) return <p className="text-white text-center mt-10">No movie found.</p>;

  return (
    <main className="min-h-screen bg-primary px-5 py-12 max-w-5xl mx-auto text-white">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-8 px-6 py-2 bg-gradient-to-r from-[#6e48aa] to-[#9d50bb] text-white rounded-xl shadow-lg hover:scale-105 transition-all"
      >
        ← Back
      </button>

      <div className="flex flex-col md:flex-row gap-10 items-start bg-dark-100 p-6 rounded-2xl shadow-inner shadow-light-100/10">
        {/* Poster */}
        <img
          className="w-full md:w-[300px] h-auto rounded-lg object-cover"
          src={movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : '/No-Poster-1.png'}
          alt={movie.title}
        />

        {/* Details */}
        <div className="flex flex-col gap-4 flex-1">
          <h2 className="text-3xl font-bold text-white">{movie.title}</h2>

          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <p className="text-gray-100">
              <strong>Genres:</strong> {movie.genres.map((g) => g.name).join(', ')}
            </p>
          )}

          <p className="text-gray-100">
            <strong>Rating:</strong> {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
          </p>

          <p className="text-gray-100">
            <strong>Release Date:</strong> {movie.release_date || 'N/A'}
          </p>

          <p className="text-light-200 leading-relaxed mt-2">
            <strong>Description:</strong> {movie.overview || 'No description available.'}
          </p>

          {/* Save/Remove Button */}
          <button
            onClick={() => {
              if (isSaved) {
                removeMovie(movie.id);
              } else {
                saveMovie(movie);
              }
            }}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-[#3ca55c] to-[#b5ac49] text-white rounded-lg shadow-md hover:scale-105 transition-transform"
            disabled={loading}
          >
            {isSaved ? 'Tag ur' : 'Stoppa i fickan'}
          </button>
        </div>
      </div>
    </main>
  );
};

export default MovieDetail;
