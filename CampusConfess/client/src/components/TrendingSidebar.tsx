import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Bot } from "lucide-react";
import type { Confession } from "@shared/schema";

interface TrendingSidebarProps {
  trending?: Confession[];
  stats?: {
    total_confessions: number;
    active_users: number;
    moderated: number;
    colleges: number;
  };
  onOpenChat: () => void;
}

export default function TrendingSidebar({ trending, stats, onOpenChat }: TrendingSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Trending Section */}
      <Card className="glassmorphism" id="trending">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center">
              <Flame className="text-red-500 mr-2 fire-animation" />
              Trending Now
            </h3>
            <Button variant="link" className="text-sm text-primary hover:underline p-0" data-testid="button-see-all-trending">
              See all
            </Button>
          </div>
          <div className="space-y-4">
            {trending?.length ? (
              trending.slice(0, 4).map((post, index) => (
                <div 
                  key={post.id}
                  className="p-4 bg-card/50 rounded-lg hover:bg-card transition-colors cursor-pointer border border-border/30"
                  data-testid={`trending-post-${index}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{post.college}</span>
                    <span className="text-xs font-semibold text-red-500 flex items-center">
                      <Flame className="mr-1 h-3 w-3" />
                      {post.trendingScore || 0}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-2 mb-2" data-testid="text-trending-preview">
                    {post.content.substring(0, 100)}...
                  </p>
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    <span data-testid="text-trending-upvotes">
                      <span className="mr-1">↑</span>{post.upvotes || 0}
                    </span>
                    <span data-testid="text-trending-comments">
                      <span className="mr-1">💬</span>{post.commentCount || 0}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Flame className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No trending posts yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Chatbot CTA */}
      <Card className="glassmorphism border-2 border-secondary/30" id="chatbot">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
              <Bot className="text-white h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">AI Counselor</h3>
              <p className="text-xs text-muted-foreground">24/7 Support</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Struggling with something? Chat with our AI counselor for advice on mental health, career, relationships, and college life.
          </p>
          <div className="space-y-2 mb-4">
            <div className="flex items-start space-x-2 text-sm">
              <span className="text-accent mt-1">✓</span>
              <span>Completely anonymous</span>
            </div>
            <div className="flex items-start space-x-2 text-sm">
              <span className="text-accent mt-1">✓</span>
              <span>Evidence-based advice</span>
            </div>
            <div className="flex items-start space-x-2 text-sm">
              <span className="text-accent mt-1">✓</span>
              <span>Available anytime</span>
            </div>
          </div>
          <Button 
            onClick={onOpenChat}
            className="w-full bg-gradient-to-r from-secondary to-primary text-white font-semibold hover:shadow-xl hover:shadow-secondary/50 transition-all"
            data-testid="button-start-chatting"
          >
            <span className="mr-2">💬</span>Start Chatting
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="glassmorphism">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4">Community Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Confessions</span>
              <span className="font-bold text-primary" data-testid="text-total-confessions">
                {stats?.total_confessions?.toLocaleString() || "0"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Users</span>
              <span className="font-bold text-secondary" data-testid="text-active-users">
                {stats?.active_users?.toLocaleString() || "0"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">AI Moderated</span>
              <span className="font-bold text-accent" data-testid="text-moderated">
                {stats?.moderated || 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Colleges</span>
              <span className="font-bold text-foreground" data-testid="text-colleges">
                {stats?.colleges || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Premium Feature Teaser */}
      <Card className="glassmorphism bg-gradient-to-br from-accent/20 to-primary/20 border-2 border-accent/30">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-accent text-xl">👑</span>
            <h3 className="text-lg font-bold gradient-text">Premium Features</h3>
          </div>
          <ul className="space-y-2 mb-4 text-sm">
            <li className="flex items-start space-x-2">
              <span className="text-accent mt-1">★</span>
              <span>Message your crush anonymously</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-accent mt-1">★</span>
              <span>Boost posts to trending</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-accent mt-1">★</span>
              <span>Custom profile badges</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-accent mt-1">★</span>
              <span>Ad-free experience</span>
            </li>
          </ul>
          <Button className="w-full bg-gradient-to-r from-accent to-primary text-white font-semibold hover:shadow-xl hover:shadow-accent/50 transition-all" data-testid="button-upgrade-premium">
            <span className="mr-2">👑</span>Upgrade for ₹49/month
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
