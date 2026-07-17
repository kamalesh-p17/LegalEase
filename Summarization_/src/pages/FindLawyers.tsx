import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, MapPin, Phone, Mail, Briefcase, UserPlus, Search } from "lucide-react";
import { toast } from "sonner";

interface Lawyer {
  id: string;
  user_id?: string;
  full_name: string;
  specialization: string;
  location: string;
  experience_years: number;
  rating: number;
  bio: string;
  phone: string;
  email: string;
}

const FindLawyers = () => {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [connectionRequests, setConnectionRequests] = useState<Record<string, string>>({});
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  useEffect(() => {
    fetchCurrentUser();
    fetchLawyers();
  }, []);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user);
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();
      setUserType(profile?.user_type || null);

      // Fetch connection requests for this user
      if (profile?.user_type === 'client') {
        const { data: requests } = await supabase
          .from('connection_requests')
          .select('lawyer_id, status')
          .eq('client_id', user.id);
        
        const requestMap: Record<string, string> = {};
        requests?.forEach(req => {
          requestMap[req.lawyer_id] = req.status;
        });
        setConnectionRequests(requestMap);
      }
    }
  };

  const fetchLawyers = async () => {
    try {
      const { data, error } = await supabase
        .from("lawyers")
        .select("*");

      if (error) throw error;
      
      // Calculate rating for each lawyer
      const lawyersWithRatings = await Promise.all(
        (data || []).map(async (lawyer) => {
          const { data: ratingData } = await supabase
            .rpc('calculate_lawyer_rating', { lawyer_user_id: lawyer.user_id });
          return { ...lawyer, rating: ratingData || 0 };
        })
      );

      // Sort by rating
      lawyersWithRatings.sort((a, b) => b.rating - a.rating);
      setLawyers(lawyersWithRatings);
    } catch (error) {
      console.error("Error fetching lawyers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionRequest = async (lawyerId: string) => {
    if (!currentUser) {
      toast.error("Please sign in to connect with lawyers");
      return;
    }

    try {
      const { error } = await supabase
        .from('connection_requests')
        .insert({
          client_id: currentUser.id,
          lawyer_id: lawyerId
        });

      if (error) throw error;
      
      setConnectionRequests(prev => ({ ...prev, [lawyerId]: 'pending' }));
      toast.success("Connection request sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send connection request");
    }
  };

  const handleSubmitRating = async () => {
    if (!currentUser || !selectedLawyer) return;

    try {
      const { error } = await supabase
        .from('lawyer_ratings')
        .insert({
          lawyer_id: selectedLawyer.user_id,
          client_id: currentUser.id,
          rating,
          review: review || null
        });

      if (error) throw error;

      toast.success("Rating submitted successfully!");
      setRatingDialogOpen(false);
      setRating(5);
      setReview("");
      fetchLawyers(); // Refresh to show updated rating
    } catch (error: any) {
      toast.error(error.message || "Failed to submit rating");
    }
  };

  const filteredLawyers = lawyers.filter((lawyer) => {
    const matchesSearch =
      lawyer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lawyer.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialization =
      specializationFilter === "all" || lawyer.specialization === specializationFilter;
    return matchesSearch && matchesSpecialization;
  });

  const specializations = ["all", ...Array.from(new Set(lawyers.map((l) => l.specialization)))];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Find Lawyers</h1>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Specialization" />
            </SelectTrigger>
            <SelectContent>
              {specializations.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec === "all" ? "All Specializations" : spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p>Loading lawyers...</p>
          </div>
        ) : filteredLawyers.length === 0 ? (
          <div className="text-center py-12">
            <p>No lawyers found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLawyers.map((lawyer) => (
              <Card key={lawyer.id}>
                <CardHeader>
                  <CardTitle>{lawyer.full_name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {lawyer.specialization}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {lawyer.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{lawyer.rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">
                      ({lawyer.experience_years} years)
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{lawyer.bio}</p>
                  <div className="flex gap-4 mt-4 text-sm">
                    {lawyer.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        <span>{lawyer.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{lawyer.email}</span>
                    </div>
                  </div>

                  {userType === 'client' && currentUser && (
                    <div className="flex gap-2 mt-4">
                      {!connectionRequests[lawyer.user_id!] && (
                        <Button
                          onClick={() => handleConnectionRequest(lawyer.user_id!)}
                          variant="outline"
                          size="sm"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      )}
                      {connectionRequests[lawyer.user_id!] === 'pending' && (
                        <Button variant="outline" size="sm" disabled>
                          Request Pending
                        </Button>
                      )}
                      {connectionRequests[lawyer.user_id!] === 'accepted' && (
                        <Dialog open={ratingDialogOpen && selectedLawyer?.id === lawyer.id} onOpenChange={setRatingDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              onClick={() => setSelectedLawyer(lawyer)}
                              variant="outline"
                              size="sm"
                            >
                              <Star className="h-4 w-4 mr-2" />
                              Rate Lawyer
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Rate {lawyer.full_name}</DialogTitle>
                              <DialogDescription>
                                Share your experience with this lawyer
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="rating">Rating (1-5)</Label>
                                <Input
                                  id="rating"
                                  type="number"
                                  min="1"
                                  max="5"
                                  value={rating}
                                  onChange={(e) => setRating(parseInt(e.target.value))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="review">Review (Optional)</Label>
                                <Textarea
                                  id="review"
                                  placeholder="Share your thoughts..."
                                  value={review}
                                  onChange={(e) => setReview(e.target.value)}
                                />
                              </div>
                              <Button onClick={handleSubmitRating} className="w-full">
                                Submit Rating
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindLawyers;
