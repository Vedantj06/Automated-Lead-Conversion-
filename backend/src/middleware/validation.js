const Joi = require('joi');
const { ApiError } = require('../utils/ApiError');

/**
 * Validation middleware factory
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property]);
    
    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      
      return next(new ApiError(400, `Validation error: ${errorMessage}`));
    }
    
    next();
  };
};

// Validation schemas
const authSchemas = {
  sendOTP: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      })
  }),

  verifyOTP: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    otp: Joi.string()
      .length(6)
      .pattern(/^[0-9]+$/)
      .required()
      .messages({
        'string.length': 'OTP must be exactly 6 digits',
        'string.pattern.base': 'OTP must contain only numbers',
        'any.required': 'OTP is required'
      })
  })
};

const leadSchemas = {
  create: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 100 characters',
        'any.required': 'Name is required'
      }),
    
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    
    company: Joi.string()
      .min(2)
      .max(200)
      .required()
      .messages({
        'string.min': 'Company name must be at least 2 characters',
        'string.max': 'Company name cannot exceed 200 characters',
        'any.required': 'Company is required'
      }),
    
    phone: Joi.string()
      .min(10)
      .max(20)
      .optional()
      .allow('')
      .messages({
        'string.min': 'Phone number must be at least 10 characters',
        'string.max': 'Phone number cannot exceed 20 characters'
      }),
    
    region: Joi.string()
      .valid('UAE', 'India', 'Australia', 'US')
      .required()
      .messages({
        'any.only': 'Region must be one of: UAE, India, Australia, US',
        'any.required': 'Region is required'
      }),
    
    status: Joi.string()
      .valid('new', 'contacted', 'qualified', 'proposal', 'won', 'lost')
      .default('new'),
    
    source: Joi.string()
      .max(100)
      .optional()
      .allow(''),
    
    notes: Joi.string()
      .max(1000)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Notes cannot exceed 1000 characters'
      }),
    
    customFields: Joi.object().optional()
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().optional(),
    company: Joi.string().min(2).max(200).optional(),
    phone: Joi.string().min(10).max(20).optional().allow(''),
    region: Joi.string().valid('UAE', 'India', 'Australia', 'US').optional(),
    status: Joi.string().valid('new', 'contacted', 'qualified', 'proposal', 'won', 'lost').optional(),
    source: Joi.string().max(100).optional().allow(''),
    notes: Joi.string().max(1000).optional().allow(''),
    customFields: Joi.object().optional()
  }).min(1)
};

const campaignSchemas = {
  create: Joi.object({
    name: Joi.string()
      .min(2)
      .max(200)
      .required()
      .messages({
        'string.min': 'Campaign name must be at least 2 characters',
        'string.max': 'Campaign name cannot exceed 200 characters',
        'any.required': 'Campaign name is required'
      }),
    
    description: Joi.string()
      .max(1000)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Description cannot exceed 1000 characters'
      }),
    
    type: Joi.string()
      .valid('email', 'sms', 'social', 'mixed')
      .default('email'),
    
    status: Joi.string()
      .valid('draft', 'active', 'paused', 'completed', 'archived')
      .default('draft'),
    
    targetAudience: Joi.object({
      regions: Joi.array().items(
        Joi.string().valid('UAE', 'India', 'Australia', 'US')
      ).optional(),
      statuses: Joi.array().items(
        Joi.string().valid('new', 'contacted', 'qualified', 'proposal', 'won', 'lost')
      ).optional(),
      sources: Joi.array().items(Joi.string()).optional()
    }).optional(),
    
    schedule: Joi.object({
      startDate: Joi.string().isoDate().optional(),
      endDate: Joi.string().isoDate().optional(),
      timezone: Joi.string().optional()
    }).optional(),
    
    settings: Joi.object().optional()
  })
};

module.exports = {
  validate,
  authSchemas,
  leadSchemas,
  campaignSchemas
};