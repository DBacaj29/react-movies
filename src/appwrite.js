// Import necessary modules from the Appwrite SDK (Software Developement Kit, tools, libraries, documentation, and code samples that developers use to build software applications)
// - Client: connects your app to Appwrite backend
// - Databases: used to interact with your database
// - ID: utility for generating unique document IDs
// - Query: used to filter and sort data when querying documents
import { Client, Databases, ID, Query } from 'appwrite'

// Load environment variables (these come from your `.env` file)
// `import.meta.env` is used by Vite.js (a build tool) to access environment variables
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

// Initialize the Appwrite client
const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')   // Appwrite API endpoint
    .setProject({PROJECT_ID})   //  Appwrite project ID

// Create an instance (object created from a class or constructor function) of the Databases service using the client
const database = new Databases(client);

/**
 * Function: updateSearchCount
 * Purpose: This function tracks how many times a particular search term is used.
 * If the term has been searched before, it increments its count.
 * Otherwise, it creates a new document for the term.
 * 
 * @param {string} searchTerm - The term the user searched for
 * @param {object} movie - A movie object containing metadata (id, poster_path, etc.)
 */
export const updateSearchCount = async (searchTerm, movie) => {
  try {
    // Step 1: Check if the search term already exists in the database
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal('searchTerm', searchTerm), // Filter by searchTerm field
    ]);

    // Step 2: If it exists, increment the count field
    if (result.documents.length > 0) {
      const doc = result.documents[0]; // Get the first (and only) matching document

      await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        count: doc.count + 1 // Update the count field by incrementing it
      });

    // Step 3: If it doesn't exist, create a new document with count set to 1
    } else {
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm,             // Store the search term
        count: 1,               // Initialize the count
        movie_id: movie.id,     // Store the movie's ID (can help with linking)
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`, // Store movie's poster URL
      });
    }
  } catch (error) {
    // Catch and log any errors during the process
    console.error(error);
  }
}

/**
 * Function: getTrendingMovies
 * Purpose: Retrieves the top 5 most searched movies based on search count
 * 
 * @returns {Array} - Array of movie documents sorted by popularity
 */
export const getTrendingMovies = async () => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(5),               // Limit the number of returned documents to 5
      Query.orderDesc("count")      // Order by 'count' field in descending order
    ]);

    return result.documents;        // Return the documents to be used in the UI
  } catch (error) {
    console.error(error);
  }
}
