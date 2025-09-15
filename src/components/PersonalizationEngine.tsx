import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Wand2, 
  Eye, 
  RefreshCw, 
  Sparkles, 
  Brain, 
  Target,
  MessageSquare,
  Users,
  Globe,
  Briefcase,
  Calendar
} from 'lucide-react';

interface PersonalizationVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'list';
  source: 'lead_data' | 'company_data' | 'computed' | 'external';
  description: string;
  example: any;
}

interface PersonalizationRule {
  id: string;
  name: string;
  condition: {
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_list';
    value: any;
  };
  replacement: {
    variable: string;
    value: string;
  };
}

const personalizationVariables: PersonalizationVariable[] = [
  // Lead Data
  { name: 'firstName', type: 'text', source: 'lead_data', description: 'Lead first name', example: 'John' },
  { name: 'lastName', type: 'text', source: 'lead_data', description: 'Lead last name', example: 'Doe' },
  { name: 'email', type: 'text', source: 'lead_data', description: 'Lead email address', example: 'john@company.com' },
  { name: 'jobTitle', type: 'text', source: 'lead_data', description: 'Lead job title', example: 'Marketing Director' },
  { name: 'companyName', type: 'text', source: 'lead_data', description: 'Company name', example: 'TechCorp Inc' },
  { name: 'industry', type: 'text', source: 'lead_data', description: 'Company industry', example: 'Technology' },
  { name: 'country', type: 'text', source: 'lead_data', description: 'Company country', example: 'UAE' },
  { name: 'city', type: 'text', source: 'lead_data', description: 'Company city', example: 'Dubai' },
  { name: 'companySize', type: 'text', source: 'lead_data', description: 'Company size', example: '50-100 employees' },
  { name: 'leadScore', type: 'number', source: 'lead_data', description: 'Lead qualification score', example: 85 },
  
  // Computed Variables
  { name: 'timeOfDay', type: 'text', source: 'computed', description: 'Contextual greeting', example: 'Good morning' },
  { name: 'localTime', type: 'text', source: 'computed', description: 'Recipients local time', example: '2:30 PM' },
  { name: 'daysSinceLastContact', type: 'number', source: 'computed', description: 'Days since last interaction', example: 7 },
  { name: 'engagementLevel', type: 'text', source: 'computed', description: 'Engagement classification', example: 'High' },
  
  // Service-Specific
  { name: 'recommendedService', type: 'text', source: 'computed', description: 'AI-recommended service', example: 'Website Development' },
  { name: 'competitorAnalysis', type: 'text', source: 'computed', description: 'Competitor insight', example: 'lacks mobile optimization' },
  { name: 'marketTrend', type: 'text', source: 'computed', description: 'Relevant market trend', example: 'mobile-first design' },
  
  // Agency Variables
  { name: 'senderName', type: 'text', source: 'lead_data', description: 'Sender full name', example: 'Alex Johnson' },
  { name: 'senderTitle', type: 'text', source: 'lead_data', description: 'Sender job title', example: 'Marketing Director' },
  { name: 'agencyName', type: 'text', source: 'lead_data', description: 'Agency name', example: 'Digital Growth Partners' },
  { name: 'agencyWebsite', type: 'text', source: 'lead_data', description: 'Agency website', example: 'www.digitalgrowth.com' },
  { name: 'portfolioLink', type: 'text', source: 'lead_data', description: 'Relevant portfolio piece', example: 'https://portfolio.com/tech-clients' }
];

interface PersonalizationEngineProps {
  template: any;
  lead?: any;
  onPreview: (personalizedContent: { subject: string; content: string }) => void;
}

