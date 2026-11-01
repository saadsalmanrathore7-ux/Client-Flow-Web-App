"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Send, MessageCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Topbar } from "@/components/dashboard/topbar";

/* ─── types ─────────────────────────────────────────────── */
type Conversation = {
  id: string;
  projectId: string;
  projectTitle: string;
  lastMessageBody: string | null;
  lastMessageAt: string;
  unreadCount: number;
};

type Message = {
  id: string;
  body: string;
  fileUrl: string | null;
  createdAt: string;
  readAt: string | null;
  senderId: string;
  sender: { id: string; name: string; role: string };
};

type ConversationDetail = {
  id: string;
  projectId: string;
  projectTitle: string;
  messages: Message[];
};

/* ─── component ──────────────────────────────────────────── */
export default function ChatPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const urlConvId = searchParams.get("conversationId");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [activeConv, setActiveConv] = useState<ConversationDetail | null>(null);
  const [loadingConv, setLoadingConv] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* load conversation list */
  useEffect(() => {
    async function load() {
      setLoadingList(true);
      try {
        const res = await fetch("/api/chat/conversations");
        if (res.ok) setConversations(await res.json());
      } finally {
        setLoadingList(false);
      }
    }
    load();
  }, []);

  /* open conversation from URL param or first in list */
  useEffect(() => {
    if (loadingList) return;
    const target = urlConvId
      ? conversations.find((c) => c.id === urlConvId)
      : conversations[0];
    if (target) openConversation(target.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingList, urlConvId]);

  const openConversation = useCallback(async (id: string) => {
    setLoadingConv(true);
    try {
      const res = await fetch(`/api/chat/conversations/${id}`);
      if (res.ok) setActiveConv(await res.json());
    } finally {
      setLoadingConv(false);
    }
  }, []);

  /* scroll to bottom when messages change */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages]);

  const sendMessage = async () => {
    if (!draft.trim() || !activeConv) return;
    setSending(true);
    const body = draft.trim();
    setDraft("");

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeConv.id, body }),
      });
      if (res.ok) {
        const newMsg: Message = await res.json();
        setActiveConv((prev) =>
          prev ? { ...prev, messages: [...prev.messages, newMsg] } : prev,
        );
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConv.id
              ? { ...c, lastMessageBody: body, lastMessageAt: new Date().toISOString() }
              : c,
          ),
        );
      }
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const myId = (session?.user as { id?: string })?.id;

  return (
    <div className="flex flex-col h-screen">
      <Topbar title="Messages" />

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left: conversation list ── */}
        <aside className="w-80 flex-shrink-0 border-r border-stone-200 bg-white flex flex-col">
          <div className="px-4 py-3 border-b border-stone-200">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Conversations
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingList ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <MessageCircle className="w-10 h-10 text-stone-300 mb-3" />
                <p className="text-sm text-stone-500">No conversations yet.</p>
                <p className="text-xs text-stone-400 mt-1">
                  Conversations are created per project.
                </p>
              </div>
            ) : (
              conversations.map((conv, i) => {
                const isActive = activeConv?.id === conv.id;
                return (
                    <button
                    key={conv.id}
                    onClick={() => openConversation(conv.id)}
                    className={cn(
                      "animate-slide-left w-full text-left px-4 py-3 border-b border-stone-100 transition-colors",
                      isActive
                        ? "bg-stone-900 text-white"
                        : "hover:bg-stone-50 text-stone-900",
                    )}
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-sm font-medium truncate", isActive ? "text-white" : "text-stone-900")}>
                        {conv.projectTitle}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="flex-shrink-0 text-xs font-semibold bg-stone-900 text-white rounded-full px-2 py-0.5">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className={cn("text-xs mt-0.5 truncate", isActive ? "text-stone-300" : "text-stone-400")}>
                      {conv.lastMessageBody ?? "No messages yet"}
                    </p>
                    <p className={cn("text-xs mt-1", isActive ? "text-stone-400" : "text-stone-400")}>
                      {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* ── Right: message thread ── */}
        <main className="flex-1 flex flex-col bg-stone-50 overflow-hidden">
          {loadingConv ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
            </div>
          ) : !activeConv ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <MessageCircle className="w-14 h-14 text-stone-300 mb-4" />
              <h2 className="text-lg font-semibold text-stone-700">Select a conversation</h2>
              <p className="text-sm text-stone-400 mt-1">
                Choose a project conversation from the left panel.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-6 py-4 bg-white border-b border-stone-200 flex-shrink-0">
                <h2 className="text-sm font-semibold text-stone-900">
                  {activeConv.projectTitle}
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">Project conversation</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {activeConv.messages.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-sm text-stone-400">No messages yet. Start the conversation!</p>
                  </div>
                )}

                {activeConv.messages.map((msg) => {
                  const isMe = msg.senderId === myId;
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-3",
                        isMe ? "flex-row-reverse animate-bubble-right" : "flex-row animate-bubble-left",
                      )}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center text-white text-xs font-semibold">
                        {msg.sender.name.slice(0, 2).toUpperCase()}
                      </div>

                      {/* Bubble */}
                      <div className={cn("max-w-[70%] space-y-1", isMe ? "items-end" : "items-start")}>
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                            isMe
                              ? "bg-stone-900 text-white rounded-tr-sm"
                              : "bg-white border border-stone-200 text-stone-900 rounded-tl-sm",
                          )}
                        >
                          {msg.body}
                        </div>
                        <p className={cn("text-xs text-stone-400", isMe ? "text-right" : "text-left")}>
                          {msg.sender.name} ·{" "}
                          {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-6 py-4 bg-white border-t border-stone-200 flex-shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex items-center gap-3"
                >
                  <Input
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type a message…"
                    className="flex-1 h-11 rounded-xl bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400"
                    disabled={sending}
                  />
                  <Button
                    type="submit"
                    disabled={!draft.trim() || sending}
                    className="h-11 w-11 rounded-xl bg-stone-900 hover:bg-stone-800 text-white p-0 flex-shrink-0 disabled:opacity-50"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </form>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
