import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Target, 
  TrendingUp, 
  Star, 
  AlertCircle, 
  CheckCircle,
  Users,
  Building,
  Globe,
  Calendar
} from 'lucide-react';

interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  region: string;
  service: string;
  companySize: string;
  leadScore: number;
  status: string;
  source: string;
  lastContact: Date | null;
  tags: string[];
}

interface ScoringCriteria {
  id: string;
  name: string;
  weight: number;
  description: string;
  maxPoints: number;
}

interface ScoringRule {
  criteria: string;
  condition: string;
  value: any;
  points: number;
}

const defaultCriteria: ScoringCriteria[] = [
  {
    id: 'contact_info',
    name: 'Contact Information Completeness',
    weight: 20,
    description: 'Email, phone, and contact person availability',
    maxPoints: 25
  },
  {
    id: 'company_size',
    name: 'Company Size Match',
    weight: 25,
    description: 'Alignment with target customer profile',
    maxPoints: 30
  },
  {
    id: 'service_alignment',
    name: 'Service Alignment',
    weight: 30,
    description: 'Match with our service offerings',
    maxPoints: 35
  },
  {
    id: 'region_priority',
    name: 'Regional Priority',
    weight: 15,
    description: 'Priority based on target markets',
    maxPoints: 20
  },
  {
    id: 'engagement_potential',
    name: 'Engagement Potential',
    weight: 10,
    description: 'Website quality and digital presence',
    maxPoints: 15
  }
];

const scoringRules: ScoringRule[] = [
  // Contact Information Rules
  { criteria: 'contact_info', condition: 'has_email_and_phone', value: true, points: 25 },
  { criteria: 'contact_info', condition: 'has_email_only', value: true, points: 20 },
  { criteria: 'contact_info', condition: 'has_phone_only', value: true, points: 15 },
  { criteria: 'contact_info', condition: 'has_contact_person', value: true, points: 10 },

  // Company Size Rules
  { criteria: 'company_size', condition: 'equals', value: 'Enterprise', points: 30 },
  { criteria: 'company_size', condition: 'equals', value: 'Medium', points: 25 },
  { criteria: 'company_size', condition: 'equals', value: 'Small', points: 15 },

  // Service Alignment Rules
  { criteria: 'service_alignment', condition: 'equals', value: 'Website Development', points: 35 },
  { criteria: 'service_alignment', condition: 'equals', value: 'Performance Marketing', points: 30 },
  { criteria: 'service_alignment', condition: 'equals', value: 'Social Media Management', points: 25 },

  // Regional Priority Rules
  { criteria: 'region_priority', condition: 'equals', value: 'UAE', points: 20 },
  { criteria: 'region_priority', condition: 'equals', value: 'Australia', points: 18 },
  { criteria: 'region_priority', condition: 'equals', value: 'US', points: 15 },
  { criteria: 'region_priority', condition: 'equals', value: 'India', points: 12 },

  // Engagement Potential Rules (based on website and digital presence)
  { criteria: 'engagement_potential', condition: 'has_website', value: true, points: 15 },
  { criteria: 'engagement_potential', condition: 'has_social_media', value: true, points: 10 },
  { criteria: 'engagement_potential', condition: 'recent_activity', value: true, points: 5 }
];

interface LeadScoringProps {
  leads: Lead[];
  onScoreUpdate?: (leadId: string, newScore: number) => void;
}

