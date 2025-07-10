// Import required classes from the Appwrite SDK
import { Client, Databases, Query } from 'appwrite';
// - Client: used to initialize and configure the Appwrite connection
// - Databases: provides methods to interact with database collections
// - Query: helps build queries for filtering/sorting database data

// Initialize a new Appwrite client
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT) 
  // Set the API endpoint for your Appwrite server (from .env)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID); 
  // Set the project ID so Appwrite knows which project to interact with

// Create a new instance of the Databases service using the client
const databases = new Databases(client);

// Define constants for your database and collection IDs
// These should be stored in your .env file and injected via Vite
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const SEARCH_COLLECTION_ID = import.meta.env.VITE_APPWRITE_SEARCH_COLLECTION_ID;

// ------------------------------
// Function: getTrendingMovies
// ------------------------------
// Fetches top 5 most-searched movies from the Appwrite backend
export const getTrendingMovies = async () => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,                     // The ID of the database to query
      SEARCH_COLLECTION_ID,           // The ID of the collection to pull documents from
      [
        Query.orderDesc('count'),     // Sort by 'count' field, descending
        Query.limit(5),               // Limit the results to 5 documents
      ]
    );

    // Map over the documents and return simplified movie objects
    return response.documents.map((doc) => ({
      $id: doc.$id,                   // The unique document ID in Appwrite
      movie_id: doc.movie_id,        // The TMDB movie ID
      title: doc.title,              // Movie title from TMDB
      poster_url: doc.poster_url     // Poster URL to display in the UI
    }));
  } catch (error) {
    console.error('Error in getTrendingMovies:', error);
    return []; // Fallback to an empty array if something goes wrong
  }
};

// ------------------------------
// Function: updateSearchCount
// ------------------------------
// Either increments the count of an existing search term or creates a new document
export const updateSearchCount = async (query, movie) => {
  try {
    // First, check if this query already exists in the database
    const existing = await databases.listDocuments(
      DATABASE_ID,
      SEARCH_COLLECTION_ID,
      [Query.equal('query', query)]  // Find document where 'query' field matches
    );

    if (existing.documents.length > 0) {
      // If a document exists, update it by incrementing the count
      const doc = existing.documents[0];

      await databases.updateDocument(
        DATABASE_ID,
        SEARCH_COLLECTION_ID,
        doc.$id,                      // Document ID to update
        {
          count: doc.count + 1       // Increment the count by 1
        }
      );
    } else {
      // If the query is new, create a new document with initial count = 1
      await databases.createDocument(
        DATABASE_ID,
        SEARCH_COLLECTION_ID,
        movie.$id,                   // Use TMDB movie ID as the document ID (ensures uniqueness)
        {
          query,                     // Search term the user entered
          count: 1,                  // First time searched, so count is 1
          title: movie.title,        // Store the movie title
          poster_url: movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
            : '',                    // Construct poster URL using TMDB path or fallback to empty
          movie_id: movie.id         // TMDB movie ID
        }
      );
    }
  } catch (error) {
    console.error('Error in updateSearchCount:', error);
    // Catch and log any API or logic errors
  }
};

// Export as default as well (optional)
export default {
  getTrendingMovies,
  updateSearchCount,
};
