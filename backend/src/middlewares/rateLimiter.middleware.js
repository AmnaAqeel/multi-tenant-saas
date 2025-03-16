import rateLimit from "express-rate-limit";

export const rateLimiterMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 10, // Limit each IP to 5 requests per window
  keyGenerator: (req) => req.ip, // Uses IP as identifier
  message: "Too many login attempts. Try again later.",
  handler: (req, res) => {
    if (req.ip === "127.0.0.1") {
      return res
        .status(200)
        .json({ message: "Rate limit bypassed for localhost." });
    }
    res
      .status(429)
      .json({ message: "Too many login attempts. Try again later." });
  },
  standardHeaders: true, // Return RateLimit headers
  legacyHeaders: false, // Disable deprecated headers
});

// export const rateLimiterMiddleware = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 10,
//   keyGenerator: (req) => req.ip, // ✅ Uses IP as identifier
//   handler: (req, res) => {
//     if (req.ip === "127.0.0.1") {
//       return res.status(200).json({ message: "Rate limit bypassed for localhost." });
//     }
//     res.status(429).json({ message: "Too many login attempts. Try again later." });
//   },
// });
