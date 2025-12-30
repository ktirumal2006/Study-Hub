// frontend/src/pages/StudySession.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import Timer from "../components/Timer";
import Leaderboard from "../components/Leaderboard";

export default function StudySession() {
  // URL & user
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get("groupId") || "";

  // Identify user from localStorage
  const userId = localStorage.getItem("userName") || "";
  // Redirect to home if name missing
  if (!userId) {
    window.location.href = "/";
    return null;
  }

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState([]);
  const loadLeaderboard = async () => {
    if (!groupId) return;
    try {
      const res = await api.get("/leaderboard", {
        params: { groupId, limit: 10 },
      });
      setLeaderboard(res.data.leaderboard);
    } catch (e) {
      console.error(e);
    }
  };

  // Auto-join and load leaderboard on mount
  useEffect(() => {
    if (!groupId) return;
    (async () => {
      try {
        await api.post("/group/join", { groupId, userId });
        await loadLeaderboard();
      } catch (err) {
        console.error(err);
      }
    })();
  }, [groupId]);

  return (
    <div className="min-h-screen flex flex-col bg-indigo-50">
      {/* Main */}
      <div className="relative flex-1">
        {/* Leaderboard */}
        <Leaderboard leaderboard={leaderboard} onRefresh={loadLeaderboard} />

        {/* Pomodoro timer */}
        <Timer 
          groupId={groupId} 
          userId={userId} 
          onSessionEnd={loadLeaderboard} 
        />
      </div>
    </div>
  );
}