export function LeadScoring({ leads, onScoreUpdate }: LeadScoringProps) {
  const [scoringCriteria, setScoringCriteria] = useState<ScoringCriteria[]>(defaultCriteria);
  const [selectedLead, setSelectedLead] = useState<string>('');
  const [autoScoring, setAutoScoring] = useState(true);

  // Calculate lead score based on criteria and rules
  const calculateLeadScore = (lead: Lead): number => {
    let totalScore = 0;

    // Contact Information Score
    let contactScore = 0;
    if (lead.email && lead.phone) contactScore = 25;
    else if (lead.email) contactScore = 20;
    else if (lead.phone) contactScore = 15;
    if (lead.contactPerson && lead.contactPerson !== 'Business Development Team') contactScore += 5;
    totalScore += Math.min(contactScore, 25);

    // Company Size Score
    const sizeRule = scoringRules.find(r => 
      r.criteria === 'company_size' && r.value === lead.companySize
    );
    if (sizeRule) totalScore += sizeRule.points;

    // Service Alignment Score
    const serviceRule = scoringRules.find(r => 
      r.criteria === 'service_alignment' && r.value === lead.service
    );
    if (serviceRule) totalScore += serviceRule.points;

    // Regional Priority Score
    const regionRule = scoringRules.find(r => 
      r.criteria === 'region_priority' && r.value === lead.region
    );
    if (regionRule) totalScore += regionRule.points;

    // Engagement Potential Score
    let engagementScore = 0;
    if (lead.website) engagementScore += 15;
    if (lead.tags.includes('Social Media Presence')) engagementScore += 10;
    if (lead.source.includes('Recent')) engagementScore += 5;
    totalScore += Math.min(engagementScore, 15);

    return Math.min(totalScore, 100);
  };

  // Get score tier
  const getScoreTier = (score: number): { tier: string; color: string; description: string } => {
    if (score >= 80) return { 
      tier: 'Hot', 
      color: 'bg-red-500', 
      description: 'High priority, immediate outreach recommended' 
    };
    if (score >= 60) return { 
      tier: 'Warm', 
      color: 'bg-orange-500', 
      description: 'Good potential, schedule follow-up' 
    };
    if (score >= 40) return { 
      tier: 'Cold', 
      color: 'bg-blue-500', 
      description: 'Moderate potential, nurture over time' 
    };
    return { 
      tier: 'Low', 
      color: 'bg-gray-500', 
      description: 'Low priority, automated nurturing only' 
    };
  };

  // Segment leads by score
  const segmentedLeads = {
    hot: leads.filter(lead => calculateLeadScore(lead) >= 80),
    warm: leads.filter(lead => {
      const score = calculateLeadScore(lead);
      return score >= 60 && score < 80;
    }),
    cold: leads.filter(lead => {
      const score = calculateLeadScore(lead);
      return score >= 40 && score < 60;
    }),
    low: leads.filter(lead => calculateLeadScore(lead) < 40)
  };

  // Auto-score leads when enabled
  useEffect(() => {
    if (autoScoring && onScoreUpdate) {
      leads.forEach(lead => {
        const newScore = calculateLeadScore(lead);
        if (lead.leadScore !== newScore) {
          onScoreUpdate(lead.id, newScore);
        }
      });
    }
  }, [leads, autoScoring, onScoreUpdate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lead Scoring System</h2>
          <p className="text-gray-600">Prioritize leads based on qualification criteria</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={autoScoring ? "default" : "outline"}
            onClick={() => setAutoScoring(!autoScoring)}
          >
            <Target className="h-4 w-4 mr-2" />
            Auto Scoring {autoScoring ? 'ON' : 'OFF'}
          </Button>
        </div>
      </div>

      {/* Score Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Hot Leads</p>
                <p className="text-2xl font-bold text-red-900">{segmentedLeads.hot.length}</p>
                <p className="text-xs text-red-600">80-100 points</p>
              </div>
              <div className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center">
                <Star className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Warm Leads</p>
                <p className="text-2xl font-bold text-orange-900">{segmentedLeads.warm.length}</p>
                <p className="text-xs text-orange-600">60-79 points</p>
              </div>
              <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Cold Leads</p>
                <p className="text-2xl font-bold text-blue-900">{segmentedLeads.cold.length}</p>
                <p className="text-xs text-blue-600">40-59 points</p>
              </div>
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Low Priority</p>
                <p className="text-2xl font-bold text-gray-900">{segmentedLeads.low.length}</p>
                <p className="text-xs text-gray-600">Below 40 points</p>
              </div>
              <div className="h-8 w-8 bg-gray-500 rounded-full flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scoring Criteria */}
      <Card>
        <CardHeader>
          <CardTitle>Scoring Criteria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scoringCriteria.map(criteria => (
              <div key={criteria.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{criteria.name}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Weight: {criteria.weight}%</span>
                    <Badge variant="outline">Max: {criteria.maxPoints} pts</Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{criteria.description}</p>
                <div className="mt-2">
                  <Progress 
                    value={(criteria.weight / 100) * 100} 
                    className="h-2" 
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lead Score Breakdown */}
      {selectedLead && (
        <Card>
          <CardHeader>
            <CardTitle>Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select value={selectedLead} onValueChange={setSelectedLead}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a lead to analyze" />
                </SelectTrigger>
                <SelectContent>
                  {leads.slice(0, 10).map(lead => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.companyName} - {calculateLeadScore(lead)} pts
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(() => {
                const lead = leads.find(l => l.id === selectedLead);
                if (!lead) return null;
                
                const score = calculateLeadScore(lead);
                const tier = getScoreTier(score);
                
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">{lead.companyName}</h3>
                        <p className="text-sm text-gray-600">{lead.region} • {lead.service}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Badge className={tier.color}>{tier.tier}</Badge>
                          <span className="text-2xl font-bold text-gray-900">{score}</span>
                          <span className="text-sm text-gray-600">/ 100</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{tier.description}</p>
                      </div>
                    </div>

                    {/* Detailed breakdown */}
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Contact Information</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {lead.email && lead.phone ? '25' : lead.email ? '20' : lead.phone ? '15' : '0'} / 25
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Company Size Match</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {lead.companySize === 'Enterprise' ? '30' : lead.companySize === 'Medium' ? '25' : '15'} / 30
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4 text-purple-500" />
                          <span className="text-sm">Service Alignment</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {lead.service === 'Website Development' ? '35' : 
                             lead.service === 'Performance Marketing' ? '30' : '25'} / 35
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-orange-500" />
                          <span className="text-sm">Regional Priority</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {lead.region === 'UAE' ? '20' : 
                             lead.region === 'Australia' ? '18' : 
                             lead.region === 'US' ? '15' : '12'} / 20
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Engagement Potential</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {lead.website ? '15' : '0'} / 15
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Scored Leads */}
      <Card>
        <CardHeader>
          <CardTitle>Top Scored Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...leads]
              .sort((a, b) => calculateLeadScore(b) - calculateLeadScore(a))
              .slice(0, 5)
              .map(lead => {
                const score = calculateLeadScore(lead);
                const tier = getScoreTier(score);
                return (
                  <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${tier.color}`} />
                      <div>
                        <h4 className="font-medium text-gray-900">{lead.companyName}</h4>
                        <p className="text-sm text-gray-600">{lead.region} • {lead.service}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={tier.color}>{tier.tier}</Badge>
                      <span className="font-bold text-lg text-gray-900">{score}</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedLead(lead.id)}
                      >
                        Analyze
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}