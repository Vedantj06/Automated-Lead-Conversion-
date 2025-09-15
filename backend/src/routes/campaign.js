const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { validate, campaignSchemas } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { ApiError } = require('../utils/ApiError');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * In-memory storage for campaigns and templates
 * In production, use a database
 */
const campaignsStorage = new Map();
const templatesStorage = new Map();

// Initialize with mock data
const initializeMockData = () => {
  // Mock email templates
  const mockTemplates = [
    {
      _uid: 'system',
      _id: `template_${Date.now()}_1`,
      name: 'Welcome Sequence',
      subject: 'Welcome to Marketing Hub - Let\'s Get Started!',
      content: `
        <h1>Welcome {{name}}!</h1>
        <p>Thank you for joining Marketing Hub. We're excited to help your business grow.</p>
        <p>Here's what you can expect:</p>
        <ul>
          <li>Automated lead generation</li>
          <li>Smart email campaigns</li>
          <li>Performance analytics</li>
        </ul>
        <p>Ready to get started? <a href="{{dashboard_url}}">Visit your dashboard</a></p>
      `,
      type: 'welcome',
      variables: ['name', 'company', 'dashboard_url'],
      createdAt: new Date().toISOString()
    },
    {
      _uid: 'system',
      _id: `template_${Date.now()}_2`,
      name: 'Follow-up Email',
      subject: 'Following up on our conversation - {{company}}',
      content: `
        <p>Hi {{name}},</p>
        <p>I wanted to follow up on our recent conversation about {{company}}'s digital marketing needs.</p>
        <p>Based on our discussion, I believe our {{service}} solutions could be a great fit for your goals.</p>
        <p>Would you be available for a quick 15-minute call this week to discuss next steps?</p>
        <p>Best regards,<br>{{sender_name}}</p>
      `,
      type: 'follow_up',
      variables: ['name', 'company', 'service', 'sender_name'],
      createdAt: new Date().toISOString()
    },
    {
      _uid: 'system',
      _id: `template_${Date.now()}_3`,
      name: 'Proposal Notification',
      subject: 'Your custom proposal is ready - {{company}}',
      content: `
        <p>Dear {{name}},</p>
        <p>Thank you for your interest in our services for {{company}}.</p>
        <p>I'm pleased to share that your custom proposal is now ready for review.</p>
        <p>The proposal includes:</p>
        <ul>
          <li>Project timeline and milestones</li>
          <li>Detailed service breakdown</li>
          <li>Investment and payment terms</li>
        </ul>
        <p><a href="{{proposal_url}}">View Your Proposal</a></p>
        <p>I'm available to discuss any questions you may have.</p>
      `,
      type: 'proposal',
      variables: ['name', 'company', 'proposal_url'],
      createdAt: new Date().toISOString()
    }
  ];

  mockTemplates.forEach(template => {
    templatesStorage.set(template._id, template);
  });

  // Mock campaigns
  const mockCampaigns = [
    {
      _uid: 'system',
      _id: `campaign_${Date.now()}_1`,
      name: 'Q4 Lead Nurturing Campaign',
      description: 'Automated follow-up sequence for new leads',
      type: 'email',
      status: 'active',
      templateId: mockTemplates[0]._id,
      targetAudience: {
        regions: ['UAE', 'India'],
        statuses: ['new', 'contacted'],
        sources: ['Website', 'LinkedIn']
      },
      schedule: {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        timezone: 'UTC'
      },
      analytics: {
        sent: 245,
        delivered: 240,
        opened: 156,
        clicked: 48,
        converted: 12
      },
      settings: {
        sendTime: '09:00',
        frequency: 'daily',
        maxSends: 1000
      },
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _uid: 'system',
      _id: `campaign_${Date.now()}_2`,
      name: 'Regional Expansion Outreach',
      description: 'Targeted campaign for Australia and US markets',
      type: 'email',
      status: 'draft',
      templateId: mockTemplates[1]._id,
      targetAudience: {
        regions: ['Australia', 'US'],
        statuses: ['qualified', 'proposal'],
        sources: []
      },
      schedule: {
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        timezone: 'UTC'
      },
      analytics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        converted: 0
      },
      settings: {
        sendTime: '10:00',
        frequency: 'weekly',
        maxSends: 500
      },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  mockCampaigns.forEach(campaign => {
    campaignsStorage.set(campaign._id, campaign);
  });

  console.log(`📧 Initialized with ${mockTemplates.length} email templates and ${mockCampaigns.length} campaigns`);
};

/**
 * @route   GET /api/campaigns
 * @desc    Get all campaigns
 * @access  Private
 */
router.get('/', async (req, res, next) => {
  try {
    const campaigns = Array.from(campaignsStorage.values())
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    res.status(200).json({
      success: true,
      data: campaigns,
      count: campaigns.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/campaigns/templates
 * @desc    Get all email templates
 * @access  Private
 */
router.get('/templates', async (req, res, next) => {
  try {
    const templates = Array.from(templatesStorage.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.status(200).json({
      success: true,
      data: templates,
      count: templates.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/campaigns
 * @desc    Create a new campaign
 * @access  Private
 */
router.post('/',
  validate(campaignSchemas.create),
  async (req, res, next) => {
    try {
      const campaign = {
        _uid: req.user._uid,
        _id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...req.body,
        analytics: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          converted: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      campaignsStorage.set(campaign._id, campaign);
      
      res.status(201).json({
        success: true,
        data: campaign,
        message: 'Campaign created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/campaigns/templates
 * @desc    Create a new email template
 * @access  Private
 */
router.post('/templates', async (req, res, next) => {
  try {
    const { name, subject, content, type, variables } = req.body;
    
    if (!name || !subject || !content) {
      throw new ApiError(400, 'Name, subject, and content are required');
    }
    
    const template = {
      _uid: req.user._uid,
      _id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      subject,
      content,
      type: type || 'custom',
      variables: variables || [],
      createdAt: new Date().toISOString()
    };
    
    templatesStorage.set(template._id, template);
    
    res.status(201).json({
      success: true,
      data: template,
      message: 'Email template created successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/campaigns/:id
 * @desc    Get a single campaign
 * @access  Private
 */
router.get('/:id', async (req, res, next) => {
  try {
    const campaign = campaignsStorage.get(req.params.id);
    
    if (!campaign) {
      throw new ApiError(404, 'Campaign not found');
    }
    
    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/campaigns/:id
 * @desc    Update a campaign
 * @access  Private
 */
router.put('/:id', async (req, res, next) => {
  try {
    const existingCampaign = campaignsStorage.get(req.params.id);
    
    if (!existingCampaign) {
      throw new ApiError(404, 'Campaign not found');
    }
    
    const updatedCampaign = {
      ...existingCampaign,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    campaignsStorage.set(req.params.id, updatedCampaign);
    
    res.status(200).json({
      success: true,
      data: updatedCampaign,
      message: 'Campaign updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/campaigns/:id
 * @desc    Delete a campaign
 * @access  Private
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const campaign = campaignsStorage.get(req.params.id);
    
    if (!campaign) {
      throw new ApiError(404, 'Campaign not found');
    }
    
    campaignsStorage.delete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/campaigns/:id/start
 * @desc    Start a campaign
 * @access  Private
 */
router.post('/:id/start', async (req, res, next) => {
  try {
    const campaign = campaignsStorage.get(req.params.id);
    
    if (!campaign) {
      throw new ApiError(404, 'Campaign not found');
    }
    
    if (campaign.status === 'active') {
      throw new ApiError(400, 'Campaign is already active');
    }
    
    const updatedCampaign = {
      ...campaign,
      status: 'active',
      updatedAt: new Date().toISOString()
    };
    
    campaignsStorage.set(req.params.id, updatedCampaign);
    
    res.status(200).json({
      success: true,
      data: updatedCampaign,
      message: 'Campaign started successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/campaigns/:id/pause
 * @desc    Pause a campaign
 * @access  Private
 */
router.post('/:id/pause', async (req, res, next) => {
  try {
    const campaign = campaignsStorage.get(req.params.id);
    
    if (!campaign) {
      throw new ApiError(404, 'Campaign not found');
    }
    
    if (campaign.status !== 'active') {
      throw new ApiError(400, 'Only active campaigns can be paused');
    }
    
    const updatedCampaign = {
      ...campaign,
      status: 'paused',
      updatedAt: new Date().toISOString()
    };
    
    campaignsStorage.set(req.params.id, updatedCampaign);
    
    res.status(200).json({
      success: true,
      data: updatedCampaign,
      message: 'Campaign paused successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/campaigns/:id/analytics
 * @desc    Get campaign analytics
 * @access  Private
 */
router.get('/:id/analytics', async (req, res, next) => {
  try {
    const campaign = campaignsStorage.get(req.params.id);
    
    if (!campaign) {
      throw new ApiError(404, 'Campaign not found');
    }
    
    const analytics = {
      ...campaign.analytics,
      openRate: campaign.analytics.sent > 0 ? ((campaign.analytics.opened / campaign.analytics.sent) * 100).toFixed(1) : '0',
      clickRate: campaign.analytics.opened > 0 ? ((campaign.analytics.clicked / campaign.analytics.opened) * 100).toFixed(1) : '0',
      conversionRate: campaign.analytics.sent > 0 ? ((campaign.analytics.converted / campaign.analytics.sent) * 100).toFixed(1) : '0'
    };
    
    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
});

// Initialize mock data when the module is loaded
initializeMockData();

module.exports = router;