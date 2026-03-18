class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
    this.name = "AppError";
  }
}

function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const message = err.message || "Internal server error";

  if (process.env.NODE_ENV !== "test") {
    console.error(`[ERROR] ${status} ${message}`, err.stack);
  }

  res.status(status).json({ error: message });
}

module.exports = { AppError, errorHandler };
