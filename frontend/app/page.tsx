"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  MessageSquare,
  FileText,
  Cpu,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import Chat from "@/components/Chat";
import { getHealthStatus, HealthResponse } from "@/lib/api";

export default function Home() {
  const [backendHealth, setBackendHealth] = useState<HealthResponse | null>(null);
  const [backendStatus, setBackendStatus] = useState<"connected" | "disconnected" | "checking">(
    "checking"
  );
  const [activeSessionId, setActiveSessionId] = useState("session-1");

  const [chatSessions] = useState([
    { id: "session-1", title: "Current Conversation", date: "Active" },
    { id: "session-2", title: "LangChain Architecture", date: "Yesterday" },
  ]);

  useEffect(() => {
    let isMounted = true;

    async function checkHealth() {
      try {
        const data = await getHealthStatus();
        if (isMounted) {
          setBackendHealth(data);
          setBackendStatus("connected");
        }
      } catch (err) {
        if (isMounted) {
          console.warn("Backend health check warning:", err);
          setBackendStatus("disconnected");
        }
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#121214] text-zinc-100 font-sans antialiased">
      {/* SIDEBAR (Claude-style clean minimalist drawer) */}
      <aside className="w-64 flex-shrink-0 bg-[#17171a] border-r border-zinc-800/80 flex flex-col justify-between hidden md:flex">
        {/* Top sidebar area */}
        <div className="p-3.5 space-y-4 overflow-y-auto">
          {/* Workspace Title */}
          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-semibold text-xs text-zinc-100 tracking-tight">
                Multimodal AI
              </h1>
              <p className="text-[10px] text-zinc-400">Local · Zero-API-Cost</p>
            </div>
          </div>

          {/* New Chat Button */}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-between px-3 py-2 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 rounded-xl text-xs text-zinc-200 font-medium transition-all shadow-sm active:scale-[0.99]"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              New Chat
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">⌘N</span>
          </button>

          {/* Chats Section */}
          <div className="space-y-1.5 pt-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 px-2">
              Conversations
            </p>
            <div className="space-y-0.5">
              {chatSessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => setActiveSessionId(session.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                    activeSessionId === session.id
                      ? "bg-zinc-800/90 text-zinc-100 font-medium border border-zinc-700/60"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 truncate">
                    <MessageSquare className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                    <span className="truncate">{session.title}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-zinc-400 opacity-50 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Active Model Stack */}
          <div className="space-y-2 pt-3 border-t border-zinc-800/60">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 px-2">
              Model Engine
            </p>
            <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-amber-400" />
                  Text Model
                </span>
                <span className="font-mono text-[11px] text-amber-300 font-medium">
                  qwen3.5:4b
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 border-t border-zinc-800/60 pt-1.5 flex justify-between">
                <span>Orchestrator:</span>
                <span className="text-zinc-300">LangChain Core</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom sidebar status */}
        <div className="p-3 border-t border-zinc-800/70 bg-[#141417] space-y-2 text-[11px]">
          <div className="flex items-center justify-between px-1">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Private Local
            </span>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
            >
              Docs <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </aside>

      {/* MAIN CONVERSATION WORKSPACE */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#121214] p-2 sm:p-4">
        <Chat backendStatus={backendStatus} />
      </main>
    </div>
  );
}
