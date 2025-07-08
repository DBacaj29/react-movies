
import { createContext, useContext, useEffect, useState } from 'react';

const SavedMoviesContext = createContext();

export const useSavedMovies = () => useContext(SavedMoviesContext);

export const SavedMoviesProvider = ({ children }) => {
  const [savedMovies, setSavedMovies] = useState([]);

  // Load from localStorage on startup
  useEffect(() => {
    const stored = localStorage.getItem('savedMovies');
    if (stored) setSavedMovies(JSON.parse(stored));
  }, []);

  // Sync to localStorage on changes
  useEffect(() => {
    localStorage.setItem('savedMovies', JSON.stringify(savedMovies));
  }, [savedMovies]);

  const saveMovie = (movie) => {
    if (!savedMovies.find(m => m.id === movie.id)) {
      setSavedMovies(prev => [...prev, movie]);
    }
  };

  const removeMovie = (id) => {
    setSavedMovies(prev => prev.filter(m => m.id !== id));
  };


    return ( 
            <SavedMoviesContext.Provider value={{ savedMovies, saveMovie, removeMovie }}>
      {children}
    </SavedMoviesContext.Provider>
     );
}
 