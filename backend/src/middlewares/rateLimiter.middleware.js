import rateLimit from "express-rate-limit";

export const rateLimiterMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 10, // Limit each IP to 5 requests per window
  message: "Too many login attempts. Try again later.",
  standardHeaders: true, // Return RateLimit headers
  legacyHeaders: false, // Disable deprecated headers
});
