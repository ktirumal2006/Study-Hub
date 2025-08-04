// frontend/src/About.jsx
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "./api";

export default function About() {
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

  // Pomodoro session state
  const sessionRef = useRef(null);
  const [isTiming, setIsTiming] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [onBreak, setOnBreak] = useState(false);
  const [pomConfig, setPomConfig] = useState({
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
    cycles: 4,
  });

  // Initialize display when focus time changes
  useEffect(() => {
    setTimeLeft(pomConfig.focus * 60 * 1000);
    setCycleCount(0);
    setOnBreak(false);
  }, [pomConfig.focus]);

  // Pomodoro countdown
  useEffect(() => {
    if (!isTiming) return;
    const iv = setInterval(() => {
      setTimeLeft((tl) => {
        if (tl <= 1000) {
          clearInterval(iv);
          alert(onBreak ? "Break’s over—back to focus!" : "Focus session complete!");
          if (!onBreak) {
            // just finished focus
            const nextMin =
              (cycleCount + 1) % pomConfig.cycles === 0
                ? pomConfig.longBreak
                : pomConfig.shortBreak;
            setCycleCount((c) => c + 1);
            setOnBreak(true);
            return nextMin * 60 * 1000;
          } else {
            // just finished break
            setOnBreak(false);
            return pomConfig.focus * 60 * 1000;
          }
        }
        return tl - 1000;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [isTiming, onBreak, cycleCount, pomConfig]);

  // Start Pomodoro session
  const startSession = async () => {
    if (!groupId) return;
    const sid = `${userId}-${Date.now()}`;
    sessionRef.current = sid;
    await api.post("/session/start", { sessionId: sid, userId, groupId });
    setIsTiming(true);
  };

  // End Pomodoro session
  const endSession = async () => {
    if (!isTiming) return;
    setIsTiming(false);
    const minutes = Math.floor(
      (pomConfig.focus * 60 * 1000 - timeLeft) / 60000
    );
    await api.post("/session/end", {
      sessionId: sessionRef.current,
      userId,
      durationMinutes: minutes,
    });
    await loadLeaderboard();
  };

  // Time formatting
  const pad = (n) => n.toString().padStart(2, "0");
  const formatMS = (ms) => {
    const total = Math.floor(ms / 1000),
      m = Math.floor(total / 60),
      s = total % 60;
    return `${pad(m)}:${pad(s)}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-indigo-50">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white shadow">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-black rounded-full" />
            <div className="w-6 h-6 border-2 border-black rounded-full -ml-2" />
            <span className="ml-4 text-2xl font-bold">Study Hub</span>
          </div>
          <nav className="flex items-center space-x-8 text-gray-700">
            <Link to="/" className="text-lg hover:underline">
              Home
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <div className="relative flex-1">
        {/* Leaderboard */}
        <aside className="fixed top-16 left-4 z-50 w-60 p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-2">Leaderboard</h2>
          <button
            onClick={loadLeaderboard}
            className="mb-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-1 rounded"
          >
            Refresh
          </button>
          <ul className="space-y-1 text-sm">
            {leaderboard.map((u) => (
              <li key={u.userId} className="flex justify-between">
                <span className="font-medium">{u.userId}</span>
                <span className="text-gray-600">{u.weeklyMinutes} min</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Pomodoro timer */}
        <section className="absolute inset-0 flex flex-col items-center justify-center p-4">
          {/* Settings */}
          <div className="mb-6 bg-white p-4 rounded shadow w-full max-w-sm">
            <h3 className="font-semibold mb-2">Pomodoro Settings (minutes)</h3>
            {Object.entries(pomConfig).map(([key, val]) => (
              <div key={key} className="flex items-center mb-2">
                <label className="w-32 capitalize">{key.replace(/([A-Z])/, ' $1')}:</label>
                <input
                  type="number"
                  value={val}
                  onChange={(e) =>
                    setPomConfig((c) => ({
                      ...c,
                      [key]: Math.max(1, parseInt(e.target.value) || 1),
                    }))
                  }
                  className="flex-1 border rounded p-1 appearance-none"
                  min="1"
                />
                {key !== "cycles" && <span className="ml-2 text-sm">min</span>}
              </div>
            ))}
          </div>

          {/* Timer Display */}
          <div className="text-6xl font-mono mb-2">{formatMS(timeLeft)}</div>
          <div className="text-sm text-gray-600 mb-6">
            {onBreak ? "Break" : "Focus"} • Cycle {cycleCount + 1}/{pomConfig.cycles}
          </div>

          {/* Controls */}
          {!isTiming ? (
            <button
              onClick={startSession}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              Start Pomodoro
            </button>
          ) : (
            <button
              onClick={endSession}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Stop Pomodoro
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
