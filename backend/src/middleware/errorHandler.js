const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Handle Joi validation errors
  if (err.isJoi) {
    return res.status(400).json({
      error: req.t('validation.error', {
        details: err.details[0].message
      })
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: req.t('auth.invalid_token')
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: req.t('auth.token_expired')
    });
  }

  // Handle DynamoDB errors
  if (err.code === 'ResourceNotFoundException') {
    return res.status(404).json({
      error: req.t('errors.resource_not_found')
    });
  }

  // Default error
  res.status(500).json({
    error: req.t('errors.server_error')
  });
};

module.exports = errorHandler; 