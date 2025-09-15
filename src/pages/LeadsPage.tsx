import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLeadsStore, type Lead } from '@/store/leads-store';
import { useAuthStore } from '@/store/auth-store';
import { LeadScoring } from '@/components/LeadScoring';
import { DuplicateDetection } from '@/components/DuplicateDetection';
import {
  Search,
  Filter,
  Plus,
  Building2,
  Mail,
  Phone,
  MapPin,
  Star,
  Calendar,
  Edit,
  Trash2,
  ArrowLeft,
  Globe,
  DollarSign,
  Target,
  Copy,
  Database
} from 'lucide-react';

export function LeadsPage() {
  const { 
    leads, 
    fetchLeads, 
    createLead, 
    updateLead, 
    deleteLead, 
    isLoading,
    filters,
    setFilters
  } = useLeadsStore();
  
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [formData, setFormData] = useState<Partial<Lead>>({
    name: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    region: 'UAE',
    source: 'manual',
    status: 'new',
    score: 0,
    tags: [],
    notes: ''
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(lead => {
    if (filters.search && !lead.name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !lead.company.toLowerCase().includes(filters.search.toLowerCase()) &&
        !lead.email.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.status && lead.status !== filters.status) return false;
    if (filters.region && lead.region !== filters.region) return false;
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company || !formData.name || !formData.email) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in company name, contact name, and email.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingLead) {
        await updateLead(editingLead._id, formData);
        toast({
          title: 'Lead updated',
          description: `${formData.company} has been updated successfully.`,
        });
      } else {
        await createLead(formData as Omit<Lead, '_uid' | '_id' | '_tid' | 'createdAt' | 'updatedAt'>);
        toast({
          title: 'Lead added',
          description: `${formData.company} has been added to your pipeline.`,
        });
      }
      
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save lead. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (lead: Lead) => {
    if (!lead._id) return;
    
    try {
      await deleteLead(lead._id);
      toast({
        title: 'Lead deleted',
        description: `${lead.company} has been removed from your pipeline.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete lead. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      website: '',
      industry: '',
      region: 'UAE',
      source: 'manual',
      status: 'new',
      score: 0,
      tags: [],
      notes: ''
    });
    setEditingLead(null);
    setIsAddDialogOpen(false);
  };

  const handleEdit = (lead: Lead) => {
    setFormData(lead);
    setEditingLead(lead);
    setIsAddDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'interested': return 'bg-purple-100 text-purple-800';
      case 'proposal_sent': return 'bg-orange-100 text-orange-800';
      case 'won': return 'bg-emerald-100 text-emerald-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
                <p className="text-sm text-gray-500">{filteredLeads.length} leads in pipeline</p>
              </div>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lead
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
                  <DialogDescription>
                    {editingLead ? 'Update lead information' : 'Enter prospect details to add them to your pipeline'}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name *</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Acme Corporation"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="name">Contact Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="john@acme.com"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://acme.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        value={formData.industry}
                        onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                        placeholder="Technology"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="industry">Company Size</Label>
                      <Select value={formData.industry} onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value as any }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="startup">Startup (1-10)</SelectItem>
                          <SelectItem value="small">Small (11-50)</SelectItem>
                          <SelectItem value="medium">Medium (51-200)</SelectItem>
                          <SelectItem value="enterprise">Enterprise (200+)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="region">Region</Label>
                      <Select value={formData.region} onValueChange={(value) => setFormData(prev => ({ ...prev, region: value as any }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UAE">UAE</SelectItem>
                          <SelectItem value="India">India</SelectItem>
                          <SelectItem value="Australia">Australia</SelectItem>
                          <SelectItem value="US">United States</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="source">Lead Source</Label>
                      <Select value={formData.source} onValueChange={(value) => setFormData(prev => ({ ...prev, source: value as any }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="google">Google Search</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                          <SelectItem value="manual">Manual Entry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="qualified">Qualified</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="interested">Interested</SelectItem>
                          <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                          <SelectItem value="won">Won</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Budget Range</Label>
                      <Input
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="$5,000 - $10,000"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Services Interested</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Website Development, Social Media Management"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional context about this lead..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {editingLead ? 'Update Lead' : 'Add Lead'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        <Tabs defaultValue="leads" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="leads" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Lead Database
              </TabsTrigger>
              <TabsTrigger value="scoring" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Lead Scoring
              </TabsTrigger>
              <TabsTrigger value="duplicates" className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Duplicate Detection
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link to="/sourcing">
                  <Plus className="h-4 w-4 mr-2" />
                  Lead Sourcing
                </Link>
              </Button>
            </div>
          </div>

          <TabsContent value="leads" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search leads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="interested">Interested</SelectItem>
                        <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                        <SelectItem value="won">Won</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={regionFilter} onValueChange={setRegionFilter}>
                      <SelectTrigger className="w-40">
                        <MapPin className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Regions</SelectItem>
                        <SelectItem value="UAE">UAE</SelectItem>
                        <SelectItem value="India">India</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                        <SelectItem value="US">United States</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leads Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : filteredLeads.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLeads.map((lead) => (
                  <Card key={lead._id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{lead.company}</CardTitle>
                            <CardDescription>{lead.name}</CardDescription>
                          </div>
                        </div>
                        
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                        
                        {lead.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{lead.region}</span>
                        </div>
                        
                        {lead.website && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Globe className="h-4 w-4" />
                            <span className="truncate">{lead.website}</span>
                          </div>
                        )}
                        
                        {lead.notes && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DollarSign className="h-4 w-4" />
                            <span>{lead.notes}</span>
                          </div>
                        )}
                      </div>
                      
                      {lead.title && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-gray-500 mb-1">Services Interested:</p>
                          <p className="text-sm">{lead.title}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-gray-600">{lead.score || 50}/100</span>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(lead)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(lead)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || statusFilter !== 'all' || regionFilter !== 'all' ? 'No matching leads' : 'No leads yet'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || statusFilter !== 'all' || regionFilter !== 'all' 
                      ? 'Try adjusting your filters to see more results'
                      : 'Start building your pipeline by adding your first lead'
                    }
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Lead
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="scoring">
            <LeadScoring 
              leads={filteredLeads.map(lead => ({
                id: lead._id,
                companyName: lead.company,
                contactPerson: lead.name,
                email: lead.email,
                phone: lead.phone || '',
                website: lead.website || '',
                region: lead.region,
                service: lead.title || 'Website Development',
                companySize: lead.notes === '$50k+' ? 'Enterprise' : 
                           lead.notes === '$10k-$50k' ? 'Medium' : 'Small',
                leadScore: lead.score || 50,
                status: lead.status,
                source: 'Manual Entry',
                lastContact: lead.createdAt ? new Date(lead.createdAt) : null,
                tags: lead.title ? [lead.title] : []
              }))}
              onScoreUpdate={(leadId, newScore) => {
                const lead = leads.find(l => l._id === leadId);
                if (lead) {
                  updateLead(leadId, { ...lead, score: newScore });
                }
              }}
            />
          </TabsContent>

          <TabsContent value="duplicates">
            <DuplicateDetection 
              leads={filteredLeads.map(lead => ({
                id: lead._id,
                companyName: lead.company,
                contactPerson: lead.name,
                email: lead.email,
                phone: lead.phone || '',
                website: lead.website || '',
                region: lead.region,
                service: lead.title || 'Website Development',
                companySize: lead.notes === '$50k+' ? 'Enterprise' : 
                           lead.notes === '$10k-$50k' ? 'Medium' : 'Small',
                leadScore: lead.score || 50,
                status: lead.status,
                source: 'Manual Entry',
                lastContact: lead.createdAt ? new Date(lead.createdAt) : null,
                tags: lead.title ? [lead.title] : [],
                notes: lead.notes
              }))}
              onMergeLeads={(masterLead, duplicateLeads) => {
                // Update master lead with combined information
                const lead = leads.find(l => l._id === masterLead.id);
                if (lead) {
                  updateLead(masterLead.id, {
                    ...lead,
                    notes: `${lead.notes || ''}\n\nMerged duplicates: ${duplicateLeads.map(d => d.companyName).join(', ')}`
                  });
                }
                
                // Delete duplicate leads
                duplicateLeads.forEach(duplicate => {
                  deleteLead(duplicate.id);
                });
              }}
              onDeleteLead={(leadId) => {
                deleteLead(leadId);
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}