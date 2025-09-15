import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Globe, 
  Target, 
  Download, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Users,
  Building,
  MapPin
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WebService, SearchRequest, LeadDiscoveryRequest, DiscoveredLead } from '@/lib/web-service';
import { useLeadsStore } from '@/store/leads-store';

interface LeadSource {
  id: string;
  name: string;
  platform: 'linkedin' | 'google' | 'yellowpages' | 'bing' | 'custom';
  searchTemplate: string;
  isActive: boolean;
  lastRun?: string;
  leadsFound?: number;
}

interface ScrapingSession {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  progress: number;
  totalSources: number;
  completedSources: number;
  leadsFound: number;
  startTime?: string;
  endTime?: string;
  error?: string;
}

export default function LeadSourcingPage() {
  const { toast } = useToast();
  const { bulkCreateLeads, scoreLead, detectDuplicates } = useLeadsStore();
  
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [sessions, setSessions] = useState<ScrapingSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ScrapingSession | null>(null);
  const [discoveredLeads, setDiscoveredLeads] = useState<DiscoveredLead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [newSource, setNewSource] = useState({
    name: '',
    platform: 'google' as const,
    searchTemplate: '',
  });
  const [sessionConfig, setSessionConfig] = useState({
    name: '',
    targetRegions: [] as string[],
    targetServices: [] as string[],
    maxResults: 50,
    includeContactInfo: true,
    autoScore: true,
    checkDuplicates: true,
  });

  const regions = ['UAE', 'India', 'Australia', 'US'];
  const services = ['Website Development', 'Social Media Management', 'Performance Marketing'];
  const platforms = [
    { value: 'google', label: 'Google Search' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'yellowpages', label: 'Yellow Pages' },
    { value: 'bing', label: 'Bing Search' },
    { value: 'custom', label: 'Custom Source' },
  ];

  const searchTemplates = {
    google: {
      'Website Development': 'website development company {region} contact',
      'Social Media Management': 'social media marketing agency {region} email',
      'Performance Marketing': 'digital marketing services {region} contact information',
    },
    linkedin: {
      'Website Development': 'web developer {region} site:linkedin.com',
      'Social Media Management': 'social media manager {region} site:linkedin.com',
      'Performance Marketing': 'digital marketer {region} site:linkedin.com',
    },
    yellowpages: {
      'Website Development': 'web design {region} site:yellowpages.com',
      'Social Media Management': 'marketing agency {region} site:yellowpages.com',
      'Performance Marketing': 'advertising agency {region} site:yellowpages.com',
    },
  };

  useEffect(() => {
    loadDefaultSources();
    loadSessions();
  }, []);

  const loadDefaultSources = () => {
    const defaultSources: LeadSource[] = [
      {
        id: '1',
        name: 'Google - Website Development',
        platform: 'google',
        searchTemplate: 'website development company {region} contact email phone',
        isActive: true,
      },
      {
        id: '2',
        name: 'LinkedIn - Social Media Managers',
        platform: 'linkedin',
        searchTemplate: 'social media manager {region} site:linkedin.com',
        isActive: true,
      },
      {
        id: '3',
        name: 'Google - Digital Marketing Agencies',
        platform: 'google',
        searchTemplate: 'digital marketing agency {region} contact information',
        isActive: true,
      },
    ];
    setSources(defaultSources);
  };

  const loadSessions = () => {
    const mockSessions: ScrapingSession[] = [
      {
        id: '1',
        name: 'UAE Market Research - Dec 2024',
        status: 'completed',
        progress: 100,
        totalSources: 3,
        completedSources: 3,
        leadsFound: 47,
        startTime: '2024-12-08T10:00:00Z',
        endTime: '2024-12-08T11:30:00Z',
      },
      {
        id: '2',
        name: 'India Tech Companies',
        status: 'completed',
        progress: 100,
        totalSources: 2,
        completedSources: 2,
        leadsFound: 32,
        startTime: '2024-12-07T14:00:00Z',
        endTime: '2024-12-07T15:15:00Z',
      },
    ];
    setSessions(mockSessions);
  };

  const addLeadSource = () => {
    if (!newSource.name || !newSource.searchTemplate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const source: LeadSource = {
      id: Date.now().toString(),
      ...newSource,
      isActive: true,
    };

    setSources(prev => [...prev, source]);
    setNewSource({
      name: '',
      platform: 'google',
      searchTemplate: '',
    });

    toast({
      title: "Source Added",
      description: "Lead source has been added successfully",
    });
  };

  const toggleSource = (id: string) => {
    setSources(prev => prev.map(source =>
      source.id === id ? { ...source, isActive: !source.isActive } : source
    ));
  };

  const deleteSource = (id: string) => {
    setSources(prev => prev.filter(source => source.id !== id));
    toast({
      title: "Source Deleted",
      description: "Lead source has been removed",
    });
  };

  const startScrapingSession = async () => {
    if (!sessionConfig.name || sessionConfig.targetRegions.length === 0 || sessionConfig.targetServices.length === 0) {
      toast({
        title: "Configuration Required",
        description: "Please configure session name, regions, and services",
        variant: "destructive",
      });
      return;
    }

    const activeSources = sources.filter(s => s.isActive);
    if (activeSources.length === 0) {
      toast({
        title: "No Active Sources",
        description: "Please enable at least one lead source",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const session: ScrapingSession = {
      id: Date.now().toString(),
      name: sessionConfig.name,
      status: 'running',
      progress: 0,
      totalSources: activeSources.length * sessionConfig.targetRegions.length * sessionConfig.targetServices.length,
      completedSources: 0,
      leadsFound: 0,
      startTime: new Date().toISOString(),
    };

    setCurrentSession(session);
    setSessions(prev => [...prev, session]);

    try {
      const allDiscoveredLeads: DiscoveredLead[] = [];

      // Process each combination of source, region, and service
      for (const region of sessionConfig.targetRegions) {
        for (const service of sessionConfig.targetServices) {
          for (const source of activeSources) {
            try {
              // Replace placeholders in search template
              const searchQuery = source.searchTemplate
                .replace(/{region}/g, region)
                .replace(/{service}/g, service);

              // Perform web search
              const searchResults = await WebService.search({
                query: searchQuery,
                limit: Math.ceil(sessionConfig.maxResults / (activeSources.length * sessionConfig.targetRegions.length * sessionConfig.targetServices.length)),
                country: region === 'UAE' ? 'ae' : region === 'India' ? 'in' : region === 'Australia' ? 'au' : 'us',
              });

              // Process search results into leads
              for (const result of searchResults.results) {
                try {
                  // Extract contact information from the page
                  const contactInfo = await WebService.extractContactInfo(result.url);
                  
                  if (contactInfo.emails.length > 0) {
                    const lead: DiscoveredLead = {
                      name: extractNameFromTitle(result.title),
                      company: extractCompanyFromTitle(result.title),
                      email: contactInfo.emails[0],
                      phone: contactInfo.phones[0],
                      website: result.url,
                      location: region,
                      industry: service,
                      source: source.name,
                      sourceUrl: result.url,
                      confidence: calculateConfidence(result, contactInfo),
                    };

                    allDiscoveredLeads.push(lead);
                  }
                } catch (error) {
                  console.log(`Failed to extract contact info from ${result.url}:`, error);
                }
              }

              // Update progress
              session.completedSources++;
              session.progress = (session.completedSources / session.totalSources) * 100;
              session.leadsFound = allDiscoveredLeads.length;
              
              setCurrentSession({ ...session });
              setSessions(prev => prev.map(s => s.id === session.id ? { ...session } : s));

              // Add small delay to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (error) {
              console.error(`Error processing source ${source.name}:`, error);
            }
          }
        }
      }

      // Process discovered leads
      let processedLeads = allDiscoveredLeads;

      // Check for duplicates if enabled
      if (sessionConfig.checkDuplicates) {
        processedLeads = removeDuplicates(processedLeads);
      }

      // Auto-score leads if enabled
      if (sessionConfig.autoScore) {
        processedLeads = processedLeads.map(lead => ({
          ...lead,
          confidence: Math.min(lead.confidence + calculateQualityScore(lead), 100),
        }));
      }

      setDiscoveredLeads(processedLeads);

      // Complete session
      session.status = 'completed';
      session.endTime = new Date().toISOString();
      session.leadsFound = processedLeads.length;
      
      setCurrentSession({ ...session });
      setSessions(prev => prev.map(s => s.id === session.id ? { ...session } : s));

      toast({
        title: "Scraping Completed",
        description: `Found ${processedLeads.length} qualified leads`,
      });

    } catch (error: any) {
      console.error('Scraping session error:', error);
      
      session.status = 'error';
      session.error = error.message || 'Unknown error occurred';
      
      setCurrentSession({ ...session });
      setSessions(prev => prev.map(s => s.id === session.id ? { ...session } : s));

      toast({
        title: "Scraping Failed",
        description: error.message || 'An error occurred during scraping',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const importLeads = async () => {
    if (discoveredLeads.length === 0) {
      toast({
        title: "No Leads to Import",
        description: "Please run a scraping session first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Convert discovered leads to lead format
      const leadsToImport = discoveredLeads.map(discovered => ({
        name: discovered.name,
        email: discovered.email || '',
        phone: discovered.phone,
        company: discovered.company,
        website: discovered.website,
        linkedin: discovered.linkedin,
        title: discovered.title,
        industry: discovered.industry,
        region: discovered.location as 'UAE' | 'India' | 'Australia' | 'US',
        status: 'new' as const,
        source: discovered.source,
        sourceUrl: discovered.sourceUrl,
        notes: `Auto-imported from ${discovered.source}`,
        score: discovered.confidence,
        tags: ['auto-imported', discovered.source.toLowerCase().replace(/\s+/g, '-')],
      }));

      const success = await bulkCreateLeads(leadsToImport);

      if (success) {
        toast({
          title: "Leads Imported",
          description: `Successfully imported ${leadsToImport.length} leads`,
        });
        setDiscoveredLeads([]);
      } else {
        throw new Error('Failed to import leads');
      }

    } catch (error: any) {
      console.error('Import leads error:', error);
      toast({
        title: "Import Failed",
        description: error.message || 'Failed to import leads',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportDiscoveredLeads = () => {
    const csv = [
      'Name,Email,Phone,Company,Website,Location,Industry,Source,Confidence',
      ...discoveredLeads.map(lead => [
        lead.name,
        lead.email || '',
        lead.phone || '',
        lead.company,
        lead.website || '',
        lead.location || '',
        lead.industry || '',
        lead.source,
        lead.confidence.toString(),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discovered-leads-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Discovered leads exported to CSV",
    });
  };

  // Helper functions
  const extractNameFromTitle = (title: string): string => {
    // Simple extraction logic - in real implementation, use more sophisticated NLP
    const cleanTitle = title.replace(/[^\w\s-]/g, '').trim();
    const words = cleanTitle.split(' ').filter(word => word.length > 2);
    return words.slice(0, 2).join(' ') || 'Unknown';
  };

  const extractCompanyFromTitle = (title: string): string => {
    // Extract company name from title
    const patterns = [
      /(.+?)\s*[-|]\s*/, // Everything before first dash or pipe
      /(.+?)\s*-\s*/, // Everything before first dash
      /^([^-|]+)/, // Everything before separators
    ];
    
    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match && match[1]) {
        return match[1].trim().replace(/[^\w\s&]/g, '');
      }
    }
    
    return title.split(' ').slice(0, 3).join(' ') || 'Unknown Company';
  };

  const calculateConfidence = (result: any, contactInfo: any): number => {
    let confidence = 50; // Base score
    
    if (contactInfo.emails.length > 0) confidence += 30;
    if (contactInfo.phones.length > 0) confidence += 20;
    if (result.snippet.toLowerCase().includes('contact')) confidence += 10;
    if (result.snippet.toLowerCase().includes('service')) confidence += 5;
    
    return Math.min(confidence, 100);
  };

  const calculateQualityScore = (lead: DiscoveredLead): number => {
    let score = 0;
    
    if (lead.email) score += 20;
    if (lead.phone) score += 15;
    if (lead.website) score += 10;
    if (lead.linkedin) score += 10;
    if (lead.company.length > 3) score += 5;
    
    return score;
  };

  const removeDuplicates = (leads: DiscoveredLead[]): DiscoveredLead[] => {
    const seen = new Set<string>();
    return leads.filter(lead => {
      const key = `${lead.email?.toLowerCase()}_${lead.company.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lead Sourcing & Scraping</h1>
        <p className="text-muted-foreground">
          Automated lead discovery and data extraction from web sources
        </p>
      </div>

      <Tabs defaultValue="sources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sources">Lead Sources</TabsTrigger>
          <TabsTrigger value="scraping">Scraping Sessions</TabsTrigger>
          <TabsTrigger value="discovered">Discovered Leads</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Add New Lead Source</CardTitle>
                <CardDescription>
                  Configure automated lead discovery sources
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="source-name">Source Name</Label>
                  <Input
                    id="source-name"
                    placeholder="e.g., Google - Web Development UAE"
                    value={newSource.name}
                    onChange={(e) => setNewSource(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select 
                    value={newSource.platform} 
                    onValueChange={(value: any) => setNewSource(prev => ({ ...prev, platform: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map(platform => (
                        <SelectItem key={platform.value} value={platform.value}>
                          {platform.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="search-template">Search Template</Label>
                  <Textarea
                    id="search-template"
                    placeholder="Use {region} and {service} as placeholders"
                    value={newSource.searchTemplate}
                    onChange={(e) => setNewSource(prev => ({ ...prev, searchTemplate: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {`{region}`} and {`{service}`} as dynamic placeholders
                  </p>
                </div>
                
                <Button onClick={addLeadSource} className="w-full">
                  <Target className="w-4 h-4 mr-2" />
                  Add Source
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Sources ({sources.filter(s => s.isActive).length})</CardTitle>
                <CardDescription>
                  Manage your lead discovery sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {sources.map(source => (
                      <div key={source.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{source.name}</h4>
                            <Badge variant={source.isActive ? "default" : "secondary"}>
                              {source.platform}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {source.searchTemplate}
                          </p>
                          {source.lastRun && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Last run: {new Date(source.lastRun).toLocaleDateString()}
                              {source.leadsFound && ` • ${source.leadsFound} leads found`}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={source.isActive}
                            onCheckedChange={() => toggleSource(source.id)}
                          />
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => deleteSource(source.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scraping" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Start New Scraping Session</CardTitle>
                <CardDescription>
                  Configure and launch automated lead discovery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="session-name">Session Name</Label>
                  <Input
                    id="session-name"
                    placeholder="e.g., Q4 2024 UAE Market Research"
                    value={sessionConfig.name}
                    onChange={(e) => setSessionConfig(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Target Regions</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {regions.map(region => (
                        <div key={region} className="flex items-center space-x-2">
                          <Switch
                            id={`region-${region}`}
                            checked={sessionConfig.targetRegions.includes(region)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSessionConfig(prev => ({
                                  ...prev,
                                  targetRegions: [...prev.targetRegions, region]
                                }));
                              } else {
                                setSessionConfig(prev => ({
                                  ...prev,
                                  targetRegions: prev.targetRegions.filter(r => r !== region)
                                }));
                              }
                            }}
                          />
                          <Label htmlFor={`region-${region}`}>{region}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Target Services</Label>
                    <div className="space-y-2">
                      {services.map(service => (
                        <div key={service} className="flex items-center space-x-2">
                          <Switch
                            id={`service-${service}`}
                            checked={sessionConfig.targetServices.includes(service)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSessionConfig(prev => ({
                                  ...prev,
                                  targetServices: [...prev.targetServices, service]
                                }));
                              } else {
                                setSessionConfig(prev => ({
                                  ...prev,
                                  targetServices: prev.targetServices.filter(s => s !== service)
                                }));
                              }
                            }}
                          />
                          <Label htmlFor={`service-${service}`} className="text-sm">
                            {service}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="max-results">Max Results</Label>
                    <Input
                      id="max-results"
                      type="number"
                      value={sessionConfig.maxResults}
                      onChange={(e) => setSessionConfig(prev => ({ ...prev, maxResults: parseInt(e.target.value) || 50 }))}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-score"
                      checked={sessionConfig.autoScore}
                      onCheckedChange={(checked) => setSessionConfig(prev => ({ ...prev, autoScore: checked }))}
                    />
                    <Label htmlFor="auto-score">Auto Score</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="check-duplicates"
                      checked={sessionConfig.checkDuplicates}
                      onCheckedChange={(checked) => setSessionConfig(prev => ({ ...prev, checkDuplicates: checked }))}
                    />
                    <Label htmlFor="check-duplicates">Check Duplicates</Label>
                  </div>
                </div>
                
                <Button 
                  onClick={startScrapingSession} 
                  className="w-full"
                  disabled={isLoading || (currentSession?.status === 'running')}
                >
                  {isLoading ? (
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Start Scraping Session
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Status</CardTitle>
              </CardHeader>
              <CardContent>
                {currentSession ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{currentSession.name}</span>
                        <Badge variant={
                          currentSession.status === 'running' ? 'default' :
                          currentSession.status === 'completed' ? 'default' :
                          currentSession.status === 'error' ? 'destructive' : 'secondary'
                        }>
                          {currentSession.status}
                        </Badge>
                      </div>
                      <Progress value={currentSession.progress} className="mb-2" />
                      <p className="text-xs text-muted-foreground">
                        {currentSession.completedSources} / {currentSession.totalSources} sources completed
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Leads Found</p>
                        <p className="font-semibold">{currentSession.leadsFound}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Progress</p>
                        <p className="font-semibold">{currentSession.progress.toFixed(0)}%</p>
                      </div>
                    </div>
                    
                    {currentSession.error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{currentSession.error}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="w-8 h-8 mx-auto mb-2" />
                    <p>No active session</p>
                    <p className="text-xs">Start a scraping session to see progress</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Session History</CardTitle>
              <CardDescription>Previous scraping sessions and results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessions.map(session => (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{session.name}</h4>
                        <Badge variant={
                          session.status === 'completed' ? 'default' :
                          session.status === 'error' ? 'destructive' : 'secondary'
                        }>
                          {session.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span><Users className="w-3 h-3 inline mr-1" />{session.leadsFound} leads</span>
                        <span><Target className="w-3 h-3 inline mr-1" />{session.totalSources} sources</span>
                        {session.startTime && (
                          <span><Clock className="w-3 h-3 inline mr-1" />{new Date(session.startTime).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={session.progress} className="w-20" />
                      <span className="text-sm text-muted-foreground">{session.progress.toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discovered" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Discovered Leads ({discoveredLeads.length})</h2>
              <p className="text-muted-foreground">
                Review and import leads from recent scraping sessions
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={exportDiscoveredLeads}
                disabled={discoveredLeads.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button 
                onClick={importLeads}
                disabled={discoveredLeads.length === 0 || isLoading}
              >
                {isLoading ? (
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Import to Leads
              </Button>
            </div>
          </div>

          {discoveredLeads.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2 p-4">
                    {discoveredLeads.map((lead, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{lead.name}</h4>
                            <Badge variant="outline">{lead.company}</Badge>
                            <Badge variant="secondary" className="text-xs">
                              {lead.confidence}% confidence
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {lead.email && <span>📧 {lead.email}</span>}
                            {lead.phone && <span>📱 {lead.phone}</span>}
                            {lead.website && <span><Globe className="w-3 h-3 inline mr-1" />{lead.website}</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="w-3 h-3 mr-1" />{lead.location}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Building className="w-3 h-3 mr-1" />{lead.industry}
                            </Badge>
                            <span className="text-xs text-muted-foreground">via {lead.source}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className={`text-sm font-medium ${
                              lead.confidence >= 80 ? 'text-green-600' :
                              lead.confidence >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {lead.confidence >= 80 ? 'High Quality' :
                               lead.confidence >= 60 ? 'Medium Quality' : 'Low Quality'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Score: {lead.confidence}/100
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">No leads discovered yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start a scraping session to discover potential leads from web sources
                </p>
                <Button variant="outline" onClick={() => {
                  const scrapingTab = document.querySelector('[value="scraping"]') as HTMLElement;
                  scrapingTab?.click();
                }}>
                  Start Scraping Session
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}