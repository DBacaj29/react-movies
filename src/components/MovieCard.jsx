// Import React — this is required for defining React components.
import React from 'react'

// Define a functional component named "MovieCard".
// We're using **destructuring** to extract properties directly from the `movie` prop. This means that we extract values from props objects and assign them into variables.
// This improves readability and avoids repetitive code like movie.title, movie.vote_average, etc.
const MovieCard = ({ 
  movie: { 
    title,             // The title of the movie
    vote_average,      // The average rating (score) given to the movie
    poster_path,       // Relative path to the movie's poster image
    release_date,      // Full release date, e.g., "2022-07-15"
    original_language  // ISO code of the movie's original language (e.g., "en", "fr")
  } 
}) => {
  // Return JSX — this is the markup React uses to describe UI elements.
  return (
    <div className="movie-card">
      {/* Movie poster image */}
      <img
        src={poster_path 
          ? `https://image.tmdb.org/t/p/w500/${poster_path}`  // Full poster image URL from TMDB
          : '/No-Poster-1.png'                                // Fallback image if no poster is available
        }
        alt={title} // For accessibility — helps screen readers describe the image
      />

      <div className="mt-4">
        {/* Movie title */}
        <h3>{title}</h3>

        {/* Movie metadata row: rating, language, release year */}
        <div className="content">
          
          {/* Rating section */}
          <div className="rating">
            {/* Star icon image */}
            <img src="star.svg" alt="Star Icon" />
            
            {/* Show rating, rounded to 1 decimal, or 'N/A' if not available */}
            <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
          </div>

          {/* Separator */}
          <span>•</span>

          {/* Original language (e.g., "en", "es") */}
          <p className="lang">{original_language}</p>

          {/* Separator */}
          <span>•</span>

          {/* Display only the year from the release date, or 'N/A' if missing */}
          <p className="year">
            {release_date 
              ? release_date.split('-')[0]  // Extract the year (e.g., "2022") from "2022-07-15"
              : 'N/A'
            }
          </p>
        </div>
      </div>
    </div>
  )
}

// Export the component so it can be imported and used in other files (like App.jsx)
export default MovieCard