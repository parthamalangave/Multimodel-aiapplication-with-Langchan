"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, AlertCircle } from "lucide-react";
import Message, { MessageProps } from "./Message";
import FileUpload, { SelectedFile } from "./FileUpload";
import AudioRecorder from "./AudioRecorder";
import { sendChatMessage, ChatMessagePayload } from "@/lib/api";

interface ChatProps {
  backendStatus: "connected" | "disconnected" | "checking";
}

export const Chat: React.FC<ChatProps> = ({ backendStatus }) => {
  const [messages, setMessages] = useState<MessageProps[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "Hello! I am your **Multimodal AI Assistant**, running completely locally on your hardware.\n\n- Powered by **Qwen3.5:4B** via **LangChain** and **Ollama**.\n- 100% private, free, with zero external cloud dependencies.\n\nHow can I help you today?",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Handle send message
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanText = inputText.trim();
    if ((!cleanText && !selectedFile) || isLoading) return;

    setErrorBanner(null);

    const nowTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMessage: MessageProps = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: cleanText || (selectedFile ? `Uploaded ${selectedFile.file.name}` : ""),
      timestamp: nowTime,
    };

    // Append user message immediately
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText("");
    const currentFile = selectedFile;
    setSelectedFile(null);

    if (currentFile && !cleanText) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            role: "assistant",
            content: `Received file **${currentFile.file.name}**.\n\nThis upload is currently queued for local processing in the next multimodal stages.`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }, 400);
      return;
    }

    // Build history for LangChain pipeline
    const historyPayload: ChatMessagePayload[] = updatedMessages
      .filter((m) => !m.isError && m.id !== "welcome-1")
      .slice(-10)
      .map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      }));

    setIsLoading(true);

    try {
      // Real local AI call through LangChain + Ollama Qwen3.5:4b
      const result = await sendChatMessage(cleanText, historyPayload);

      const aiMessage: MessageProps = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: result.response,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error("Chat generation failed:", err);
      const errorDetail =
        err?.message ||
        "Could not generate a response. Please check that Ollama is running.";

      setErrorBanner(errorDetail);

      const errorMessage: MessageProps = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `⚠️ **Generation Error**: ${errorDetail}`,
        isError: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard shortcut: Enter to send, Shift+Enter for newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between px-4 py-2 mb-2 border-b border-zinc-800/40 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="font-medium text-zinc-200">Qwen 3.5 (4B)</span>
          <span className="text-zinc-600">·</span>
          <span className="text-amber-500/90 font-medium">Local Ollama</span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              backendStatus === "connected"
                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                : backendStatus === "checking"
                ? "bg-amber-500 animate-pulse"
                : "bg-red-500"
            }`}
          />
          <span className="capitalize text-zinc-300">
            {backendStatus === "connected" ? "Ready" : backendStatus}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-2 space-y-3 scroll-smooth bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.08),_transparent_32%)]">
        {messages.map((msg) => (
          <Message key={msg.id} {...msg} />
        ))}

        {isLoading && (
          <div className="px-4 py-3 flex items-center gap-3 text-sm text-zinc-400">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.2s]" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.1s]" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-bounce" />
            </div>
            <span className="font-light italic text-zinc-300">Qwen is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {selectedFile && (
        <div className="mx-4 mb-2 p-2.5 bg-zinc-900/90 border border-zinc-800 rounded-xl flex items-center gap-3 shadow-lg shadow-black/10">
          {selectedFile.previewUrl && (
            <img
              src={selectedFile.previewUrl}
              alt="Upload preview"
              className="w-10 h-10 object-cover rounded-lg border border-zinc-700"
            />
          )}
          <div className="text-xs flex-1 truncate">
            <p className="font-medium text-zinc-200 truncate">{selectedFile.file.name}</p>
            <p className="text-zinc-400">{(selectedFile.file.size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
      )}

      {errorBanner && (
        <div className="mx-4 mb-2 p-3 bg-red-950/70 border border-red-500/40 rounded-xl flex items-center justify-between text-xs text-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorBanner(null)}
            className="text-red-400 hover:text-red-200 font-medium px-2 py-0.5 rounded"
          >
            ✕
          </button>
        </div>
      )}

      <div className="p-2 sm:p-4">
        <form
          onSubmit={handleSend}
          className="relative bg-zinc-900/80 border border-zinc-800/90 hover:border-zinc-700/80 focus-within:border-amber-500/60 focus-within:ring-1 focus-within:ring-amber-500/30 rounded-2xl shadow-xl shadow-black/20 backdrop-blur-md transition-all p-3"
        >
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything... (Shift + Enter for new line)"
            disabled={isLoading}
            className="w-full bg-transparent resize-none text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none leading-relaxed disabled:opacity-50"
          />

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 mt-1 gap-3">
            <div className="flex items-center gap-1.5">
              <FileUpload
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
                disabled={isLoading}
              />
              <AudioRecorder disabled={isLoading} />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-500 hidden sm:inline">Local Inference</span>
              <button
                type="submit"
                onClick={(e) => {
                  if (inputText.trim() || selectedFile) {
                    handleSend(e);
                  }
                }}
                disabled={isLoading || (!inputText.trim() && !selectedFile)}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white shadow transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
