// frontend/src/components/Timer.jsx
import React, { useState, useEffect, useRef } from "react";
import { api } from "../api";
import PomodoroSettings from "./PomodoroSettings";
import LoadingButton from "./LoadingButton";

export default function Timer({ groupId, userId, onSessionEnd }) {
  // Pomodoro session state
  const sessionRef = useRef(null);
  const [isTiming, setIsTiming] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [onBreak, setOnBreak] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
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
          alert(onBreak ? "Break's over—back to focus!" : "Focus session complete!");
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
    setIsStarting(true);
    try {
      const sid = `${userId}-${Date.now()}`;
      sessionRef.current = sid;
      await api.post("/session/start", { sessionId: sid, userId, groupId });
      setIsTiming(true);
    } catch (error) {
      console.error("Failed to start session:", error);
      alert("Failed to start session. Please try again.");
    } finally {
      setIsStarting(false);
    }
  };

  // End Pomodoro session
  const endSession = async () => {
    if (!isTiming) return;
    setIsStopping(true);
    try {
      setIsTiming(false);
      const minutes = Math.floor(
        (pomConfig.focus * 60 * 1000 - timeLeft) / 60000
      );
      await api.post("/session/end", {
        sessionId: sessionRef.current,
        userId,
        durationMinutes: minutes,
      });
      onSessionEnd(); // Callback to refresh leaderboard
    } catch (error) {
      console.error("Failed to end session:", error);
      alert("Failed to end session. Please try again.");
    } finally {
      setIsStopping(false);
    }
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
    <section className="absolute inset-0 flex flex-col items-center justify-center p-4">
      {/* Settings */}
      <PomodoroSettings pomConfig={pomConfig} setPomConfig={setPomConfig} />

      {/* Timer Display */}
      <div className="text-6xl font-mono mb-2">{formatMS(timeLeft)}</div>
      <div className="text-sm text-gray-600 mb-6">
        {onBreak ? "Break" : "Focus"} • Cycle {cycleCount + 1}/{pomConfig.cycles}
      </div>

      {/* Controls */}
      {!isTiming ? (
        <LoadingButton
          onClick={startSession}
          loading={isStarting}
          className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg"
        >
          Start Pomodoro
        </LoadingButton>
      ) : (
        <LoadingButton
          onClick={endSession}
          loading={isStopping}
          className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
        >
          Stop Pomodoro
        </LoadingButton>
      )}
    </section>
  );
}
