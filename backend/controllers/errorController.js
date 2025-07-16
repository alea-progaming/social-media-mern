// Centralized error-handling middleware for the entire app
// This ensures consistency in how we handle and return errors to the client

module.exports = (err, req, res, next) => {
  // Default to 500 if no status code is explicitly set (500 = Internal Server Error)
  err.statusCode = err.statusCode || 500;
  // Default to "error" status (vs. "fail" for client-side issues)
  err.status = err.status || "error";

  // sends a JSON response containing error details
  res.status(err.statusCode).json({
    // these are the response it sends
    status: err.status, // fail or error
    error: err, // Full error object
    message: err.message, // Human-readable error message
    // stack here is where the errors occur, more notes in Obsidian
    stack: err.stack, // Stack trace (great for debugging)
  });
};
