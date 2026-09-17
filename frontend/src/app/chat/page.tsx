"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { chatAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ChatInput } from "@/components/chat/chat-input";
import { Skeleton } from "@/components/ui/skeleton";
import { Stethoscope, Trash2, Pizza, Apple, Coffee, Dumbbell, Edit } from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  { icon: Pizza, text: "What should I eat for lunch?" },
  { icon: Apple, text: "How do I add more protein?" },
  { icon: Coffee, text: "Remind me to drink water" },
  { icon: Dumbbell, text: "Best food after gym?" },
];

function groupByDate(messages: any[]) {
  const groups: Record<string, any[]> = {};
  messages.forEach((m) => {
    const key = new Date(m.created_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  });
  return groups;
}

export default function ChatPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [streamingReply, setStreamingReply] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const autoSentRef = useRef(false);

  const { data: history, isLoading } = useQuery({
    queryKey: ["chat-history"],
    queryFn: async () => { const res = await chatAPI.getHistory(); return res.data; },
  });

  const sendMutation = useMutation({
    mutationFn: async (message: string) => { const res = await chatAPI.sendMessage(message); return res.data; },
    onMutate: async (message) => {
      await queryClient.cancelQueries({ queryKey: ["chat-history"] });
      const previous = queryClient.getQueryData(["chat-history"]);
      queryClient.setQueryData(["chat-history"], (old: any) => [
        ...(old || []),
        { id: "temp-" + Date.now(), role: "user", message, created_at: new Date().toISOString() },
      ]);
      setStreamingReply("");
      return { previous };
    },
    onSuccess: (data) => {
      const fullReply = data.reply;
      let i = 0;
      const interval = setInterval(() => {
        i += 3;
        setStreamingReply(fullReply.slice(0, i));
        if (i >= fullReply.length) {
          clearInterval(interval);
          setStreamingReply(null);
          queryClient.invalidateQueries({ queryKey: ["chat-history"] });
        }
      }, 15);
    },
    onError: (_err: unknown, _msg, context: any) => {
      if (context?.previous) queryClient.setQueryData(["chat-history"], context.previous);
      setStreamingReply(null);
      toast({ variant: "destructive", title: "Could not send message" });
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => await chatAPI.clearHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-history"] });
      setSelectedDate(null);
      toast({ title: "Chat cleared" });
    },
  });

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history, streamingReply]);

  const groups = groupByDate(history || []);
  const dateKeys = Object.keys(groups);

  // Auto-select latest date
  useEffect(() => {
    if (dateKeys.length > 0 && !selectedDate) setSelectedDate(dateKeys[dateKeys.length - 1]);
  }, [dateKeys.length]);

  // Auto-send ?q= from food analysis "Ask Coach about this"
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && !autoSentRef.current) {
      autoSentRef.current = true;
      sendMutation.mutate(decodeURIComponent(q));
    }
  }, []);

  const visibleMessages = selectedDate && groups[selectedDate] ? groups[selectedDate] : (history || []);
  const isEmpty = !isLoading && (!history || history.length === 0);
  const isSending = sendMutation.isPending || streamingReply !== null;

  return (
    <div className="flex h-[calc(100vh-3rem)] -mx-4 md:-mx-6 -my-4 md:-my-6 bg-surface">

      {/* Conversations panel */}
      <div className="hidden md:flex w-64 flex-col bg-surface-container-lowest border-r border-outline-variant/30 shrink-0">
        <div className="flex items-center justify-between px-4 py-4 border-b border-outline-variant/30">
          <p className="font-semibold text-on-surface">Conversations</p>
          <button className="p-1.5 hover:bg-surface-container-low rounded-lg transition-colors">
            <Edit className="h-4 w-4 text-on-surface-variant" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {isLoading ? (
            <div className="space-y-2 px-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}
            </div>
          ) : dateKeys.length === 0 ? (
            <p className="text-xs text-on-surface-variant text-center mt-8 px-4">No conversations yet</p>
          ) : (
            dateKeys.slice().reverse().map((date) => {
              const msgs = groups[date];
              const firstUser = msgs.find((m) => m.role === "user");
              const isActive = selectedDate === date;
              return (
                <button key={date} onClick={() => setSelectedDate(date)}
                  className={cn("w-full text-left px-3 py-2 mx-1 rounded-xl transition-all",
                    isActive ? "bg-primary/10" : "hover:bg-surface-container-low")}>
                  <p className={cn("text-sm font-medium truncate", isActive ? "text-primary" : "text-on-surface")}>
                    {firstUser?.message || "Chat"}
                  </p>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-on-surface-variant truncate">{msgs[msgs.length-1]?.message?.slice(0,30)}...</p>
                    <span className="text-xs text-on-surface-variant shrink-0 ml-2">{date.split(",")[0]}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
        {history && history.length > 0 && (
          <div className="p-3 border-t border-outline-variant/30">
            <button onClick={() => { if (confirm("Clear all chat history?")) clearMutation.mutate(); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-error-container/40 rounded-lg transition-colors">
              <Trash2 className="h-4 w-4" /> Clear History
            </button>
          </div>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-surface-container-lowest border-b border-outline-variant/30 px-5 py-3 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <Stethoscope className="h-4 w-4 text-on-primary" />
          </div>
          <div>
            <p className="font-semibold text-on-surface text-sm">Dr. Nova (AI Coach)</p>
            <p className="text-xs text-primary flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block"></span>
              Context Active · Online
            </p>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          {isLoading ? (
            <div className="space-y-4 max-w-2xl mx-auto">
              {[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-2xl" />)}
            </div>
          ) : isEmpty ? (
            <div className="max-w-2xl mx-auto text-center py-10">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="h-8 w-8 text-on-primary" />
              </div>
              <h2 className="text-xl font-bold text-on-surface">Hi! I&apos;m Dr. Nova, your AI nutrition coach</h2>
              <p className="text-on-surface-variant mt-2 text-sm">Ask me anything about food, meals, or nutrition.</p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUGGESTIONS.map(({ icon: Icon, text }) => (
                  <button key={text} onClick={() => sendMutation.mutate(text)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant bg-surface-container-lowest hover:border-primary/40 hover:bg-primary/5 transition-all text-left">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-on-surface">{text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-4">
              {visibleMessages.map((msg: any) => (
                <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                      <Stethoscope className="h-3.5 w-3.5 text-on-primary" />
                    </div>
                  )}
                  <div className={cn("max-w-[75%] rounded-2xl px-4 py-3 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-on-primary rounded-br-sm"
                      : "bg-surface-container-lowest border border-outline-variant/30 text-on-surface rounded-bl-sm shadow-sm")}>
                    <p className="leading-relaxed">{msg.message}</p>
                  </div>
                </div>
              ))}
              {streamingReply !== null && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                    <Stethoscope className="h-3.5 w-3.5 text-on-primary" />
                  </div>
                  <div className="max-w-[75%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm bg-surface-container-lowest border border-outline-variant/30 text-on-surface shadow-sm">
                    <p className="leading-relaxed">{streamingReply || "..."}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick chips */}
        {!isEmpty && (
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
            {SUGGESTIONS.map(({ icon: Icon, text }) => (
              <button key={text} onClick={() => sendMutation.mutate(text)} disabled={isSending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-container/40 text-xs text-on-secondary-container hover:bg-secondary-container transition-all shrink-0 disabled:opacity-50">
                <Icon className="h-3 w-3" /> {text}
              </button>
            ))}
          </div>
        )}

        <ChatInput onSend={(text) => sendMutation.mutate(text)} disabled={isSending} />
      </div>
    </div>
  );
}
