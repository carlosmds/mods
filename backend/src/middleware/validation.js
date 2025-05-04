const Joi = require('joi');
const { MAX_MESSAGE_LENGTH } = require('../constants');

const adSchema = Joi.object({
  vehicleType: Joi.string().required(),
  message: Joi.string().required().max(MAX_MESSAGE_LENGTH),
  duration: Joi.string().valid('1d', '1w', '1m').required()
});

const magicLinkSchema = Joi.object({
  email: Joi.string().email().required()
});

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: req.t('validation.error', { 
          details: error.details[0].message 
        }) 
      });
    }
    next();
  };
};

module.exports = {
  validateAd: validateRequest(adSchema),
  validateMagicLink: validateRequest(magicLinkSchema)
}; 