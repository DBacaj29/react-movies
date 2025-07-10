// Define the MovieCard functional component
// Props are destructured in two levels:
// - The first destructures the `movie` object from props
// - The second destructures individual movie fields from the `movie` object
const MovieCard = ({ 
  movie: { 
    title,             // Movie title string
    vote_average,      // Average rating (float), e.g., 7.3
    poster_path,       // Path to the poster image (e.g., '/abc123.jpg')
    release_date,      // Date string in the format 'YYYY-MM-DD'
    original_language  // Language code string, e.g., 'en', 'fr'
  }, 
  isSaved,             // Boolean: indicates if the movie is saved to the user's list
  onSave,              // Function: called when the user wants to save this movie
  onRemove             // Function: called when the user wants to remove this movie
}) => {
  return (
    <div className="movie-card">
      {/* Movie Poster Image */}
      <img
        src={poster_path 
          ? `https://image.tmdb.org/t/p/w500/${poster_path}`  // If poster_path exists, use TMDB full URL
          : '/No-Poster-1.png'                                // Otherwise use a local fallback image
        }
        alt={title} // Sets alt text to the movie title for accessibility
      />

      <div className="mt-4"> {/* Adds margin-top to separate content from image */}

        {/* Movie Title */}
        <h3>{title}</h3>

        {/* Metadata Row: Rating, Language, Year */}
        <div className="content">
          
          {/* Rating Section */}
          <div className="rating">
            <img src="star.svg" alt="Star Icon" />
            <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
            {/* 
              - If vote_average exists, show it rounded to 1 decimal
              - Otherwise, show 'N/A' as fallback
            */}
          </div>

          <span>•</span> {/* Separator dot */}

          {/* Language Code */}
          <p className="lang">{original_language}</p>

          <span>•</span> {/* Separator dot */}

          {/* Release Year */}
          <p className="year">
            {
              release_date 
              ? release_date.split('-')[0] // Extract the year (first part of YYYY-MM-DD)
              : 'N/A'                      // Fallback if release_date is missing
            }
          </p>
        </div>

        {/* Button to Save or Remove Movie */}
        <button
          onClick={(e) => {
            e.preventDefault(); // Prevents default behavior, e.g., navigating away when wrapped in <Link>
            isSaved ? onRemove() : onSave(); // Conditional logic: if already saved, remove it; otherwise save it
          }}
          className="mt-4 px-4 py-2 bg-gradient-to-r from-[#3ca55c] to-[#b5ac49] text-white rounded-lg shadow-md hover:scale-105 transition-transform"
        >
          {isSaved ? 'Tag ur ' : 'Stoppa i fickan'}
          {/* 
            - Button text depends on saved state
            - 'Tag ur' = remove (Swedish for "Take out")
            - 'Stoppa i fickan' = save (Swedish for "Put in your pocket")
          */}
        </button>
      </div>
    </div>
  );
};

// Export MovieCard so it can be reused in other files like Home.jsx
export default MovieCard;
