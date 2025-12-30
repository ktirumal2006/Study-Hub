// frontend/src/pages/About.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../api";
import { useToast } from "../context/ToastContext";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import TimerPanel from "../components/TimerPanel";
import LeaderboardPanel from "../components/LeaderboardPanel";
import Skeleton from "../components/ui/Skeleton";
import Button from "../components/ui/Button";

export default function About() {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get("groupId") || "";
  const userId = localStorage.getItem("userName") || "";
  const toast = useToast();

  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [networkError, setNetworkError] = useState("");

  const loadLeaderboard = async () => {
    if (!groupId) return;
    setIsLoadingLeaderboard(true);
    setNetworkError("");
    try {
      const res = await api.get("/leaderboard", {
        params: { groupId, limit: 10 },
      });
      setLeaderboard(res.data.leaderboard || []);
    } catch (e) {
      console.error(e);
      setNetworkError("Failed to load leaderboard. Please try again.");
      toast.error("Failed to load leaderboard");
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    if (!groupId || !userId) return;
    (async () => {
      try {
        await api.post("/group/join", { groupId, userId });
        await loadLeaderboard();
      } catch (err) {
        console.error(err);
        toast.error("Failed to join group");
      }
    })();
  }, [groupId, userId]);

  // Show redirect message if no group/user
  if (!userId) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <Card>
          <CardContent className="py-12">
            <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Please create or join a study group to start tracking sessions.
            </p>
            <Button as={Link} to="/">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">StudyHub</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-6">
          Track your focus sessions and compete with your study group
        </p>
        {!groupId && (
          <Button as={Link} to="/" variant="secondary">
            Create or Join a Group
          </Button>
        )}
      </div>

      {/* Error Banner */}
      {networkError && (
        <Card className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          <CardContent className="py-4">
            <p className="text-red-800 dark:text-red-200">{networkError}</p>
          </CardContent>
        </Card>
      )}

      {/* Timer and Leaderboard Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timer Panel */}
        <TimerPanel
          groupId={groupId}
          userId={userId}
          onSessionEnd={loadLeaderboard}
        />

        {/* Leaderboard Panel */}
        <LeaderboardPanel
          leaderboard={leaderboard}
          isLoading={isLoadingLeaderboard}
          onRefresh={loadLeaderboard}
        />
      </div>
    </div>
  );
}

