import { useState } from "react";
import NavigationBar from "@/components/NavigationBar";
import CollegeFilter from "@/components/CollegeFilter";
import ConfessionCard from "@/components/ConfessionCard";
import TrendingSidebar from "@/components/TrendingSidebar";
import AIChatbot from "@/components/AIChatbot";
import PostConfessionModal from "@/components/PostConfessionModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Sparkles, PenTool, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Confession } from "@shared/schema";

export default function Home() {
  const [selectedCollege, setSelectedCollege] = useState<string>("all");
  const [showPostModal, setShowPostModal] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [adviceForm, setAdviceForm] = useState({
    problem: "",
    category: "",
    urgency: "low"
  });
  const [showAIResponse, setShowAIResponse] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch confessions
  const { data: confessions, isLoading: confessionsLoading } = useQuery({
    queryKey: ["/api/confessions", selectedCollege],
    queryFn: async () => {
      const params = selectedCollege !== "all" ? `?college=${selectedCollege}` : "";
      const res = await fetch(`/api/confessions${params}`);
      if (!res.ok) throw new Error("Failed to fetch confessions");
      return res.json() as Promise<Confession[]>;
    },
  });

  // Fetch trending confessions
  const { data: trending } = useQuery<Confession[]>({
    queryKey: ["/api/confessions/trending"],
  });

  // Fetch stats
  const { data: stats } = useQuery<{ total_confessions: number; active_users: number; moderated: number; colleges: number }>({
    queryKey: ["/api/stats"],
  });

  // AI Advice mutation
  const adviceMutation = useMutation({
    mutationFn: async (data: { problem: string; category: string; urgency: string }) => {
      const res = await apiRequest("POST", "/api/advice", data);
      return res.json();
    },
    onSuccess: (data) => {
      setAiResponse(data);
      setShowAIResponse(true);
      toast({
        title: "AI Advice Generated",
        description: "Your personalized advice is ready!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate advice. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAdviceSubmit = () => {
    if (!adviceForm.problem.trim()) {
      toast({
        title: "Error", 
        description: "Please describe your problem first.",
        variant: "destructive",
      });
      return;
    }
    adviceMutation.mutate(adviceForm);
  };

  return (
    <div className="min-h-screen">
      <NavigationBar />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block mb-4 px-4 py-2 glassmorphism rounded-full text-sm font-medium">
            <span className="text-accent">🔥</span> Over {stats?.total_confessions || "50,000"}+ confessions shared
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            Your Campus.<br />
            <span className="gradient-text">Your Secrets.</span><br />
            Zero Judgement.
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Anonymous confessions, crushes, and doubts from students across India. Share your story, get AI-powered advice, and connect with your college community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => setShowPostModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-primary/50 transition-all transform hover:scale-105"
              data-testid="button-post-confession"
            >
              <PenTool className="mr-2" />
              Post Anonymous Confession
            </Button>
            <Button 
              variant="outline"
              onClick={() => document.getElementById('feed')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 glassmorphism text-foreground rounded-xl font-bold text-lg hover:border-primary transition-all"
              data-testid="button-explore"
            >
              <span className="mr-2">🧭</span>Explore Confessions
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-accent rounded-full"></span>
              <span>100% Anonymous</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-accent rounded-full"></span>
              <span>AI Moderated</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-accent rounded-full"></span>
              <span>Safe Space</span>
            </div>
          </div>
        </div>
      </section>

      {/* College Filter */}
      <div id="feed">
        <CollegeFilter
          selectedCollege={selectedCollege}
          onCollegeChange={setSelectedCollege}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Confessions Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Creation Card */}
            <Card 
              className="glassmorphism border-2 border-dashed border-primary/30 hover:border-primary/60 transition-all cursor-pointer"
              onClick={() => setShowPostModal(true)}
              data-testid="card-create-post"
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-white text-xl">🤫</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground">What's on your mind? Share anonymously...</p>
                  </div>
                  <Button 
                    className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    data-testid="button-post"
                  >
                    <PenTool className="mr-2 h-4 w-4" />
                    Post
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Confessions List */}
            {confessionsLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="glassmorphism">
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded mb-4"></div>
                        <div className="h-20 bg-muted rounded mb-4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {confessions?.map(confession => (
                  <ConfessionCard key={confession.id} confession={confession} />
                )) || (
                  <Card className="glassmorphism">
                    <CardContent className="p-12 text-center">
                      <p className="text-muted-foreground text-lg">No confessions found for this college yet.</p>
                      <Button 
                        onClick={() => setShowPostModal(true)}
                        className="mt-4 bg-gradient-to-r from-primary to-accent text-white"
                        data-testid="button-first-confession"
                      >
                        Be the first to confess!
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {confessions && confessions.length > 0 && (
              <div className="text-center py-8">
                <Button 
                  variant="outline"
                  className="px-8 py-3 glassmorphism text-foreground rounded-lg font-semibold hover:border-primary transition-all"
                  data-testid="button-load-more"
                >
                  <span className="mr-2">🔄</span>Load More Confessions
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <TrendingSidebar trending={trending} stats={stats} onOpenChat={() => setShowAIChat(true)} />
        </div>
      </div>

      {/* AI Advice Section */}
      <section className="container mx-auto px-4 pb-16">
        <Card className="glassmorphism border-2 border-primary/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -z-10"></div>
          
          <CardContent className="p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center mb-8">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/20 rounded-full mb-4">
                <Sparkles className="text-primary h-4 w-4" />
                <span className="text-sm font-medium text-primary">AI-Powered Support</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
                Need Advice? <span className="gradient-text">We're Here</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Share your problems, doubts, or concerns. Our AI counselor provides personalized, evidence-based advice in seconds.
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">What's troubling you?</label>
                  <Textarea 
                    rows={6}
                    className="resize-none"
                    placeholder="Share your thoughts, feelings, or questions here... Be as detailed as you'd like. Everything is anonymous and confidential."
                    value={adviceForm.problem}
                    onChange={(e) => setAdviceForm(prev => ({ ...prev, problem: e.target.value }))}
                    data-testid="textarea-problem"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <Select value={adviceForm.category} onValueChange={(value) => setAdviceForm(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mental_health">Mental Health</SelectItem>
                        <SelectItem value="relationships">Relationships & Dating</SelectItem>
                        <SelectItem value="career">Career & Future</SelectItem>
                        <SelectItem value="academics">Academics & Studies</SelectItem>
                        <SelectItem value="family">Family Issues</SelectItem>
                        <SelectItem value="social">Social & Friendships</SelectItem>
                        <SelectItem value="general">General Advice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Urgency Level</label>
                    <Select value={adviceForm.urgency} onValueChange={(value) => setAdviceForm(prev => ({ ...prev, urgency: value }))}>
                      <SelectTrigger data-testid="select-urgency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Just need guidance</SelectItem>
                        <SelectItem value="medium">Bothering me lately</SelectItem>
                        <SelectItem value="high">Urgent - need help now</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-start space-x-2 p-4 bg-secondary/10 rounded-lg border border-secondary/30">
                  <span className="text-secondary mt-1">ℹ️</span>
                  <p className="text-sm text-muted-foreground">
                    Your submission is completely anonymous. Our AI will analyze your concern and provide thoughtful, personalized advice. For emergencies, please contact professional help immediately.
                  </p>
                </div>

                <Button 
                  onClick={handleAdviceSubmit}
                  disabled={adviceMutation.isPending}
                  className="w-full px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-primary/50 transition-all transform hover:scale-[1.02]"
                  data-testid="button-get-advice"
                >
                  {adviceMutation.isPending ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Generating Advice...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">✈️</span>
                      Get AI Advice
                    </>
                  )}
                </Button>
              </div>

              {/* AI Response */}
              {showAIResponse && aiResponse && (
                <Card className="mt-8 bg-primary/10 border-2 border-primary/30">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                        <Bot className="text-white h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-bold text-lg">AI Counselor Response</h4>
                          <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">Personalized</span>
                        </div>
                        <div className="prose prose-invert max-w-none">
                          <p className="mb-3 text-foreground">{aiResponse.advice}</p>
                          {aiResponse.resources && aiResponse.resources.length > 0 && (
                            <div className="mt-4">
                              <h5 className="font-semibold mb-2">Helpful Resources:</h5>
                              <ul className="list-disc list-inside space-y-1">
                                {aiResponse.resources.map((resource: string, index: number) => (
                                  <li key={index} className="text-sm text-muted-foreground">{resource}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex items-center space-x-4 text-sm">
                          <button className="text-primary hover:underline font-medium" data-testid="button-save-advice">
                            <span className="mr-1">📚</span>Save Advice
                          </button>
                          <button className="text-primary hover:underline font-medium" data-testid="button-share-advice">
                            <span className="mr-1">📤</span>Share (Anonymous)
                          </button>
                          <button 
                            onClick={() => setShowAIChat(true)}
                            className="text-primary hover:underline font-medium"
                            data-testid="button-continue-chat"
                          >
                            <span className="mr-1">💬</span>Continue in Chat
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Monetization Section */}
      <section className="container mx-auto px-4 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            Support <span className="gradient-text">CampusConfess</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Help us keep the platform running and get exclusive perks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Premium Plan */}
          <Card className="glassmorphism border-2 border-accent/50 relative overflow-hidden transform hover:scale-105 transition-transform">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl -z-10"></div>
            <CardContent className="p-8 text-center">
              <span className="text-accent text-4xl mb-4 block">👑</span>
              <h3 className="text-2xl font-bold mb-2">Premium</h3>
              <div className="text-4xl font-extrabold gradient-text mb-2">₹49</div>
              <p className="text-sm text-muted-foreground mb-6">per month</p>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-start space-x-3">
                  <span className="text-accent mt-1">✓</span>
                  <span className="text-sm">Anonymous crush messages</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-accent mt-1">✓</span>
                  <span className="text-sm">Boost posts to trending</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-accent mt-1">✓</span>
                  <span className="text-sm">Custom profile badges</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-accent mt-1">✓</span>
                  <span className="text-sm">Ad-free experience</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-accent mt-1">✓</span>
                  <span className="text-sm">Priority AI support</span>
                </li>
              </ul>
              <Button className="w-full bg-gradient-to-r from-accent to-primary text-white font-bold hover:shadow-2xl hover:shadow-accent/50 transition-all" data-testid="button-get-premium">
                Get Premium
              </Button>
            </CardContent>
          </Card>

          {/* Merch Store */}
          <Card className="glassmorphism border-2 border-primary/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-10"></div>
            <CardContent className="p-8 text-center">
              <span className="text-primary text-4xl mb-4 block">👕</span>
              <h3 className="text-2xl font-bold mb-2">Merch Store</h3>
              <p className="text-sm text-muted-foreground mb-6">Rep your campus with style</p>
              <div className="space-y-4 mb-8">
                <div className="p-4 bg-card rounded-lg text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">T-Shirts</span>
                    <span className="text-primary font-bold">₹499</span>
                  </div>
                  <p className="text-sm text-muted-foreground">"Crushed at SRM" designs</p>
                </div>
                <div className="p-4 bg-card rounded-lg text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Hoodies</span>
                    <span className="text-primary font-bold">₹999</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Premium quality, comfy fit</p>
                </div>
              </div>
              <Button className="w-full bg-primary text-primary-foreground font-bold hover:shadow-xl hover:shadow-primary/50 transition-all" data-testid="button-visit-store">
                <span className="mr-2">🛒</span>Visit Store
              </Button>
            </CardContent>
          </Card>

          {/* College Sponsorship */}
          <Card className="glassmorphism border-2 border-secondary/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full blur-3xl -z-10"></div>
            <CardContent className="p-8 text-center">
              <span className="text-secondary text-4xl mb-4 block">📢</span>
              <h3 className="text-2xl font-bold mb-2">Advertise</h3>
              <p className="text-sm text-muted-foreground mb-6">Reach thousands of students</p>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-start space-x-3">
                  <span className="text-secondary mt-1">✓</span>
                  <span className="text-sm">College fest promotions</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-secondary mt-1">✓</span>
                  <span className="text-sm">Brand collaborations</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-secondary mt-1">✓</span>
                  <span className="text-sm">Student influencer network</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-secondary mt-1">✓</span>
                  <span className="text-sm">Targeted campus ads</span>
                </li>
              </ul>
              <Button className="w-full bg-secondary text-secondary-foreground font-bold hover:shadow-xl hover:shadow-secondary/50 transition-all" data-testid="button-contact-ads">
                <span className="mr-2">✉️</span>Get in Touch
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="glassmorphism border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-white text-xl">🤫</span>
                </div>
                <span className="text-xl font-bold gradient-text">CampusConfess.ai</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Your safe space for anonymous confessions, advice, and campus connections.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Trending</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">AI Chatbot</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Premium</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Safety Guidelines</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Report Issue</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Community Guidelines</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>&copy; 2024 CampusConfess.ai. All rights reserved.</p>
            <p className="mt-4 md:mt-0">Made with 💜 for students across India</p>
          </div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <Button
        onClick={() => setShowPostModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-primary to-accent text-white rounded-full shadow-2xl hover:shadow-primary/50 transition-all transform hover:scale-110 z-50"
        data-testid="button-floating-post"
      >
        <Plus className="h-8 w-8" />
      </Button>

      {/* Modals */}
      <PostConfessionModal open={showPostModal} onOpenChange={setShowPostModal} />
      <AIChatbot open={showAIChat} onOpenChange={setShowAIChat} />
    </div>
  );
}
