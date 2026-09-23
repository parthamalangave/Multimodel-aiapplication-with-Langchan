"use client";

import React, { useState } from "react";
import { User, Sparkles, AlertCircle, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export interface MessageProps {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  isError?: boolean;
}

export const Message: React.FC<MessageProps> = ({
  role,
  content,
  timestamp,
  isError = false,
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = role === "user";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className={`group relative flex gap-4 py-4 px-4 sm:px-6 rounded-2xl transition-all ${
        isUser
          ? "bg-zinc-800/40 border border-zinc-700/40 ml-6 sm:ml-12"
          : isError
          ? "bg-red-950/20 border border-red-500/30 mr-6 sm:mr-12 text-red-200"
          : "bg-transparent hover:bg-zinc-900/30 mr-6 sm:mr-12"
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 pt-0.5">
        {isUser ? (
          <div className="w-7 h-7 rounded-lg bg-zinc-700 flex items-center justify-center text-zinc-200 shadow-sm">
            <User className="w-4 h-4" />
          </div>
        ) : isError ? (
          <div className="w-7 h-7 rounded-lg bg-red-900/50 border border-red-500/40 flex items-center justify-center text-red-400">
            <AlertCircle className="w-4 h-4" />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-900/20">
            <Sparkles className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="font-medium text-zinc-300">
            {isUser ? "You" : isError ? "System Alert" : "Assistant"}
          </span>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {timestamp && <span suppressHydrationWarning>{timestamp}</span>}
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 transition-colors"
              title="Copy message"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Formatted Markdown + Math Content */}
        <div className="text-sm text-zinc-100 leading-relaxed break-words font-normal">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-zinc-50">{children}</strong>,
              em: ({ children }) => <em className="italic text-zinc-200">{children}</em>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-amber-500/60 pl-3 italic my-2 text-zinc-400">
                  {children}
                </blockquote>
              ),
              code: ({ inline, className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || "");
                const codeString = String(children).replace(/\n$/, "");

                if (inline) {
                  return (
                    <code className="px-1.5 py-0.5 rounded bg-zinc-800/80 font-mono text-xs text-amber-300 border border-zinc-700/50">
                      {children}
                    </code>
                  );
                }

                return (
                  <div className="my-3 overflow-hidden rounded-xl border border-zinc-700/60 bg-zinc-950/90 shadow-sm">
                    <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-1.5 text-xs text-zinc-400 bg-zinc-900/60">
                      <span className="font-mono lowercase">{match ? match[1] : "text"}</span>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(codeString)}
                        className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
                        title="Copy code"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                    </div>
                    <pre className="p-4 overflow-x-auto text-xs font-mono text-zinc-200 leading-relaxed">
                      <code>{codeString}</code>
                    </pre>
                  </div>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default Message;
