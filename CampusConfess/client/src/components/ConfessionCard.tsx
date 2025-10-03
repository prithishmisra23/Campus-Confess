import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowUp, 
  ArrowDown, 
  MessageCircle, 
  Share, 
  Flag, 
  MoreHorizontal,
  Send,
  Bot 
} from "lucide-react";
import type { Confession, Comment } from "@shared/schema";

interface ConfessionCardProps {
  confession: Confession;
}

export default function ConfessionCard({ confession }: ConfessionCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch comments
  const { data: comments } = useQuery({
    queryKey: ["/api/confessions", confession.id, "comments"],
    enabled: showComments,
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async (type: "up" | "down") => {
      if (!user) throw new Error("Login required");
      const res = await apiRequest("POST", `/api/confessions/${confession.id}/vote`, { type });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/confessions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to vote",
        variant: "destructive",
      });
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/confessions/${confession.id}/comments`, { content });
      return res.json();
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["/api/confessions", confession.id, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/confessions"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    },
  });

  // Report mutation
  const reportMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Login required");
      const res = await apiRequest("POST", `/api/confessions/${confession.id}/report`, { 
        reason: "inappropriate_content",
        description: "Reported by user"
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Report Submitted",
        description: "Thank you for helping keep our community safe.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit report",
        variant: "destructive",
      });
    },
  });

  const handleVote = (type: "up" | "down") => {
    if (!user) {
      toast({
        title: "Login Required", 
        description: "Please log in to vote on confessions.",
        variant: "destructive",
      });
      return;
    }
    voteMutation.mutate(type);
  };

  const handleComment = () => {
    if (!commentText.trim()) {
      toast({
        title: "Empty Comment",
        description: "Please write something before posting.",
        variant: "destructive",
      });
      return;
    }
    commentMutation.mutate(commentText);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "CampusConfess.ai",
        text: "Check out this confession",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Confession link copied to clipboard!",
      });
    }
  };

  const getEmoji = (anonymousName: string) => {
    if (anonymousName.includes("Panda")) return "🐼";
    if (anonymousName.includes("Tiger")) return "🐅";
    if (anonymousName.includes("Eagle")) return "🦅";
    if (anonymousName.includes("Bear")) return "🐻";
    if (anonymousName.includes("Phoenix")) return "🔥";
    if (anonymousName.includes("Owl")) return "🦉";
    return "🤫";
  };

  const getTrendingIcon = () => {
    if ((confession.trendingScore || 0) > 300) {
      return <span className="fire-animation text-red-500 ml-2">🔥</span>;
    }
    return null;
  };

  const getSentimentColor = () => {
    const aiAnalysis = confession.aiAnalysis as any;
    if (aiAnalysis?.sentiment === "positive") return "text-green-500";
    if (aiAnalysis?.sentiment === "negative") return "text-red-500";
    return "text-blue-500";
  };

  return (
    <Card className="confession-card glassmorphism relative overflow-hidden" data-testid={`confession-${confession.id}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -z-10"></div>
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
              <span className="text-white">{getEmoji(confession.anonymousName)}</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold" data-testid="text-anonymous-name">
                  {confession.anonymousName}
                </span>
                <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full font-medium">
                  {confession.college}
                </span>
                {getTrendingIcon()}
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date(confession.createdAt!).toLocaleDateString()}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" data-testid="button-more">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-4">
          <p className="text-foreground leading-relaxed mb-3" data-testid="text-confession-content">
            {confession.content}
          </p>
          {confession.tags && confession.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {confession.tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-primary/20 text-primary text-xs rounded-full"
                  data-testid={`tag-${tag}`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote("up")}
              disabled={voteMutation.isPending}
              className="flex items-center space-x-2 text-muted-foreground hover:text-accent transition-colors group"
              data-testid="button-upvote"
            >
              <ArrowUp className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">{confession.upvotes || 0}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote("down")}
              disabled={voteMutation.isPending}
              className="flex items-center space-x-2 text-muted-foreground hover:text-destructive transition-colors group"
              data-testid="button-downvote"
            >
              <ArrowDown className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">{confession.downvotes || 0}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-comments"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{confession.commentCount || 0} comments</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-share"
            >
              <Share className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => reportMutation.mutate()}
              disabled={reportMutation.isPending}
              className="text-muted-foreground hover:text-red-500 transition-colors"
              data-testid="button-report"
            >
              <Flag className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* AI Analysis */}
        {confession.aiAnalysis && (
          <div className="mt-4 p-3 bg-secondary/10 rounded-lg border border-secondary/30">
            <div className="flex items-center space-x-2 text-sm">
              <Bot className="h-4 w-4 text-secondary" />
              <span className="text-secondary font-medium">AI Analysis:</span>
              <span className={`${getSentimentColor()} capitalize`}>
                {(confession.aiAnalysis as any).sentiment || 'Neutral'} sentiment
              </span>
              <span className="text-muted-foreground">• Safe content ✓</span>
            </div>
          </div>
        )}

        {/* Comments Section */}
        {showComments && (
          <div className="mt-6 space-y-4 border-t border-border/50 pt-4">
            {(comments as Comment[] | undefined)?.map((comment: Comment) => (
              <div key={comment.id} className="flex items-start space-x-3" data-testid={`comment-${comment.id}`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">🤫</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-sm">{comment.anonymousName}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt!).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground" data-testid="text-comment-content">{comment.content}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-accent h-auto p-0"
                      data-testid="button-comment-upvote"
                    >
                      <ArrowUp className="h-3 w-3 mr-1" />
                      {comment.upvotes || 0}
                    </Button>
                  </div>
                </div>
              </div>
            )) || (
              <p className="text-center text-muted-foreground py-4">No comments yet. Be the first to comment!</p>
            )}

            {/* Comment Input */}
            <div className="flex items-start space-x-3 pt-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">🤫</span>
              </div>
              <div className="flex-1 flex space-x-2">
                <Input
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleComment()}
                  className="flex-1"
                  data-testid="input-comment"
                />
                <Button
                  onClick={handleComment}
                  disabled={commentMutation.isPending || !commentText.trim()}
                  className="bg-primary text-primary-foreground hover:shadow-lg transition-all"
                  data-testid="button-post-comment"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
