export const errorHandler = (err, req, res, next) => {
  console.error("Server Error:", err.stack); //  Logs full error stack for debugging

    res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.stack : null, // Show error stack in dev mode only
  });
}