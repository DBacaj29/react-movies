// Import React utilities for state management and context API
import { createContext, useContext, useEffect, useState } from 'react';
// - createContext: creates a new Context object for global state
// - useContext: allows components to consume context values
// - useEffect: manages side effects (e.g., syncing with localStorage)
// - useState: holds the list of saved movies

// Create a Context for saved movies. This holds the shared state and functions.
const SavedMoviesContext = createContext();
// Now any component inside a provider can access saved movies data through this context.

// Create a custom hook so components can use the context more easily
export const useSavedMovies = () => useContext(SavedMoviesContext);
// This avoids repetitive useContext calls and makes your components cleaner.
// Example usage: const { savedMovies, saveMovie, removeMovie } = useSavedMovies();


// The provider component wraps parts of the app that need access to saved movie state
export const SavedMoviesProvider = ({ children }) => {
  // Declare the local state to hold saved movies
  const [savedMovies, setSavedMovies] = useState([]);


  // When the provider first mounts, try to load saved movies from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('savedMovies'); // Get string from localStorage
    if (stored) setSavedMovies(JSON.parse(stored));     // Parse and update state if found
  }, []);
  // [] means this runs only once, on component mount


  // Whenever savedMovies changes, sync the state back to localStorage
  useEffect(() => {
    localStorage.setItem('savedMovies', JSON.stringify(savedMovies));
    // JSON.stringify converts the array into a string for storage
  }, [savedMovies]);


  // Function to add a movie to saved list if it's not already there
  const saveMovie = (movie) => {
    if (!savedMovies.find(m => m.id === movie.id)) {
      // If the movie is not already saved (no duplicate ID)
      setSavedMovies(prev => [...prev, movie]);
      // Use spread syntax to create a new array and add the movie
    }
  };


  // Function to remove a movie by its ID from the saved list
  const removeMovie = (id) => {
    setSavedMovies(prev => prev.filter(m => m.id !== id));
    // filter creates a new array excluding the movie with the given ID
  };



  // Return a provider component that wraps children and passes down context values
  return (
    <SavedMoviesContext.Provider value={{ savedMovies, saveMovie, removeMovie }}>
      {children}
    </SavedMoviesContext.Provider>
    // All children inside <SavedMoviesProvider> will now have access to this context
    // They can call useSavedMovies() to access savedMovies, saveMovie, and removeMovie
  );
}

 