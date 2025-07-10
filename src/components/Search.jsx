// Define the Search functional component
// It receives two props from the parent (likely Home.jsx):
// - searchTerm: the current value of the input field (state)
// - setSearchTerm: a function to update that value
const Search = ({ searchTerm, setSearchTerm }) => {
  return (
    // Outer container for styling
    <div className="search">
      <div>
        {/* Search icon image next to the input field */}
        <img src="search.svg" alt="search" />
        {/* 
          - src="search.svg": path to the image file representing the search icon.
          - alt="search": alternate text for screen readers and fallback if image fails to load.
        */}

        {/* Controlled input field for typing the search term */}
        <input
          type="text" // This input accepts text only
          placeholder="Search through thousands of movies"
          // placeholder: appears when the input is empty; gives users a hint of what to type

          value={searchTerm}
          // The value is controlled by the parent component's state (via props)

          onChange={(e) => setSearchTerm(e.target.value)}
          // onChange event handler:
          // - (e) is the event object from the input
          // - e.target.value is the current text the user typed
          // - setSearchTerm updates the state in the parent component with that new value
        />
      </div>
    </div>
  );
};

// Export the Search component as the default export so it can be imported elsewhere
export default Search;
