// frontend/src/pages/Group.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import { useToast } from "../context/ToastContext";
import { ChatProvider } from "../context/ChatContext";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import Button from "../components/ui/Button";
import TimerPanel from "../components/TimerPanel";
import LeaderboardPanel from "../components/LeaderboardPanel";
import ChatPanel from "../components/chat/ChatPanel";
import Skeleton from "../components/ui/Skeleton";

export default function Group() {
  const { groupId } = useParams();
  const userId = localStorage.getItem("userName") || "demo-user";
  const toast = useToast();

  const [groupInfo, setGroupInfo] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  const loadLeaderboard = async () => {
    if (!groupId) return;
    setIsLoadingLeaderboard(true);
    try {
      const res = await api.get("/leaderboard", {
        params: { groupId, limit: 10 },
      });
      setLeaderboard(res.data.leaderboard || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load leaderboard");
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      window.location.href = "/";
      return;
    }

    (async () => {
      try {
        await api.post("/group/join", { groupId, userId });
        // Note: Group info endpoint may not exist, handle gracefully
        setGroupInfo({ groupId, groupName: groupId });
        await loadLeaderboard();
      } catch (err) {
        console.error(err);
        toast.error("Failed to join group");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [groupId, userId]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(groupId);
    toast.success("Group code copied to clipboard!");
  };

  if (!userId) return null;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        {isLoading ? (
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
        ) : (
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {groupInfo?.groupName || groupId}
              </h1>
              <div className="flex items-center gap-3">
                <code className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-mono">
                  {groupId}
                </code>
                <Button size="sm" variant="ghost" onClick={handleCopyCode}>
                  Copy Code
                </Button>
              </div>
            </div>
            <Button as={Link} to={`/about?groupId=${groupId}`}>
              Start Session
            </Button>
          </div>
        )}
      </div>

      {/* Timer and Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TimerPanel
          groupId={groupId}
          userId={userId}
          onSessionEnd={loadLeaderboard}
        />
        <LeaderboardPanel
          leaderboard={leaderboard}
          isLoading={isLoadingLeaderboard}
          onRefresh={loadLeaderboard}
        />
      </div>

      {/* Chat Panel */}
      <div className="mb-6">
        <ChatProvider groupId={groupId} username={userId || "demo-user"}>
          <ChatPanel currentUsername={userId || "demo-user"} />
        </ChatProvider>
      </div>

      {/* Members Section (Placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {leaderboard.map((user) => (
              <div
                key={user.userId}
                className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800"
              >
                <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-semibold">
                  {user.userId.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {user.userId}
                </span>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <p className="text-slate-600 dark:text-slate-400">
                No members yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

