// frontend/src/context/ChatContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { connectWS, onWSMessage, sendWS, isWSConnected, disconnectWS } from "../lib/ws";

const ChatContext = createContext(null);

export function ChatProvider({ children, groupId, username }) {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  
  const typingTimeoutRef = useRef({});

  useEffect(() => {
    if (!groupId || !username) {
      console.warn("ChatContext: Missing groupId or username", { groupId, username });
      return;
    }

    const wsUrl = import.meta.env.VITE_WS_URL;
    if (!wsUrl) {
      console.error("❌ VITE_WS_URL not configured. Set it in Vercel environment variables or .env.local");
      setConnected(false);
      return;
    }

    console.log("🔌 Connecting to WebSocket:", wsUrl);
    const fullUrl = `${wsUrl}?groupId=${encodeURIComponent(groupId)}&username=${encodeURIComponent(username)}`;
    console.log("🔌 Full WebSocket URL:", fullUrl);

    // Connect
    connectWS(fullUrl, () => {
      console.log("✅ WebSocket connection opened callback");
      setConnected(true);
      setReconnecting(false);
    });

    // Listen for messages
    const unsubscribe = onWSMessage((message) => {
      console.log("📨 Received WebSocket message:", message);
      if (message.type === "message") {
        setMessages((prev) => {
          // Deduplicate: check if message already exists (optimistic update might have added it)
          const payload = message.payload;
          const exists = prev.some(
            (msg) =>
              msg.username === payload.username &&
              msg.text === payload.text &&
              Math.abs(msg.timestamp - payload.timestamp) < 5000 // Within 5 seconds
          );
          if (exists) {
            console.log("📨 Duplicate message detected, skipping");
            return prev;
          }
          return [...prev, payload];
        });
      } else if (message.type === "typing") {
        const { username: typingUser, isTyping } = message.payload;
        setTypingUsers((prev) => {
          const next = new Set(prev);
          if (isTyping) {
            next.add(typingUser);
            // Auto-remove after 2 seconds
            clearTimeout(typingTimeoutRef.current[typingUser]);
            typingTimeoutRef.current[typingUser] = setTimeout(() => {
              setTypingUsers((prev) => {
                const next = new Set(prev);
                next.delete(typingUser);
                return next;
              });
            }, 2000);
          } else {
            next.delete(typingUser);
          }
          return next;
        });
      } else if (message.type === "system") {
        setMessages((prev) => [
          ...prev,
          {
            ...message.payload,
            isSystem: true,
            timestamp: Date.now(),
          },
        ]);
      }
    });

    // Check connection status periodically (initial check after a short delay)
    const initialCheck = setTimeout(() => {
      const isConnectedNow = isWSConnected();
      console.log("🔍 Initial connection check:", isConnectedNow);
      setConnected(isConnectedNow);
      if (!isConnectedNow) {
        setReconnecting(true);
      }
    }, 500);

    const statusInterval = setInterval(() => {
      const isConnectedNow = isWSConnected();
      if (isConnectedNow !== connected) {
        console.log("🔄 Connection status changed:", isConnectedNow ? "Connected" : "Disconnected");
        setConnected(isConnectedNow);
        if (!isConnectedNow && connected) {
          setReconnecting(true);
        } else if (isConnectedNow) {
          setReconnecting(false);
        }
      }
    }, 1000);

    // Cleanup
    return () => {
      clearTimeout(initialCheck);
      unsubscribe();
      clearInterval(statusInterval);
      Object.values(typingTimeoutRef.current).forEach(clearTimeout);
      disconnectWS();
    };
  }, [groupId, username, connected]);

  const sendMessage = (text) => {
    if (text.trim() && isWSConnected()) {
      const trimmedText = text.trim();
      const timestamp = Date.now();
      
      // Optimistically add message to local state immediately
      const optimisticMessage = {
        groupId,
        username,
        text: trimmedText,
        timestamp,
      };
      setMessages((prev) => [...prev, optimisticMessage]);
      
      // Send to server
      sendWS({
        action: "sendMessage",
        groupId,
        username,
        text: trimmedText,
      });
    }
  };

  const setTyping = (isTyping) => {
    if (isWSConnected()) {
      sendWS({
        action: "typing",
        groupId,
        username,
        isTyping,
      });
    }
  };

  const value = {
    messages,
    typingUsers: Array.from(typingUsers),
    connected,
    reconnecting,
    sendMessage,
    setTyping,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
