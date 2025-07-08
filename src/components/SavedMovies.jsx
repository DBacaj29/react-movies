import { useSavedMovies } from '../context/SavedMoviesContext';
import MovieCard from '../components/MovieCard';

const SavedMovies = () => {
  const { savedMovies } = useSavedMovies();

  return (
    <main className="min-h-screen bg-primary px-5 py-12 max-w-7xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-6">Saved Movies</h1>

      {savedMovies.length === 0 ? (
        <p>No saved movies yet.</p>
      ) : (
        <ul className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {savedMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </ul>
      )}
    </main>
  );
};

export default SavedMovies;
