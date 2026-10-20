/**
 * @fileoverview Input Sanitization and Schema Validation Middleware
 * @module middleware/validator
 */

/**
 * Sanitizes input string to prevent stored or reflected XSS vulnerabilities.
 * @param {any} val - Value to sanitize
 * @returns {any} Sanitized value
 */
function sanitizeInput(val) {
  if (typeof val === 'string') {
    return val.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  return val;
}

/**
 * Express middleware validating event plan generation request payloads.
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Next handler
 */
function validatePlanInput(req, res, next) {
  const { eventTitle, guestCount, budgetTotal } = req.body;

  if (eventTitle && typeof eventTitle === 'string' && eventTitle.length > 200) {
    return res.status(400).json({ error: 'Event title exceeds maximum allowed length of 200 characters.' });
  }

  if (guestCount !== undefined) {
    const count = parseInt(guestCount, 10);
    if (isNaN(count) || count < 1 || count > 50000) {
      return res.status(400).json({ error: 'Guest count must be a positive number between 1 and 50,000.' });
    }
    req.body.guestCount = count;
  }

  if (budgetTotal !== undefined) {
    const budget = parseFloat(budgetTotal);
    if (isNaN(budget) || budget <= 0 || budget > 100000000) {
      return res.status(400).json({ error: 'Budget must be a positive number up to 100,000,000.' });
    }
    req.body.budgetTotal = budget;
  }

  // Sanitize all text fields in request body
  for (const key of Object.keys(req.body)) {
    req.body[key] = sanitizeInput(req.body[key]);
  }

  next();
}

module.exports = {
  sanitizeInput,
  validatePlanInput
};
