// frontend/src/components/chat/TypingIndicator.jsx
import React from "react";
import { motion } from "framer-motion";

export default function TypingIndicator({ users, currentUsername }) {
  const otherUsers = users.filter((u) => u !== currentUsername);

  if (otherUsers.length === 0) return null;

  const text =
    otherUsers.length === 1
      ? `${otherUsers[0]} is typing...`
      : `${otherUsers.length} people are typing...`;

  return (
    <div className="px-4 py-2">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"
      >
        <div className="flex gap-1">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            className="w-2 h-2 bg-slate-400 rounded-full"
          />
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            className="w-2 h-2 bg-slate-400 rounded-full"
          />
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
            className="w-2 h-2 bg-slate-400 rounded-full"
          />
        </div>
        <span>{text}</span>
      </motion.div>
    </div>
  );
}

