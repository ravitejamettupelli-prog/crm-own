const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

// Customer validation rules
const validateCustomer = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .escape(),
  body('contact')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Contact must be between 1 and 50 characters')
    .escape(),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('history')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('History must not exceed 1000 characters')
    .escape(),
  handleValidationErrors
];

// Lead validation rules
const validateLead = [
  body('customerId')
    .isMongoId()
    .withMessage('Valid customer ID is required'),
  body('status')
    .isIn(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed'])
    .withMessage('Invalid status'),
  body('priority')
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
    .escape(),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid due date format'),
  body('reminderDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid reminder date format'),
  handleValidationErrors
];

// User validation rules
const validateUser = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('Invalid role'),
  handleValidationErrors
];

module.exports = {
  validateCustomer,
  validateLead,
  validateUser,
  handleValidationErrors
};
