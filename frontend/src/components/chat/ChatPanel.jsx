// frontend/src/components/chat/ChatPanel.jsx
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import Badge from "../ui/Badge";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import { useChat } from "../../context/ChatContext";

export default function ChatPanel({ currentUsername }) {
  const { connected, reconnecting, typingUsers } = useChat();
  const wsUrl = import.meta.env.VITE_WS_URL;

  return (
    <Card hover className="flex flex-col h-[600px] max-h-[80vh]">
      <CardHeader className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <CardTitle>Chat</CardTitle>
          <div className="flex items-center gap-2">
            {reconnecting && (
              <Badge variant="warning" className="animate-pulse">
                Reconnecting...
              </Badge>
            )}
            <Badge variant={connected ? "success" : "error"}>
              {connected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </div>
        {!wsUrl && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              ⚠️ WebSocket URL not configured. Set <code className="px-1 py-0.5 bg-red-100 dark:bg-red-900/40 rounded">VITE_WS_URL</code> environment variable.
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <MessageList currentUsername={currentUsername} />
        {typingUsers.length > 0 && (
          <TypingIndicator users={typingUsers} currentUsername={currentUsername} />
        )}
      </CardContent>
      <MessageInput />
    </Card>
  );
}

