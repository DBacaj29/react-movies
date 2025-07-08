import React from 'react';

const MovieCard = ({ 
  movie: { 
    title,             // Movie title
    vote_average,      // Average rating
    poster_path,       // Poster image relative path
    release_date,      // Release date string "YYYY-MM-DD"
    original_language  // Language code
  }, 
  isSaved,             // Boolean: is this movie saved already?
  onSave,              // Function to save the movie
  onRemove             // Function to remove the movie from saved list
}) => {
  return (
    <div className="movie-card">
      {/* Movie poster */}
      <img
        src={poster_path 
          ? `https://image.tmdb.org/t/p/w500/${poster_path}`  // Full poster URL
          : '/No-Poster-1.png'                                // Fallback if no poster
        }
        alt={title}
      />

      <div className="mt-4">
        {/* Movie title */}
        <h3>{title}</h3>

        {/* Movie info row */}
        <div className="content">
          {/* Rating with star icon */}
          <div className="rating">
            <img src="star.svg" alt="Star Icon" />
            <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
          </div>

          <span>•</span>

          {/* Original language */}
          <p className="lang">{original_language}</p>

          <span>•</span>

          {/* Release year extracted from release_date */}
          <p className="year">
            {release_date 
              ? release_date.split('-')[0]
              : 'N/A'
            }
          </p>
        </div>

        {/* Save/Remove button */}
        <button
          onClick={(e) => {
            e.preventDefault(); // Prevent link navigation when button clicked
            isSaved ? onRemove() : onSave();
          }}
          className="mt-4 px-4 py-2 bg-gradient-to-r from-[#3ca55c] to-[#b5ac49] text-white rounded-lg shadow-md hover:scale-105 transition-transform"
        >
          {isSaved ? 'Tag ur ' : 'Stoppa i fickan'}
        </button>
      </div>
    </div>
  );
};

export default MovieCard;
