import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useCampaignsStore } from '@/store/campaigns-store';
import { useLeadsStore } from '@/store/leads-store';
import { PersonalizationEngine } from '@/components/PersonalizationEngine';
import { SequenceBuilder, SequenceList } from '@/components/SequenceBuilder';
import { 
  Mail, 
  Send, 
  Calendar, 
  Users, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Settings,
  Copy,
  Edit,
  Trash2,
  Plus,
  Play,
  Pause,
  BarChart3,
  FileText,
  Target,
  Clock,
  CheckCircle,
  Workflow,
  Wand2
} from 'lucide-react';

const CampaignsPage: React.FC = () => {
  const { toast } = useToast();
  const { campaigns, templates, createCampaign, updateCampaign, deleteCampaign, createTemplate, sendCampaign, isLoading } = useCampaignsStore();
  const { leads } = useLeadsStore();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [showCampaignBuilder, setShowCampaignBuilder] = useState(false);

  useEffect(() => {
    // Load campaigns and templates on mount
    useCampaignsStore.getState().fetchCampaigns();
    useCampaignsStore.getState().fetchTemplates();
  }, []);

  const handleCreateCampaign = async (formData: FormData) => {
    try {
      const name = formData.get('name') as string;
      const subject = formData.get('subject') as string;
      const templateId = formData.get('template') as string;
      const audienceFilter = formData.get('audience') as string;
      const scheduledAt = formData.get('scheduledAt') as string;

      await createCampaign({
        name,
        subject,
        templateId,
        description: '',
        type: 'email' as const,
        status: 'draft' as const,
        content: '',
        variables: [],
        targetRegions: [],
        targetServices: [],
        leadFilters: {},
        schedule: scheduledAt ? {
          startDate: new Date(scheduledAt).toISOString(),
          timezone: 'UTC'
        } : undefined,
        analytics: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          replied: 0,
          bounced: 0,
          unsubscribed: 0
        }
      });

      setShowCampaignBuilder(false);
      toast({
        title: "Campaign Created",
        description: "Your email campaign has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    try {
      await sendCampaign(campaignId, []);
      toast({
        title: "Campaign Sent",
        description: "Your email campaign has been sent successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send campaign. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAudienceSize = (filter: string) => {
    if (!filter || filter === 'all') return leads.length;
    
    // Simple filtering logic - in a real app this would be more sophisticated
    const filtered = leads.filter(lead => {
      if (filter.includes('qualified')) return lead.status === 'qualified';
      if (filter.includes('interested')) return lead.status === 'qualified';
      if (filter.includes('contacted')) return lead.status === 'contacted';
      if (filter.includes('uae')) return lead.region === 'UAE';
      if (filter.includes('india')) return lead.region === 'India';
      if (filter.includes('australia')) return lead.region === 'Australia';
      if (filter.includes('us')) return lead.region === 'US';
      return true;
    });
    return filtered.length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Campaigns</h1>
          <p className="text-muted-foreground">
            Create and manage automated email campaigns for lead outreach
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showTemplateBuilder} onOpenChange={setShowTemplateBuilder}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Email Template</DialogTitle>
                <DialogDescription>
                  Build a reusable email template for your campaigns
                </DialogDescription>
              </DialogHeader>
              <TemplateBuilder onSave={(template) => {
                createTemplate(template);
                setShowTemplateBuilder(false);
                toast({
                  title: "Template Created",
                  description: "Your email template has been saved.",
                });
              }} />
            </DialogContent>
          </Dialog>
          
          <Dialog open={showCampaignBuilder} onOpenChange={setShowCampaignBuilder}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Email Campaign</DialogTitle>
                <DialogDescription>
                  Set up a new automated email campaign
                </DialogDescription>
              </DialogHeader>
              <CampaignBuilder 
                templates={templates}
                onSave={handleCreateCampaign}
                getAudienceSize={getAudienceSize}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="sequences">Sequences</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          {/* Campaign Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Campaigns</p>
                    <p className="text-2xl font-bold">{campaigns.length}</p>
                  </div>
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                    <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'active').length}</p>
                  </div>
                  <Send className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
                    <p className="text-2xl font-bold">
                      {campaigns.reduce((acc, c) => acc + (c.analytics?.sent || 0), 0)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg. Open Rate</p>
                    <p className="text-2xl font-bold">
                      {campaigns.length > 0 
                        ? Math.round(campaigns.reduce((acc, c) => acc + ((c.analytics?.opened || 0) / Math.max(c.analytics?.sent || 1, 1) * 100), 0) / campaigns.length)
                        : 0}%
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Campaigns List */}
          <div className="grid gap-4">
            {campaigns.map((campaign) => (
              <Card key={campaign._id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{campaign.name}</h3>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {getAudienceSize('all')} recipients
                        </div>
                        {campaign.schedule?.startDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(campaign.schedule.startDate).toLocaleDateString()}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {campaign.analytics && (
                        <div className="flex items-center gap-4 mr-4 text-sm">
                          <div className="text-center">
                            <p className="font-medium">{campaign.analytics.sent}</p>
                            <p className="text-muted-foreground">Sent</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">{campaign.analytics.opened}</p>
                            <p className="text-muted-foreground">Opened</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">{campaign.analytics.clicked}</p>
                            <p className="text-muted-foreground">Clicked</p>
                          </div>
                        </div>
                      )}
                      
                      {campaign.status === 'draft' && (
                        <Button 
                          onClick={() => handleSendCampaign(campaign._id)}
                          disabled={isLoading}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send Now
                        </Button>
                      )}
                      
                      {campaign.status === 'active' && (
                        <Button variant="outline">
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteCampaign(campaign._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {campaigns.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first email campaign to start reaching out to leads
                  </p>
                  <Button onClick={() => setShowCampaignBuilder(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Campaign
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sequences" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Email Sequences</h2>
              <p className="text-muted-foreground">
                Automated multi-step email workflows for lead nurturing
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Sequence
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Email Sequence</DialogTitle>
                  <DialogDescription>
                    Build an automated email sequence to nurture leads over time
                  </DialogDescription>
                </DialogHeader>
                <SequenceBuilder
                  templates={templates}
                  onSave={(sequence) => {
                    // Handle sequence save
                    toast({
                      title: "Sequence Created",
                      description: "Your email sequence has been created successfully.",
                    });
                  }}
                  onCancel={() => {}}
                />
              </DialogContent>
            </Dialog>
          </div>

          <SequenceList
            sequences={[]} // This would come from the store
            onEdit={(sequence) => {
              // Handle sequence edit
            }}
            onDelete={(id) => {
              // Handle sequence delete
            }}
            onToggle={(id, active) => {
              // Handle sequence toggle
            }}
          />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template._id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <p>Subject: {template.subject}</p>
                      <p>Created: {new Date(template.createdAt).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {templates.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first email template to speed up campaign creation
                  </p>
                  <Button onClick={() => setShowTemplateBuilder(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>
                Overview of your email campaign performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-12">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Analytics dashboard will be implemented in Phase 5</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Template Builder Component
const TemplateBuilder: React.FC<{ onSave: (template: any) => void }> = ({ onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'outreach',
    subject: '',
    content: '',
    variables: [] as string[]
  });

  const predefinedTemplates = {
    'website-dev': {
      subject: 'Transform Your Business with a Professional Website',
      content: `Hi {{firstName}},

I noticed that {{companyName}} has tremendous potential in the {{industry}} space, but your current online presence might be holding you back from reaching your full potential.

At [Your Agency], we specialize in creating high-converting websites for businesses in {{region}}. Our recent work with similar companies has resulted in:

• 300% increase in qualified leads
• 45% improvement in conversion rates
• Professional brand presence that builds trust

We'd love to show you how a strategic website redesign could transform your business results.

Would you be available for a quick 15-minute call this week to discuss your goals?

Best regards,
{{senderName}}
{{senderTitle}}
{{agencyName}}`
    },
    'social-media': {
      subject: 'Amplify {{companyName}}\'s Social Media Presence',
      content: `Hello {{firstName}},

I've been following {{companyName}} and I'm impressed with your work in {{industry}}. However, I noticed there's a huge opportunity to amplify your brand through strategic social media marketing.

Our social media management services have helped similar businesses in {{region}} achieve:

• 250% growth in engaged followers
• 5x increase in social media leads
• Consistent brand messaging across all platforms
• Professional content that converts browsers into buyers

We manage everything from content creation to community engagement, allowing you to focus on what you do best.

I'd love to show you a customized social media strategy for {{companyName}}. Are you available for a brief call this week?

Looking forward to connecting,
{{senderName}}`
    },
    'performance-marketing': {
      subject: 'Scale {{companyName}} with Data-Driven Marketing',
      content: `Hi {{firstName}},

{{companyName}} has great potential, but are you maximizing your marketing ROI?

Most businesses in {{industry}} are leaving money on the table with unfocused marketing efforts. Our performance marketing approach delivers measurable results:

• Average 400% ROI on ad spend
• Precise targeting to your ideal customers
• Real-time optimization for maximum conversions
• Complete transparency with detailed reporting

We've helped companies in {{region}} scale from 6-figures to 7-figures using our proven system.

Would you be interested in a free marketing audit to see how we could accelerate {{companyName}}'s growth?

Best,
{{senderName}}`
    }
  };

  const loadTemplate = (templateKey: string) => {
    const template = predefinedTemplates[templateKey as keyof typeof predefinedTemplates];
    if (template) {
      setFormData({
        ...formData,
        subject: template.subject,
        content: template.content,
        variables: extractVariables(template.content + ' ' + template.subject)
      });
    }
  };

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{([^}]+)\}\}/g);
    return matches ? [...new Set(matches.map(match => match.replace(/[{}]/g, '')))] : [];
  };

  const handleContentChange = (content: string) => {
    setFormData({
      ...formData,
      content,
      variables: extractVariables(content + ' ' + formData.subject)
    });
  };

  const handleSave = () => {
    onSave({
      ...formData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6">
      {/* Template Selector */}
      <div>
        <Label>Quick Start Templates</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => loadTemplate('website-dev')}
          >
            Website Dev
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => loadTemplate('social-media')}
          >
            Social Media
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => loadTemplate('performance-marketing')}
          >
            Performance Marketing
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="template-name">Template Name</Label>
          <Input
            id="template-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Website Development Outreach"
          />
        </div>
        <div>
          <Label htmlFor="template-category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="outreach">Cold Outreach</SelectItem>
              <SelectItem value="follow-up">Follow Up</SelectItem>
              <SelectItem value="nurture">Lead Nurturing</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="template-description">Description</Label>
        <Input
          id="template-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of when to use this template"
        />
      </div>

      <div>
        <Label htmlFor="template-subject">Subject Line</Label>
        <Input
          id="template-subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="Email subject with variables like {{firstName}} or {{companyName}}"
        />
      </div>

      <div>
        <Label htmlFor="template-content">Email Content</Label>
        <Textarea
          id="template-content"
          value={formData.content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Write your email template here. Use {{variableName}} for personalization."
          rows={15}
          className="font-mono text-sm"
        />
      </div>

      {formData.variables.length > 0 && (
        <div>
          <Label>Detected Variables</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.variables.map((variable) => (
              <Badge key={variable} variant="secondary">
                {`{{${variable}}}`}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Wand2 className="h-4 w-4 mr-2" />
              Personalization
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Personalization Engine</DialogTitle>
              <DialogDescription>
                Test and optimize your template with dynamic content
              </DialogDescription>
            </DialogHeader>
            <PersonalizationEngine
              template={formData}
              lead={{
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@techcorp.com',
                companyName: 'TechCorp Inc',
                industry: 'Technology',
                country: 'UAE',
                city: 'Dubai',
                jobTitle: 'Marketing Director',
                score: 85
              }}
              onPreview={(personalized) => {
                console.log('Personalized content:', personalized);
              }}
            />
          </DialogContent>
        </Dialog>
        
        <Button variant="outline">Preview</Button>
        <Button onClick={handleSave} disabled={!formData.name || !formData.subject || !formData.content}>
          Save Template
        </Button>
      </div>
    </div>
  );
};

// Campaign Builder Component
const CampaignBuilder: React.FC<{ 
  templates: any[], 
  onSave: (formData: FormData) => void,
  getAudienceSize: (filter: string) => number 
}> = ({ templates, onSave, getAudienceSize }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [scheduledAt, setScheduledAt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    formData.append('template', selectedTemplate);
    formData.append('audience', audienceFilter);
    if (scheduledAt) {
      formData.append('scheduledAt', scheduledAt);
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="campaign-name">Campaign Name</Label>
        <Input
          id="campaign-name"
          name="name"
          placeholder="e.g., Q1 Website Development Outreach"
          required
        />
      </div>

      <div>
        <Label htmlFor="campaign-subject">Email Subject</Label>
        <Input
          id="campaign-subject"
          name="subject"
          placeholder="Subject line for your emails"
          required
        />
      </div>

      <div>
        <Label>Email Template</Label>
        <Select value={selectedTemplate} onValueChange={setSelectedTemplate} required>
          <SelectTrigger>
            <SelectValue placeholder="Choose an email template" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template._id} value={template._id}>
                {template.name} - {template.category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Target Audience</Label>
        <Select value={audienceFilter} onValueChange={setAudienceFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Leads ({getAudienceSize('all')})</SelectItem>
            <SelectItem value="qualified">Qualified Leads ({getAudienceSize('qualified')})</SelectItem>
            <SelectItem value="interested">Interested Leads ({getAudienceSize('interested')})</SelectItem>
            <SelectItem value="contacted">Contacted Leads ({getAudienceSize('contacted')})</SelectItem>
            <SelectItem value="uae">UAE Market ({getAudienceSize('uae')})</SelectItem>
            <SelectItem value="india">India Market ({getAudienceSize('india')})</SelectItem>
            <SelectItem value="australia">Australia Market ({getAudienceSize('australia')})</SelectItem>
            <SelectItem value="us">US Market ({getAudienceSize('us')})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="scheduled-at">Schedule (Optional)</Label>
        <Input
          id="scheduled-at"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          min={new Date().toISOString().slice(0, 16)}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline">Save as Draft</Button>
        <Button type="submit">
          {scheduledAt ? 'Schedule Campaign' : 'Send Now'}
        </Button>
      </div>
    </form>
  );
};

export default CampaignsPage;