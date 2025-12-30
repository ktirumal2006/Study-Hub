// frontend/src/components/chat/MessageInput.jsx
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Button from "../ui/Button";
import { useChat } from "../../context/ChatContext";

export default function MessageInput() {
  const { sendMessage, setTyping, connected } = useChat();
  const [text, setText] = useState("");
  const [isTypingLocal, setIsTypingLocal] = useState(false);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 120; // ~4 rows
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [text]);

  // Handle typing indicator
  useEffect(() => {
    if (text.trim() && !isTypingLocal) {
      setIsTypingLocal(true);
      setTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingLocal) {
        setIsTypingLocal(false);
        setTyping(false);
      }
    }, 1000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [text, isTypingLocal, setTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && connected) {
      sendMessage(text.trim());
      setText("");
      setTyping(false);
      setIsTypingLocal(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-200 dark:border-slate-800 p-4">
      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={connected ? "Type a message..." : "Connecting..."}
          disabled={!connected}
          rows={1}
          className="
            flex-1 resize-none
            px-4 py-2
            bg-white dark:bg-slate-900
            border border-slate-300 dark:border-slate-700
            rounded-2xl
            text-slate-900 dark:text-slate-100
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            focus:ring-2 focus:ring-brand-500 focus:border-brand-500
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
        />
        <Button
          type="submit"
          disabled={!text.trim() || !connected}
          aria-label="Send message"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </Button>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        Press Enter to send, Shift+Enter for newline
      </p>
    </form>
  );
}

