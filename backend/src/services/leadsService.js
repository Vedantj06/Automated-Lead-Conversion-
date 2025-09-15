const { v4: uuidv4 } = require('uuid');
const { ApiError } = require('../utils/ApiError');

/**
 * In-memory storage for leads
 * In production, use a database
 */
const leadsStorage = new Map();

/**
 * Initialize with mock data
 */
const initializeMockData = () => {
  const mockLeads = [
    {
      _uid: 'system',
      _id: `lead_${Date.now()}_1`,
      name: 'Ahmed Al-Rashid',
      email: 'ahmed.rashid@techcorp.ae',
      company: 'TechCorp Solutions',
      phone: '+971-50-123-4567',
      region: 'UAE',
      status: 'qualified',
      source: 'LinkedIn',
      notes: 'Interested in website redesign and digital marketing services',
      customFields: {
        budget: '$50,000 - $100,000',
        timeline: '3-6 months',
        services: ['Website Development', 'Digital Marketing']
      },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _uid: 'system',
      _id: `lead_${Date.now()}_2`,
      name: 'Priya Sharma',
      email: 'priya.sharma@innovatetech.in',
      company: 'Innovate Technologies',
      phone: '+91-98765-43210',
      region: 'India',
      status: 'new',
      source: 'Google Ads',
      notes: 'Looking for social media management and content creation',
      customFields: {
        budget: '$10,000 - $25,000',
        timeline: '1-2 months',
        services: ['Social Media Management', 'Content Creation']
      },
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _uid: 'system',
      _id: `lead_${Date.now()}_3`,
      name: 'Emily Johnson',
      email: 'emily.johnson@aussiebiz.com.au',
      company: 'Aussie Business Co.',
      phone: '+61-2-9876-5432',
      region: 'Australia',
      status: 'contacted',
      source: 'Website Contact Form',
      notes: 'E-commerce website with payment integration needed',
      customFields: {
        budget: '$75,000 - $150,000',
        timeline: '4-8 months',
        services: ['E-commerce Development', 'Payment Integration']
      },
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _uid: 'system',
      _id: `lead_${Date.now()}_4`,
      name: 'Michael Chen',
      email: 'michael.chen@startuphub.us',
      company: 'StartupHub USA',
      phone: '+1-555-123-4567',
      region: 'US',
      status: 'proposal',
      source: 'Referral',
      notes: 'Full-stack development for SaaS platform with marketing automation',
      customFields: {
        budget: '$200,000+',
        timeline: '6-12 months',
        services: ['SaaS Development', 'Marketing Automation', 'Analytics']
      },
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      _uid: 'system',
      _id: `lead_${Date.now()}_5`,
      name: 'Sarah Williams',
      email: 'sarah.williams@creativeagency.ae',
      company: 'Creative Design Agency',
      phone: '+971-55-987-6543',
      region: 'UAE',
      status: 'won',
      source: 'Instagram',
      notes: 'Completed branding and social media management project',
      customFields: {
        budget: '$30,000 - $50,000',
        timeline: 'Completed',
        services: ['Branding', 'Social Media Management']
      },
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _uid: 'system',
      _id: `lead_${Date.now()}_6`,
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@manufact.in',
      company: 'Manufacturing Solutions Ltd',
      phone: '+91-11-2345-6789',
      region: 'India',
      status: 'lost',
      source: 'Cold Email',
      notes: 'Budget constraints, may revisit in next quarter',
      customFields: {
        budget: 'Under $10,000',
        timeline: 'On hold',
        services: ['Website Development']
      },
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  mockLeads.forEach(lead => {
    leadsStorage.set(lead._id, lead);
  });

  console.log(`📊 Initialized with ${mockLeads.length} mock leads`);
};

/**
 * Leads service
 */
class LeadsService {
  /**
   * Get all leads with optional filtering
   */
  static async getLeads(userId, filters = {}) {
    try {
      let leads = Array.from(leadsStorage.values());
      
      // Filter by region
      if (filters.region && filters.region !== 'all') {
        leads = leads.filter(lead => lead.region === filters.region);
      }
      
      // Filter by status
      if (filters.status && filters.status !== 'all') {
        leads = leads.filter(lead => lead.status === filters.status);
      }
      
      // Filter by source
      if (filters.source && filters.source !== 'all') {
        leads = leads.filter(lead => lead.source === filters.source);
      }
      
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        leads = leads.filter(lead => 
          lead.name.toLowerCase().includes(searchLower) ||
          lead.email.toLowerCase().includes(searchLower) ||
          lead.company.toLowerCase().includes(searchLower) ||
          (lead.notes && lead.notes.toLowerCase().includes(searchLower))
        );
      }
      
      // Sort by creation date (newest first) by default
      leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // Pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 50;
      const offset = (page - 1) * limit;
      
      const total = leads.length;
      const paginatedLeads = leads.slice(offset, offset + limit);
      
      return {
        success: true,
        data: paginatedLeads,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Get leads error:', error);
      throw new ApiError(500, 'Failed to retrieve leads');
    }
  }

  /**
   * Get a single lead by ID
   */
  static async getLeadById(leadId, userId) {
    try {
      const lead = leadsStorage.get(leadId);
      
      if (!lead) {
        throw new ApiError(404, 'Lead not found');
      }
      
      return {
        success: true,
        data: lead
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Get lead error:', error);
      throw new ApiError(500, 'Failed to retrieve lead');
    }
  }

  /**
   * Create a new lead
   */
  static async createLead(leadData, userId) {
    try {
      // Check for duplicate email
      const existingLead = Array.from(leadsStorage.values())
        .find(lead => lead.email === leadData.email);
      
      if (existingLead) {
        throw new ApiError(400, 'A lead with this email already exists');
      }
      
      const lead = {
        _uid: userId,
        _id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...leadData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      leadsStorage.set(lead._id, lead);
      
      console.log(`✅ Lead created: ${lead.name} (${lead.email})`);
      
      return {
        success: true,
        data: lead,
        message: 'Lead created successfully'
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Create lead error:', error);
      throw new ApiError(500, 'Failed to create lead');
    }
  }

  /**
   * Update a lead
   */
  static async updateLead(leadId, updates, userId) {
    try {
      const existingLead = leadsStorage.get(leadId);
      
      if (!existingLead) {
        throw new ApiError(404, 'Lead not found');
      }
      
      // Check for duplicate email if email is being updated
      if (updates.email && updates.email !== existingLead.email) {
        const duplicateLead = Array.from(leadsStorage.values())
          .find(lead => lead.email === updates.email && lead._id !== leadId);
        
        if (duplicateLead) {
          throw new ApiError(400, 'A lead with this email already exists');
        }
      }
      
      const updatedLead = {
        ...existingLead,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      leadsStorage.set(leadId, updatedLead);
      
      console.log(`📝 Lead updated: ${updatedLead.name} (${updatedLead.email})`);
      
      return {
        success: true,
        data: updatedLead,
        message: 'Lead updated successfully'
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Update lead error:', error);
      throw new ApiError(500, 'Failed to update lead');
    }
  }

  /**
   * Delete a lead
   */
  static async deleteLead(leadId, userId) {
    try {
      const lead = leadsStorage.get(leadId);
      
      if (!lead) {
        throw new ApiError(404, 'Lead not found');
      }
      
      leadsStorage.delete(leadId);
      
      console.log(`🗑️ Lead deleted: ${lead.name} (${lead.email})`);
      
      return {
        success: true,
        message: 'Lead deleted successfully'
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Delete lead error:', error);
      throw new ApiError(500, 'Failed to delete lead');
    }
  }

  /**
   * Get lead statistics
   */
  static async getLeadStats(userId) {
    try {
      const leads = Array.from(leadsStorage.values());
      
      const stats = {
        total: leads.length,
        byStatus: {
          new: leads.filter(l => l.status === 'new').length,
          contacted: leads.filter(l => l.status === 'contacted').length,
          qualified: leads.filter(l => l.status === 'qualified').length,
          proposal: leads.filter(l => l.status === 'proposal').length,
          won: leads.filter(l => l.status === 'won').length,
          lost: leads.filter(l => l.status === 'lost').length
        },
        byRegion: {
          UAE: leads.filter(l => l.region === 'UAE').length,
          India: leads.filter(l => l.region === 'India').length,
          Australia: leads.filter(l => l.region === 'Australia').length,
          US: leads.filter(l => l.region === 'US').length
        },
        recentActivity: leads
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 10)
      };
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Get lead stats error:', error);
      throw new ApiError(500, 'Failed to retrieve lead statistics');
    }
  }

  /**
   * Bulk update leads
   */
  static async bulkUpdateLeads(leadIds, updates, userId) {
    try {
      const updatedLeads = [];
      const errors = [];
      
      for (const leadId of leadIds) {
        try {
          const result = await this.updateLead(leadId, updates, userId);
          updatedLeads.push(result.data);
        } catch (error) {
          errors.push({ leadId, error: error.message });
        }
      }
      
      return {
        success: errors.length === 0,
        data: updatedLeads,
        errors,
        message: `${updatedLeads.length} leads updated successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}`
      };
    } catch (error) {
      console.error('Bulk update leads error:', error);
      throw new ApiError(500, 'Bulk update failed');
    }
  }

  /**
   * Export leads to CSV format
   */
  static async exportLeads(userId, filters = {}) {
    try {
      const result = await this.getLeads(userId, { ...filters, limit: 10000 });
      const leads = result.data;
      
      // Convert to CSV format
      const headers = ['Name', 'Email', 'Company', 'Phone', 'Region', 'Status', 'Source', 'Notes', 'Created At'];
      const rows = leads.map(lead => [
        lead.name,
        lead.email,
        lead.company,
        lead.phone || '',
        lead.region,
        lead.status,
        lead.source || '',
        lead.notes || '',
        lead.createdAt
      ]);
      
      const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      return {
        success: true,
        data: csvContent,
        filename: `leads_export_${new Date().toISOString().split('T')[0]}.csv`
      };
    } catch (error) {
      console.error('Export leads error:', error);
      throw new ApiError(500, 'Failed to export leads');
    }
  }
}

// Initialize mock data when the module is loaded
initializeMockData();

module.exports = LeadsService;