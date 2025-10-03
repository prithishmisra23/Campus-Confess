import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Bot, Send, User, Sparkles, Heart, BookOpen } from "lucide-react";

interface AIChatbotProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export default function AIChatbot({ open, onOpenChange }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI counselor. I'm here to listen and provide support for any college-related concerns, mental health questions, or life challenges you're facing. What's on your mind today?",
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const messagesToSend = [...messages, { role: "user" as const, content: userMessage, timestamp: Date.now() }];
      const res = await apiRequest("POST", "/api/chat", { 
        messages: messagesToSend.map(m => ({ role: m.role, content: m.content })),
        sessionId 
      });
      return res.json();
    },
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setMessages(prev => [
        ...prev.slice(0, -1), // Remove the pending user message
        {
          role: "user",
          content: input,
          timestamp: Date.now(),
        },
        {
          role: "assistant", 
          content: data.message,
          timestamp: Date.now(),
        }
      ]);
      setInput("");
    },
    onError: () => {
      setMessages(prev => prev.slice(0, -1)); // Remove the pending message
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message immediately
    setMessages(prev => [
      ...prev,
      {
        role: "user",
        content: input,
        timestamp: Date.now(),
      }
    ]);

    chatMutation.mutate(input);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickResponses = [
    "I'm feeling anxious about exams",
    "Tell me about career choices",
    "I'm having trouble with relationships",
    "Help with study motivation",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glassmorphism max-w-2xl h-[80vh] flex flex-col" data-testid="modal-ai-chatbot">
        <DialogHeader className="pb-4 border-b border-border/50">
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold">AI Counselor</span>
              <div className="text-sm text-muted-foreground font-normal">
                Anonymous • Secure • 24/7 Available
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4" data-testid="chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex space-x-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0">
                  {message.role === "user" ? (
                    <div className="from-primary to-accent">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="from-secondary to-primary">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                <Card className={`${message.role === "user" ? "bg-primary/20 border-primary/30" : "bg-card"}`}>
                  <CardContent className="p-3">
                    <p className="text-sm leading-relaxed" data-testid={`message-${index}`}>
                      {message.content}
                    </p>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
          
          {chatMutation.isPending && (
            <div className="flex justify-start">
              <div className="flex space-x-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <Card className="bg-card">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <div className="animate-pulse flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                      <span className="text-xs text-muted-foreground">AI is typing...</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Responses */}
        {messages.length === 1 && (
          <div className="pb-4">
            <p className="text-sm text-muted-foreground mb-3">Quick start topics:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickResponses.map((response, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(response)}
                  className="text-xs h-auto p-2 glassmorphism hover:border-primary text-left justify-start"
                  data-testid={`quick-response-${index}`}
                >
                  {response}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border/50 pt-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="flex-1"
                disabled={chatMutation.isPending}
                data-testid="input-chat-message"
              />
              <Button
                onClick={handleSend}
                disabled={chatMutation.isPending || !input.trim()}
                className="bg-gradient-to-r from-secondary to-primary text-white hover:shadow-lg transition-all"
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Heart className="h-3 w-3 text-accent" />
              <span>Confidential</span>
            </div>
            <div className="flex items-center space-x-1">
              <Sparkles className="h-3 w-3 text-secondary" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center space-x-1">
              <BookOpen className="h-3 w-3 text-primary" />
              <span>Evidence-Based</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
