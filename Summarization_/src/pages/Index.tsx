import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Search, Users, Sparkles, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
            <Scale className="h-4 w-4" />
            Legal Services Made Simple
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            Connect with Expert Lawyers,{" "}
            <span className="text-primary">Instantly</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Find qualified legal professionals and get AI-powered case summaries tailored to your needs.
            Legal help has never been more accessible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/find-lawyers">
              <Button size="lg" variant="hero">
                Find a Lawyer
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/summarize">
              <Button size="lg" variant="outline">
                Try Case Summary
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Find Expert Lawyers</CardTitle>
              <CardDescription>
                Browse our directory of qualified legal professionals across multiple specializations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/find-lawyers">
                <Button variant="link" className="p-0">
                  Explore directory <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>AI Case Summaries</CardTitle>
              <CardDescription>
                Get complex legal cases explained in simple terms using advanced AI technology
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/summarize">
                <Button variant="link" className="p-0">
                  Try summarization <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Instant Connections</CardTitle>
              <CardDescription>
                Connect with lawyers via phone or email directly from our platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/find-lawyers">
                <Button variant="link" className="p-0">
                  Get started <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-2">Ready to Get Started?</CardTitle>
            <CardDescription className="text-primary-foreground/80 text-lg">
              Join thousands who have found legal help through our platform
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link to="/auth">
              <Button size="lg" variant="secondary">
                Create Free Account
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 LegalAI. Connecting people with legal expertise.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
