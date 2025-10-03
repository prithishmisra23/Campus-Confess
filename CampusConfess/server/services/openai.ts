import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_SECRET_KEY || "default_key"
});

export interface ModerationResult {
  isAppropriate: boolean;
  confidence: number;
  sentiment: "positive" | "negative" | "neutral";
  flags: string[];
  suggestedActions: string[];
}

export interface AdviceResponse {
  advice: string;
  category: string;
  urgency: "low" | "medium" | "high";
  resources?: string[];
  followUpSuggestions?: string[];
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
}

export class OpenAIService {
  async moderateContent(content: string): Promise<ModerationResult> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `You are a content moderator for a college confession platform. Analyze the content for:
            1. Appropriateness (harmful content, hate speech, explicit content)
            2. Sentiment (positive, negative, neutral)
            3. Policy violations
            4. Suggested moderation actions

            Respond with JSON in this format:
            {
              "isAppropriate": boolean,
              "confidence": number (0-1),
              "sentiment": "positive" | "negative" | "neutral",
              "flags": ["array of issues if any"],
              "suggestedActions": ["array of suggested actions"]
            }`
          },
          {
            role: "user",
            content: `Moderate this confession: "${content}"`
          }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 1024,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        isAppropriate: result.isAppropriate ?? true,
        confidence: Math.max(0, Math.min(1, result.confidence ?? 0.5)),
        sentiment: result.sentiment || "neutral",
        flags: result.flags || [],
        suggestedActions: result.suggestedActions || [],
      };
    } catch (error) {
      console.error("Content moderation failed:", error);
      return {
        isAppropriate: true,
        confidence: 0.5,
        sentiment: "neutral",
        flags: [],
        suggestedActions: [],
      };
    }
  }

  async generateAdvice(problem: string, category?: string, urgency?: string): Promise<AdviceResponse> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `You are an AI counselor for college students. Provide empathetic, evidence-based advice for student problems. 
            Focus on practical solutions, emotional support, and helpful resources.
            
            Categories: mental_health, relationships, academics, career, family, social, general
            Urgency levels: low, medium, high
            
            For high urgency issues (self-harm, crisis), always include crisis resources.
            
            Respond with JSON in this format:
            {
              "advice": "detailed advice text",
              "category": "detected category",
              "urgency": "detected urgency level",
              "resources": ["array of helpful resources"],
              "followUpSuggestions": ["array of follow-up questions/suggestions"]
            }`
          },
          {
            role: "user",
            content: `Problem: ${problem}
            Category: ${category || 'general'}
            Urgency: ${urgency || 'low'}
            
            Please provide thoughtful advice for this college student.`
          }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 2048,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        advice: result.advice || "I understand you're going through a challenging time. Consider reaching out to your college counseling services or a trusted friend for support.",
        category: result.category || category || "general",
        urgency: (result.urgency as "low" | "medium" | "high") || (urgency as "low" | "medium" | "high") || "low",
        resources: result.resources || [],
        followUpSuggestions: result.followUpSuggestions || [],
      };
    } catch (error) {
      console.error("Advice generation failed:", error);
      return {
        advice: "I'm here to help, but I'm experiencing technical difficulties. Please consider reaching out to your college counseling services or a trusted friend for support.",
        category: category || "general", 
        urgency: urgency || "low",
        resources: ["College Counseling Center", "Student Support Services"],
        followUpSuggestions: ["Would you like to talk more about this?"],
      };
    }
  }

  async generateChatResponse(messages: Array<{role: string, content: string}>): Promise<ChatResponse> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5", 
        messages: [
          {
            role: "system",
            content: `You are a supportive AI counselor for college students. Provide empathetic, helpful responses to student concerns about mental health, relationships, academics, career, and general life issues.

            Guidelines:
            - Be warm, understanding, and non-judgmental
            - Provide practical advice when appropriate
            - Suggest professional resources for serious issues
            - Ask follow-up questions to understand better
            - Keep responses conversational and supportive
            - For crisis situations, provide immediate resources

            Respond with JSON in this format:
            {
              "message": "your response message",
              "suggestions": ["array of follow-up conversation starters"]
            }`
          },
          ...messages.map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content
          }))
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 1024,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        message: result.message || "I'm here to listen and support you. Can you tell me more about what's on your mind?",
        suggestions: result.suggestions || [
          "Tell me more about how you're feeling",
          "What would be most helpful right now?",
          "Have you talked to anyone else about this?"
        ],
      };
    } catch (error) {
      console.error("Chat response generation failed:", error);
      return {
        message: "I'm experiencing some technical difficulties, but I'm here to support you. Can you tell me more about what's going on?",
        suggestions: [
          "Tell me more about your situation",
          "What kind of support would be helpful?",
          "How are you feeling right now?"
        ],
      };
    }
  }

  async *streamChatResponse(messages: Array<{role: string, content: string}>): AsyncGenerator<string, void, unknown> {
    try {
      const stream = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system", 
            content: `You are a supportive AI counselor for college students. Provide empathetic, helpful responses to student concerns. Be conversational and supportive.`
          },
          ...messages.map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content
          }))
        ],
        max_completion_tokens: 1024,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      console.error("Streaming chat response failed:", error);
      yield "I'm here to help, but I'm experiencing some technical difficulties. Please let me know how I can support you.";
    }
  }
}

export const openaiService = new OpenAIService();
