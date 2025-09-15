const express = require('express');
const LeadsService = require('../services/leadsService');
const { validate, leadSchemas } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/leads
 * @desc    Get all leads with optional filtering
 * @access  Private
 */
router.get('/', async (req, res, next) => {
  try {
    const filters = {
      region: req.query.region,
      status: req.query.status,
      source: req.query.source,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit
    };
    
    const result = await LeadsService.getLeads(req.user._uid, filters);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/leads/stats
 * @desc    Get lead statistics
 * @access  Private
 */
router.get('/stats', async (req, res, next) => {
  try {
    const result = await LeadsService.getLeadStats(req.user._uid);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/leads/export
 * @desc    Export leads to CSV
 * @access  Private
 */
router.get('/export', async (req, res, next) => {
  try {
    const filters = {
      region: req.query.region,
      status: req.query.status,
      source: req.query.source,
      search: req.query.search
    };
    
    const result = await LeadsService.exportLeads(req.user._uid, filters);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.status(200).send(result.data);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/leads
 * @desc    Create a new lead
 * @access  Private
 */
router.post('/',
  validate(leadSchemas.create),
  async (req, res, next) => {
    try {
      const result = await LeadsService.createLead(req.body, req.user._uid);
      
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/leads/:id
 * @desc    Get a single lead by ID
 * @access  Private
 */
router.get('/:id', async (req, res, next) => {
  try {
    const result = await LeadsService.getLeadById(req.params.id, req.user._uid);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/leads/:id
 * @desc    Update a lead
 * @access  Private
 */
router.put('/:id',
  validate(leadSchemas.update),
  async (req, res, next) => {
    try {
      const result = await LeadsService.updateLead(req.params.id, req.body, req.user._uid);
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   DELETE /api/leads/:id
 * @desc    Delete a lead
 * @access  Private
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await LeadsService.deleteLead(req.params.id, req.user._uid);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/leads/bulk/update
 * @desc    Bulk update multiple leads
 * @access  Private
 */
router.put('/bulk/update', async (req, res, next) => {
  try {
    const { leadIds, updates } = req.body;
    
    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Lead IDs array is required'
      });
    }
    
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Updates object is required'
      });
    }
    
    const result = await LeadsService.bulkUpdateLeads(leadIds, updates, req.user._uid);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;