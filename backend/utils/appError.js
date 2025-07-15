class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statuseCode;
    this.status = `${statusCode}`.startsWith("4") ? "Fail" : "Error";
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
