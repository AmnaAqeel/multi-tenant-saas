import { validationResult } from "express-validator";

/**
 * Middleware to validate inputs based on given rules.
 * If validation fails, it returns a 400 error with detailed messages.
 */

export const validateInput = (validations) => {
  return async (req, res, next) => {
    Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    next();
  };
};
