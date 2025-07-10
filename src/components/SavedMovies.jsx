// Import the custom hook `useSavedMovies` from the SavedMoviesContext file.
// This hook provides access to the saved movies state and any related logic managed by context.
import { useSavedMovies } from '../context/SavedMoviesContext';

// Import the `MovieCard` component from the components folder.
// This component will be used to display each individual movie's details in a card format.
import MovieCard from '../components/MovieCard';

// Define a functional component called `SavedMovies`.
// Functional components are JavaScript functions that return React elements (JSX).
const SavedMovies = () => {
  // Use object destructuring to extract `savedMovies` from the object
  // returned by the `useSavedMovies` hook.
  // This allows us to access the array of saved movie objects.
  const { savedMovies } = useSavedMovies();

  // The component returns JSX that React will render as HTML in the DOM.
  return (
    // The <main> element is a semantic HTML5 tag indicating the main content of the page.
    // It has several Tailwind CSS classes for styling:
    // - `min-h-screen`: minimum height is full viewport height.
    // - `bg-primary`: background color defined as "primary" in Tailwind config.
    // - `px-5 py-12`: horizontal and vertical padding respectively.
    // - `max-w-7xl mx-auto`: max width with automatic horizontal centering.
    // - `text-white`: white text color.
    <main className="min-h-screen bg-primary px-5 py-12 max-w-7xl mx-auto text-white">
      
      {/* 
        Header section displaying the page title.
        <h1> is a top-level heading tag in HTML, important for SEO and accessibility.
        Tailwind classes:
        - `text-3xl`: large font size.
        - `font-bold`: bold text.
        - `mb-6`: margin-bottom for spacing below the header.
      */}
      <h1 className="text-3xl font-bold mb-6">Saved Movies</h1>

      {/*
        Conditional rendering using a ternary operator:
        Checks if the savedMovies array is empty by checking its length property.
        If length is 0 (meaning no movies saved), it renders a paragraph <p> with a message.
        Otherwise, it renders a grid list of saved movies.
      */}
      {savedMovies.length === 0 ? (
        // Paragraph element showing a message when there are no saved movies.
        <p>No saved movies yet.</p>
      ) : (
        // If savedMovies array is not empty, render a <ul> (unordered list).
        // Tailwind classes applied:
        // - `grid`: applies CSS Grid layout.
        // - `grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`: responsive grid columns for different screen sizes.
        // - `gap-5`: gap between grid items.
        <ul className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {/*
            Map over each movie object in the savedMovies array.
            The `.map()` method takes a callback that receives each movie object.
            For each movie, render a `MovieCard` component.
          */}
          {savedMovies.map((movie) => (
            /*
              React requires a unique `key` prop on elements in a list to optimize rendering and reconciliation.
              Here, `movie.id` is used as the unique key.
              The `movie` object is passed as a prop to the MovieCard component.
            */
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </ul>
      )}
    </main>
  );
};

// Export the `SavedMovies` component as the default export of this module.
// This allows other files to import this component without curly braces.
export default SavedMovies;
