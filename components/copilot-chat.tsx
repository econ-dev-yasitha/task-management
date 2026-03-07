"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Send, Loader2, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFunctions, httpsCallable } from "firebase/functions";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CopilotChatProps {
  userId: string;
}

export function CopilotChat({ userId }: CopilotChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your task assistant. Ask me anything about your tasks — like 'What's due this week?' or 'How many tasks are completed?'",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const functions = getFunctions();
      const askCopilot = httpsCallable(functions, "askCopilot");
      const result = await askCopilot({ message: userMessage, userId });
      const data = result.data as { reply: string };
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process that. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="flex h-[480px] w-[360px] flex-col rounded-2xl border bg-card shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl bg-primary px-4 py-3">
            <div className="flex items-center gap-2">
              <Bot className="size-5 text-primary-foreground" />
              <span className="text-sm font-semibold text-primary-foreground">
                Task Assistant
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                  msg.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                )}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 bg-muted rounded-2xl rounded-bl-sm px-3 py-2 max-w-[85%]">
                <Loader2 className="size-3 animate-spin" />
                <span className="text-xs text-muted-foreground">Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t px-3 py-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about your tasks..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button
              size="icon-sm"
              onClick={handleSend}
              disabled={!input.trim() || loading}
            >
              <Send className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <Button
        size="icon"
        className="size-14 rounded-full shadow-lg"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? <X className="size-5" /> : <MessageCircle className="size-5" />}
      </Button>
    </div>
  );
}