import { validationResult } from "express-validator";

/**
 * Middleware to validate inputs based on given rules.
 * If validation fails, it returns a 400 error with detailed messages.
 */

  export const validateInput = (validations) => {
    return async (req, res, next) => {
      // console.log("Incoming request body in validation:", req.body); // ✅ Debug
      await Promise.all(validations.map((validation) => validation.run(req))); // await validations

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // console.log("Validation errors detected:", errors.array()); // ✅ Log validation errors
        return res.status(400).json({ errors: errors.array() });
      }

      next();
    };
  };
