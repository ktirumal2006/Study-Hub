// frontend/src/components/chat/MessageList.jsx
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import LinkifiedText from "./LinkifiedText";
import { useChat } from "../../context/ChatContext";

/**
 * Format timestamp to readable time
 */
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Group messages by minute for timestamp bubbles
 */
function groupMessagesByMinute(messages) {
  const groups = [];
  let currentGroup = null;

  messages.forEach((msg) => {
    if (!msg.timestamp) return;

    const msgMinute = new Date(msg.timestamp).setSeconds(0, 0);

    if (!currentGroup || currentGroup.minute !== msgMinute) {
      currentGroup = {
        minute: msgMinute,
        messages: [],
      };
      groups.push(currentGroup);
    }

    currentGroup.messages.push(msg);
  });

  return groups;
}

export default function MessageList({ currentUsername }) {
  const { messages } = useChat();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const grouped = groupMessagesByMinute(messages);

  return (
    <div className="flex-1 overflow-y-auto space-y-4 p-4" aria-live="polite" aria-label="Chat messages">
      {grouped.length === 0 ? (
        <div className="text-center text-slate-500 dark:text-slate-400 py-8">
          No messages yet. Start the conversation!
        </div>
      ) : (
        grouped.map((group, groupIdx) => (
          <div key={group.minute}>
            {/* Timestamp bubble */}
            <div className="text-center mb-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                {formatTime(group.minute)}
              </span>
            </div>

            {/* Messages in this minute */}
            {group.messages.map((msg, msgIdx) => {
              const isMe = msg.username === currentUsername;
              const isSystem = msg.isSystem;

              if (isSystem) {
                return (
                  <div key={`${msg.timestamp}-${msgIdx}`} className="text-center py-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400 italic">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <motion.div
                  key={`${msg.timestamp}-${msgIdx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex mb-2 ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[75%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    {!isMe && (
                      <div className="text-xs text-slate-600 dark:text-slate-400 mb-1 px-2">
                        {msg.username}
                      </div>
                    )}
                    <div
                      className={`
                        rounded-2xl px-4 py-2
                        ${
                          isMe
                            ? "bg-indigo-600 dark:bg-indigo-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        }
                      `}
                    >
                      <LinkifiedText text={msg.text} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