export const PersonalizationEngine: React.FC<PersonalizationEngineProps> = ({
  template,
  lead,
  onPreview
}) => {
  const [activeTab, setActiveTab] = useState('variables');
  const [rules, setRules] = useState<PersonalizationRule[]>([]);
  const [selectedVariable, setSelectedVariable] = useState<string>('');

  const getPersonalizedContent = () => {
    if (!template || !lead) return { subject: '', content: '' };

    let personalizedSubject = template.subject;
    let personalizedContent = template.content;

    // Apply basic variable replacements
    const replacements = getVariableReplacements(lead);
    
    Object.entries(replacements).forEach(([variable, value]) => {
      const placeholder = `{{${variable}}}`;
      personalizedSubject = personalizedSubject.replace(new RegExp(placeholder, 'g'), value);
      personalizedContent = personalizedContent.replace(new RegExp(placeholder, 'g'), value);
    });

    // Apply personalization rules
    rules.forEach(rule => {
      if (evaluateCondition(rule.condition, lead)) {
        const placeholder = `{{${rule.replacement.variable}}}`;
        personalizedSubject = personalizedSubject.replace(new RegExp(placeholder, 'g'), rule.replacement.value);
        personalizedContent = personalizedContent.replace(new RegExp(placeholder, 'g'), rule.replacement.value);
      }
    });

    return {
      subject: personalizedSubject,
      content: personalizedContent
    };
  };

  const getVariableReplacements = (leadData: any) => {
    const now = new Date();
    const hour = now.getHours();
    
    return {
      // Basic lead data
      firstName: leadData.firstName || leadData.contactName?.split(' ')[0] || 'there',
      lastName: leadData.lastName || leadData.contactName?.split(' ').slice(1).join(' ') || '',
      email: leadData.email || '',
      jobTitle: leadData.jobTitle || leadData.position || '',
      companyName: leadData.companyName || leadData.company || 'your company',
      industry: leadData.industry || 'your industry',
      country: leadData.country || leadData.region || 'your region',
      city: leadData.city || '',
      companySize: leadData.companySize || '',
      leadScore: leadData.score || 0,
      
      // Computed variables
      timeOfDay: hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening',
      localTime: now.toLocaleTimeString(),
      daysSinceLastContact: Math.floor((now.getTime() - new Date(leadData.lastContactedAt || leadData.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
      engagementLevel: getEngagementLevel(leadData),
      
      // Service recommendations
      recommendedService: getRecommendedService(leadData),
      competitorAnalysis: getCompetitorInsight(leadData),
      marketTrend: getMarketTrend(leadData.industry),
      
      // Agency info
      senderName: 'Alex Johnson',
      senderTitle: 'Marketing Director',
      agencyName: 'Digital Growth Partners',
      agencyWebsite: 'www.dgp.agency',
      portfolioLink: getRelevantPortfolio(leadData.industry)
    };
  };

  const getEngagementLevel = (leadData: any) => {
    const score = leadData.score || 0;
    if (score >= 80) return 'High';
    if (score >= 60) return 'Medium';
    return 'Low';
  };

  const getRecommendedService = (leadData: any) => {
    const industry = leadData.industry?.toLowerCase() || '';
    const companySize = leadData.companySize || '';
    
    if (industry.includes('tech') || industry.includes('software')) {
      return 'Performance Marketing';
    } else if (industry.includes('retail') || industry.includes('ecommerce')) {
      return 'Social Media Management';
    } else if (companySize.includes('startup') || companySize.includes('1-10')) {
      return 'Website Development';
    }
    return 'Digital Marketing Consultation';
  };

  const getCompetitorInsight = (leadData: any) => {
    const insights = [
      'lacks mobile optimization',
      'has limited social media presence',
      'could benefit from better SEO',
      'missing conversion optimization',
      'needs improved user experience'
    ];
    return insights[Math.floor(Math.random() * insights.length)];
  };

  const getMarketTrend = (industry: string) => {
    const trends: { [key: string]: string } = {
      technology: 'AI integration and automation',
      healthcare: 'telemedicine and digital health',
      finance: 'fintech and digital payments',
      retail: 'omnichannel customer experience',
      education: 'online learning platforms',
      default: 'digital transformation'
    };
    
    return trends[industry?.toLowerCase()] || trends.default;
  };

  const getRelevantPortfolio = (industry: string) => {
    const portfolios: { [key: string]: string } = {
      technology: 'https://portfolio.com/tech-clients',
      healthcare: 'https://portfolio.com/healthcare-cases',
      finance: 'https://portfolio.com/fintech-success',
      retail: 'https://portfolio.com/ecommerce-growth',
      default: 'https://portfolio.com/case-studies'
    };
    
    return portfolios[industry?.toLowerCase()] || portfolios.default;
  };

  const evaluateCondition = (condition: any, leadData: any) => {
    const fieldValue = leadData[condition.field];
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'contains':
        return fieldValue?.toLowerCase().includes(condition.value.toLowerCase());
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      case 'in_list':
        return condition.value.includes(fieldValue);
      default:
        return false;
    }
  };

  const handlePreview = () => {
    const personalized = getPersonalizedContent();
    onPreview(personalized);
  };

  const addRule = () => {
    const newRule: PersonalizationRule = {
      id: Date.now().toString(),
      name: 'New Rule',
      condition: {
        field: 'industry',
        operator: 'equals',
        value: ''
      },
      replacement: {
        variable: 'recommendedService',
        value: ''
      }
    };
    setRules([...rules, newRule]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-600" />
            Personalization Engine
          </h3>
          <p className="text-sm text-muted-foreground">
            Customize email content based on lead data and behavior
          </p>
        </div>
        <Button onClick={handlePreview} className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Preview Personalized
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="variables">Variables</TabsTrigger>
          <TabsTrigger value="rules">Smart Rules</TabsTrigger>
          <TabsTrigger value="preview">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="variables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Available Variables
              </CardTitle>
              <CardDescription>
                Click on any variable to insert it into your template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {personalizationVariables.map((variable) => (
                  <div
                    key={variable.name}
                    className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => setSelectedVariable(variable.name)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {`{{${variable.name}}}`}
                      </code>
                      <Badge variant="outline" className="text-xs">
                        {variable.source.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {variable.description}
                    </p>
                    <p className="text-xs font-medium text-green-600">
                      Example: {String(variable.example)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Conditional Personalization</h4>
              <p className="text-sm text-muted-foreground">
                Create rules to show different content based on lead attributes
              </p>
            </div>
            <Button onClick={addRule} size="sm">
              Add Rule
            </Button>
          </div>

          <div className="space-y-3">
            {rules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-4 gap-3 items-end">
                    <div>
                      <Label>If</Label>
                      <Select defaultValue={rule.condition.field}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="industry">Industry</SelectItem>
                          <SelectItem value="country">Country</SelectItem>
                          <SelectItem value="companySize">Company Size</SelectItem>
                          <SelectItem value="leadScore">Lead Score</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Operator</Label>
                      <Select defaultValue={rule.condition.operator}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                          <SelectItem value="greater_than">Greater Than</SelectItem>
                          <SelectItem value="less_than">Less Than</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Value</Label>
                      <Input defaultValue={rule.condition.value} />
                    </div>
                    
                    <div>
                      <Label>Then Replace</Label>
                      <Input 
                        placeholder="{{variable}} with custom text"
                        defaultValue={`{{${rule.replacement.variable}}} with ${rule.replacement.value}`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {rules.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h4 className="font-medium mb-2">No rules yet</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create conditional rules to personalize content based on lead attributes
                  </p>
                  <Button onClick={addRule}>Create Your First Rule</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI-Powered Insights
              </CardTitle>
              <CardDescription>
                Smart recommendations for better personalization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-blue-900">Targeting Optimization</h5>
                      <p className="text-sm text-blue-700 mt-1">
                        Based on your lead data, UAE and India markets show 40% higher engagement rates. 
                        Consider creating region-specific variations.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-green-900">Content Suggestion</h5>
                      <p className="text-sm text-green-700 mt-1">
                        Technology companies respond better to ROI-focused messaging. 
                        Include specific metrics in your templates.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-purple-900">Timing Optimization</h5>
                      <p className="text-sm text-purple-700 mt-1">
                        Your leads are most active Tuesday-Thursday, 10-11 AM local time. 
                        Schedule campaigns accordingly for better open rates.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Advanced AI recommendations will be available in Phase 5
                  </p>
                  <Button variant="outline" disabled>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate New Insights
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};