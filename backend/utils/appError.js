// Custom error class extending JavaScript's built-in Error
// Used to create operational errors, not programming bugs
class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // Call the parent Error class constructor

    this.statusCode = statusCode;

    // set status basedon whether it's a client (4xx) or server (5xx) error
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    // capture stack trace and exclude this constructor from it
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
