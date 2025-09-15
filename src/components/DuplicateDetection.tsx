import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertTriangle, 
  Merge, 
  Eye, 
  Trash2, 
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Users,
  Building,
  Mail,
  Phone,
  Globe
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
  notes?: string;
}

interface DuplicateGroup {
  id: string;
  leads: Lead[];
  matchType: 'exact' | 'fuzzy' | 'domain' | 'phone' | 'email';
  confidence: number;
  reasons: string[];
  resolved: boolean;
  masterLead?: Lead;
}

interface DuplicateDetectionProps {
  leads: Lead[];
  onMergeLeads?: (primaryLead: Lead, duplicateLeads: Lead[]) => void;
  onDeleteLead?: (leadId: string) => void;
}

export function DuplicateDetection({ leads, onMergeLeads, onDeleteLead }: DuplicateDetectionProps) {
  const { toast } = useToast();
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<DuplicateGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isScanning, setIsScanning] = useState(false);

  // Duplicate detection algorithms
  const detectDuplicates = () => {
    setIsScanning(true);
    const groups: DuplicateGroup[] = [];
    const processedLeads = new Set<string>();

    leads.forEach((lead, index) => {
      if (processedLeads.has(lead.id)) return;

      const duplicates = findDuplicatesForLead(lead, leads.slice(index + 1), processedLeads);
      
      if (duplicates.length > 0) {
        const allLeads = [lead, ...duplicates.map(d => d.lead)];
        const group: DuplicateGroup = {
          id: `group_${Date.now()}_${index}`,
          leads: allLeads,
          matchType: duplicates[0].matchType,
          confidence: Math.max(...duplicates.map(d => d.confidence)),
          reasons: [...new Set(duplicates.flatMap(d => d.reasons))],
          resolved: false
        };
        
        groups.push(group);
        allLeads.forEach(l => processedLeads.add(l.id));
      }
    });

    setDuplicateGroups(groups);
    setIsScanning(false);

    toast({
      title: "Duplicate Scan Complete",
      description: `Found ${groups.length} potential duplicate groups`
    });
  };

  const findDuplicatesForLead = (
    targetLead: Lead, 
    candidates: Lead[], 
    processedLeads: Set<string>
  ) => {
    const duplicates: { lead: Lead; matchType: DuplicateGroup['matchType']; confidence: number; reasons: string[] }[] = [];

    candidates.forEach(candidate => {
      if (processedLeads.has(candidate.id)) return;

      const match = calculateSimilarity(targetLead, candidate);
      if (match.confidence >= 70) {
        duplicates.push({
          lead: candidate,
          matchType: match.matchType,
          confidence: match.confidence,
          reasons: match.reasons
        });
        processedLeads.add(candidate.id);
      }
    });

    return duplicates;
  };

  const calculateSimilarity = (lead1: Lead, lead2: Lead) => {
    let confidence = 0;
    const reasons: string[] = [];
    let matchType: DuplicateGroup['matchType'] = 'fuzzy';

    // Exact company name match
    if (lead1.companyName.toLowerCase() === lead2.companyName.toLowerCase()) {
      confidence += 40;
      reasons.push('Identical company name');
      matchType = 'exact';
    }
    // Fuzzy company name match
    else if (calculateStringSimilarity(lead1.companyName, lead2.companyName) > 0.8) {
      confidence += 30;
      reasons.push('Similar company name');
      matchType = 'fuzzy';
    }

    // Email domain match
    if (lead1.email && lead2.email) {
      const domain1 = lead1.email.split('@')[1];
      const domain2 = lead2.email.split('@')[1];
      if (domain1 === domain2) {
        confidence += 25;
        reasons.push('Same email domain');
        if (matchType !== 'exact') matchType = 'domain';
      }
    }

    // Exact email match
    if (lead1.email && lead2.email && lead1.email.toLowerCase() === lead2.email.toLowerCase()) {
      confidence += 35;
      reasons.push('Identical email address');
      matchType = 'email';
    }

    // Phone number match
    if (lead1.phone && lead2.phone) {
      const phone1 = normalizePhoneNumber(lead1.phone);
      const phone2 = normalizePhoneNumber(lead2.phone);
      if (phone1 === phone2) {
        confidence += 30;
        reasons.push('Same phone number');
        if (matchType !== 'exact' && matchType !== 'email') matchType = 'phone';
      }
    }

    // Website domain match
    if (lead1.website && lead2.website) {
      const domain1 = extractDomain(lead1.website);
      const domain2 = extractDomain(lead2.website);
      if (domain1 === domain2) {
        confidence += 35;
        reasons.push('Same website domain');
      }
    }

    // Same region and service
    if (lead1.region === lead2.region && lead1.service === lead2.service) {
      confidence += 10;
      reasons.push('Same region and service');
    }

    // Contact person similarity
    if (lead1.contactPerson && lead2.contactPerson) {
      if (calculateStringSimilarity(lead1.contactPerson, lead2.contactPerson) > 0.7) {
        confidence += 15;
        reasons.push('Similar contact person');
      }
    }

    return { confidence: Math.min(confidence, 100), matchType, reasons };
  };

  const calculateStringSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase());
    return (longer.length - distance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const normalizePhoneNumber = (phone: string): string => {
    return phone.replace(/\D/g, '');
  };

  const extractDomain = (url: string): string => {
    try {
      return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '');
    } catch {
      return url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    }
  };

  const handleMergeLeads = (group: DuplicateGroup, masterLead: Lead) => {
    const duplicateLeads = group.leads.filter(lead => lead.id !== masterLead.id);
    
    if (onMergeLeads) {
      onMergeLeads(masterLead, duplicateLeads);
    }

    // Mark group as resolved
    setDuplicateGroups(prev => 
      prev.map(g => 
        g.id === group.id 
          ? { ...g, resolved: true, masterLead }
          : g
      )
    );

    toast({
      title: "Leads Merged",
      description: `Successfully merged ${duplicateLeads.length} duplicate leads into ${masterLead.companyName}`
    });
  };

  const handleDeleteDuplicate = (group: DuplicateGroup, leadToDelete: Lead) => {
    if (onDeleteLead) {
      onDeleteLead(leadToDelete.id);
    }

    // Update group
    const updatedLeads = group.leads.filter(lead => lead.id !== leadToDelete.id);
    if (updatedLeads.length <= 1) {
      // Remove group if only one lead remains
      setDuplicateGroups(prev => prev.filter(g => g.id !== group.id));
    } else {
      setDuplicateGroups(prev => 
        prev.map(g => 
          g.id === group.id 
            ? { ...g, leads: updatedLeads }
            : g
        )
      );
    }

    toast({
      title: "Duplicate Deleted",
      description: `Removed ${leadToDelete.companyName} from duplicates`
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-red-500';
    if (confidence >= 75) return 'bg-orange-500';
    if (confidence >= 60) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getMatchTypeIcon = (matchType: DuplicateGroup['matchType']) => {
    switch (matchType) {
      case 'exact': return <CheckCircle className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'domain': return <Globe className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  // Filter groups
  const filteredGroups = duplicateGroups.filter(group => {
    if (filterType !== 'all' && group.matchType !== filterType) return false;
    if (searchTerm && !group.leads.some(lead => 
      lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    )) return false;
    return true;
  });

  // Automatically detect duplicates on component mount
  useEffect(() => {
    if (leads.length > 0 && duplicateGroups.length === 0) {
      detectDuplicates();
    }
  }, [leads]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Duplicate Detection</h2>
          <p className="text-gray-600">Identify and merge duplicate lead entries</p>
        </div>
        <Button onClick={detectDuplicates} disabled={isScanning}>
          <Search className="h-4 w-4 mr-2" />
          {isScanning ? 'Scanning...' : 'Scan for Duplicates'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Duplicate Groups</p>
                <p className="text-2xl font-bold text-gray-900">{duplicateGroups.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Affected Leads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {duplicateGroups.reduce((sum, group) => sum + group.leads.length, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved Groups</p>
                <p className="text-2xl font-bold text-gray-900">
                  {duplicateGroups.filter(g => g.resolved).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Confidence</p>
                <p className="text-2xl font-bold text-gray-900">
                  {duplicateGroups.filter(g => g.confidence >= 90).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search by company name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by match type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="exact">Exact Match</SelectItem>
            <SelectItem value="email">Email Match</SelectItem>
            <SelectItem value="phone">Phone Match</SelectItem>
            <SelectItem value="domain">Domain Match</SelectItem>
            <SelectItem value="fuzzy">Fuzzy Match</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Duplicate Groups */}
      <div className="space-y-4">
        {filteredGroups.map(group => (
          <Card key={group.id} className={group.resolved ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {getMatchTypeIcon(group.matchType)}
                    <CardTitle className="text-lg">
                      Duplicate Group ({group.leads.length} leads)
                    </CardTitle>
                  </div>
                  <Badge className={getConfidenceColor(group.confidence)}>
                    {group.confidence}% confidence
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {group.matchType} match
                  </Badge>
                  {group.resolved && (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Resolved
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedGroup(selectedGroup?.id === group.id ? null : group)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {selectedGroup?.id === group.id ? 'Hide' : 'Details'}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {group.reasons.map((reason, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {reason}
                  </Badge>
                ))}
              </div>
            </CardHeader>

            {selectedGroup?.id === group.id && (
              <CardContent>
                <Tabs defaultValue="compare">
                  <TabsList>
                    <TabsTrigger value="compare">Compare Leads</TabsTrigger>
                    <TabsTrigger value="merge">Merge Options</TabsTrigger>
                  </TabsList>

                  <TabsContent value="compare" className="space-y-4">
                    <div className="grid gap-4">
                      {group.leads.map(lead => (
                        <div key={lead.id} className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">{lead.companyName}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">Score: {lead.leadScore}</Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteDuplicate(group, lead)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Contact:</span>
                              <p className="font-medium">{lead.contactPerson}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Email:</span>
                              <p className="font-medium">{lead.email || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Phone:</span>
                              <p className="font-medium">{lead.phone || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Source:</span>
                              <p className="font-medium">{lead.source}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="merge" className="space-y-4">
                    <div className="text-sm text-gray-600 mb-4">
                      Select the master record to keep. Other records will be merged into it.
                    </div>
                    <div className="grid gap-3">
                      {group.leads.map(lead => (
                        <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{lead.companyName}</h4>
                            <p className="text-sm text-gray-600">
                              Score: {lead.leadScore} • Source: {lead.source}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleMergeLeads(group, lead)}
                            disabled={group.resolved}
                          >
                            <Merge className="h-4 w-4 mr-1" />
                            Select as Master
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {filteredGroups.length === 0 && !isScanning && (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Duplicates Found</h3>
            <p className="text-gray-600">
              {duplicateGroups.length === 0 
                ? "Your lead database appears to be clean of duplicates."
                : "All duplicate groups have been resolved."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}