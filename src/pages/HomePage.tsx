import { useNavigate } from 'react-router-dom';
import { Sparkles, Target, Mail, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth-store';

function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const features = [
    {
      icon: Target,
      title: 'Lead Discovery',
      description: 'Automated web scraping and lead sourcing from multiple platforms',
    },
    {
      icon: Mail,
      title: 'Email Campaigns',
      description: 'Professional templates and automated outreach sequences',
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Track engagement, conversions, and ROI across all campaigns',
    },
  ];

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-10 h-10 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Marketing Automation Platform
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Streamline your agency's lead generation and outreach process. 
            Discover leads, automate campaigns, and grow your business with minimal human intervention.
          </p>
          <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-3">
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="border-muted/40 hover:border-primary/20 transition-colors">
              <CardHeader className="text-center">
                <feature.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Services Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-6">Built for Digital Agencies</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {['Website Development', 'Social Media Management', 'Performance Marketing'].map((service) => (
              <div key={service} className="bg-primary/10 text-primary px-6 py-3 rounded-full font-medium">
                {service}
              </div>
            ))}
          </div>
        </div>

        {/* Regional Coverage */}
        <div className="text-center">
          <h3 className="text-2xl font-semibold mb-4">Global Reach</h3>
          <p className="text-muted-foreground mb-6">
            Targeting prospects across key markets: UAE, India, Australia, and the United States
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['🇦🇪 UAE', '🇮🇳 India', '🇦🇺 Australia', '🇺🇸 United States'].map((region) => (
              <span key={region} className="bg-muted/50 px-4 py-2 rounded-lg">
                {region}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage; 