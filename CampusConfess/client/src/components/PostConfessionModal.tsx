import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PenTool, AlertTriangle } from "lucide-react";

interface PostConfessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const colleges = [
  "SRM University",
  "Delhi University", 
  "IIT Delhi",
  "Amity University",
  "VIT University",
  "BITS Pilani",
  "Other"
];

const tags = [
  "crush", "relationships", "academics", "career", 
  "mental_health", "family", "social", "general",
  "college_life", "friendship", "anxiety", "depression",
  "motivation", "heartbreak"
];

export default function PostConfessionModal({ open, onOpenChange }: PostConfessionModalProps) {
  const [confession, setConfession] = useState({
    content: "",
    college: "",
    tags: [] as string[],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const postMutation = useMutation({
    mutationFn: async (data: typeof confession) => {
      const res = await apiRequest("POST", "/api/confessions", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Confession Posted!",
        description: "Your anonymous confession has been shared with the community.",
      });
      setConfession({ content: "", college: "", tags: [] });
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["/api/confessions"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post confession. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!confession.content.trim()) {
      toast({
        title: "Empty Confession",
        description: "Please write your confession before posting.",
        variant: "destructive",
      });
      return;
    }

    if (!confession.college) {
      toast({
        title: "College Required",
        description: "Please select your college.",
        variant: "destructive",
      });
      return;
    }

    postMutation.mutate(confession);
  };

  const toggleTag = (tag: string) => {
    setConfession(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag].slice(0, 5) // Max 5 tags
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glassmorphism max-w-2xl" data-testid="modal-post-confession">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl font-bold">
            <PenTool className="h-5 w-5 text-primary" />
            <span>Share Your Confession</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Content Input */}
          <div className="space-y-2">
            <Label htmlFor="confession-content" className="text-sm font-medium">
              What's on your mind?
            </Label>
            <Textarea
              id="confession-content"
              placeholder="Share your thoughts, feelings, or experiences... Everything is anonymous and secure."
              value={confession.content}
              onChange={(e) => setConfession(prev => ({ ...prev, content: e.target.value }))}
              className="min-h-[120px] resize-none"
              maxLength={1000}
              data-testid="textarea-confession-content"
            />
            <div className="text-right text-xs text-muted-foreground">
              {confession.content.length}/1000 characters
            </div>
          </div>

          {/* College Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">College</Label>
            <Select 
              value={confession.college} 
              onValueChange={(value) => setConfession(prev => ({ ...prev, college: value }))}
            >
              <SelectTrigger data-testid="select-confession-college">
                <SelectValue placeholder="Select your college" />
              </SelectTrigger>
              <SelectContent>
                {colleges.map(college => (
                  <SelectItem key={college} value={college}>
                    {college}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Tags <span className="text-xs text-muted-foreground">(Optional, max 5)</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    confession.tags.includes(tag)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary"
                  }`}
                  data-testid={`tag-${tag}`}
                >
                  #{tag}
                </button>
              ))}
            </div>
            {confession.tags.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Selected: {confession.tags.join(", ")}
              </div>
            )}
          </div>

          {/* Guidelines */}
          <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/30">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-secondary mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-secondary mb-1">Community Guidelines</p>
                <ul className="space-y-1 text-xs">
                  <li>• Be respectful and kind to others</li>
                  <li>• No hate speech, harassment, or discrimination</li>
                  <li>• No personal information or identifiable details</li>
                  <li>• Content is AI-moderated for safety</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              data-testid="button-cancel-confession"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={postMutation.isPending || !confession.content.trim() || !confession.college}
              className="flex-1 bg-gradient-to-r from-primary to-accent text-white font-semibold hover:shadow-xl hover:shadow-primary/50 transition-all"
              data-testid="button-submit-confession"
            >
              {postMutation.isPending ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Posting...
                </>
              ) : (
                <>
                  <PenTool className="mr-2 h-4 w-4" />
                  Post Anonymously
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
