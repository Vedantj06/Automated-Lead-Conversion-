import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLeadsStore } from '@/store/leads-store';
import { useAuthStore } from '@/store/auth-store';
import { 
  Target, 
  Users, 
  TrendingUp, 
  Mail, 
  Calendar,
  Plus,
  MoreHorizontal,
  ArrowUpRight,
  Building2,
  MapPin,
  Star
} from 'lucide-react';

export default function DashboardPage() {
  // Make sure leads is present and always an array
  const { leads: rawLeads = [], fetchLeads, isLoading } = useLeadsStore();
  const { user, logout } = useAuthStore();

  const leads = Array.isArray(rawLeads) ? rawLeads : [];

  useEffect(() => {
    // fetchLeads may be undefined in some mocks — guard it
    if (typeof fetchLeads === 'function') {
      fetchLeads();
    }
  }, [fetchLeads]);

  // Defensive defaults
  const totalLeads = leads?.length || 0;
  const qualifiedLeads = Array.isArray(leads)
    ? leads.filter((l: any) => ['qualified', 'proposal'].includes(l.status)).length
    : 0;
  const wonDeals = Array.isArray(leads) ? leads.filter((l: any) => l.status === 'won').length : 0;
  const conversionRate = totalLeads > 0 ? ((wonDeals / totalLeads) * 100).toFixed(1) : '0';

  const regionStats = Array.isArray(leads)
    ? leads.reduce((acc: Record<string, number>, lead: any) => {
        const r = lead.region || 'Unknown';
        acc[r] = (acc[r] || 0) + 1;
        return acc;
      }, {})
    : {};

  const recentLeads = Array.isArray(leads)
    ? leads
        .slice()
        .sort((a: any, b: any) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
        .slice(0, 5)
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Marketing Hub</h1>
              <p className="text-sm text-gray-500">Welcome back, {user?.name || user?.email}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link to="/leads">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lead
                </Button>
              </Link>
              
              <Button variant="outline" onClick={() => logout?.()}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Leads</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalLeads}</div>
              <p className="text-xs text-gray-500 mt-1">Across all regions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Qualified</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{qualifiedLeads}</div>
              <p className="text-xs text-gray-500 mt-1">Ready for outreach</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Won Deals</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{wonDeals}</div>
              <p className="text-xs text-gray-500 mt-1">Converted clients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
              <Star className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{conversionRate}%</div>
              <p className="text-xs text-gray-500 mt-1">Lead to client</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Regional Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Regional Performance
              </CardTitle>
              <CardDescription>Lead distribution across target markets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(regionStats).map(([region, count]) => (
                  <div key={region} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-3 h-3 rounded-full ${
                          region === 'UAE' ? 'bg-blue-500' :
                          region === 'India' ? 'bg-green-500' :
                          region === 'Australia' ? 'bg-purple-500' :
                          'bg-orange-500'
                        }`}
                      />
                      <span className="text-sm font-medium">{region}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{count} leads</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            region === 'UAE' ? 'bg-blue-500' :
                            region === 'India' ? 'bg-green-500' :
                            region === 'Australia' ? 'bg-purple-500' :
                            'bg-orange-500'
                          }`}
                          style={{ width: `${totalLeads > 0 ? (count / totalLeads) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {Object.keys(regionStats).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No leads yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Quick Actions
              </CardTitle>
              <CardDescription>Streamline your workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link to="/leads">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Lead
                  </Button>
                </Link>
                
                <Link to="/sourcing">
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="h-4 w-4 mr-2" />
                    Lead Sourcing
                  </Button>
                </Link>
                
                <Link to="/campaigns">
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Campaigns
                  </Button>
                </Link>
                
                <Button variant="outline" className="w-full justify-start" disabled>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                  <span className="ml-auto text-xs text-gray-500">Phase 5</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-green-600" />
                  Recent Leads
                </CardTitle>
                <CardDescription>Latest prospects in your pipeline</CardDescription>
              </div>
              
              <Link to="/leads">
                <Button variant="outline" size="sm">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : recentLeads.length > 0 ? (
              <div className="space-y-4">
                {recentLeads.map((lead) => (
                  <div key={lead._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{lead.company}</h4>
                        <p className="text-sm text-gray-500">{lead.name} • {lead.region}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span 
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                          lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                          lead.status === 'proposal' ? 'bg-purple-100 text-purple-800' :
                          lead.status === 'won' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {String(lead.status).replace('_', ' ')}
                      </span>
                      
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No leads yet</h3>
                <p className="text-gray-500 mb-4">Start building your pipeline by adding your first lead</p>
                <Link to="/leads">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Lead
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
