import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scale, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

const Navigation = () => {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">LegalAI</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/find-lawyers"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/find-lawyers") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Find Lawyers
            </Link>
            <Link
              to="/summarize"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/summarize") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Case Summarization
            </Link>

            {user ? (
              <Button onClick={handleSignOut} variant="outline" size="sm">
                Sign Out
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
