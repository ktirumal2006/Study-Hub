// frontend/src/components/TimerPanel.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { api } from "../api";
import { useToast } from "../context/ToastContext";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card";
import Button from "./ui/Button";
import Select from "./ui/Select";
import Input from "./ui/Input";
import Badge from "./ui/Badge";

export default function TimerPanel({ groupId, userId, onSessionEnd }) {
  const toast = useToast();
  const [mode, setMode] = useState("pomodoro"); // "standard" | "pomodoro"
  const sessionRef = useRef(null);

  // Standard timer state
  const [standardMinutes, setStandardMinutes] = useState(60);

  // Pomodoro state
  const [pomConfig, setPomConfig] = useState({
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
    cycles: 4,
  });

  // Timer state
  const [isTiming, setIsTiming] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [onBreak, setOnBreak] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [startTime, setStartTime] = useState(null);

  // Initialize timer display
  useEffect(() => {
    if (mode === "standard") {
      setTimeLeft(standardMinutes * 60 * 1000);
    } else {
      setTimeLeft(pomConfig.focus * 60 * 1000);
      setCycleCount(0);
      setOnBreak(false);
    }
  }, [mode, standardMinutes, pomConfig.focus]);

  // Timer countdown
  useEffect(() => {
    if (!isTiming) return;
    const iv = setInterval(() => {
      setTimeLeft((tl) => {
        if (tl <= 1000) {
          clearInterval(iv);
          if (mode === "pomodoro") {
            toast.info(onBreak ? "Break's over—back to focus!" : "Focus session complete!");
            if (!onBreak) {
              const nextMin =
                (cycleCount + 1) % pomConfig.cycles === 0
                  ? pomConfig.longBreak
                  : pomConfig.shortBreak;
              setCycleCount((c) => c + 1);
              setOnBreak(true);
              return nextMin * 60 * 1000;
            } else {
              setOnBreak(false);
              return pomConfig.focus * 60 * 1000;
            }
          } else {
            toast.info("Time's up!");
            handleEndSession();
            return 0;
          }
        }
        return tl - 1000;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [isTiming, onBreak, cycleCount, pomConfig, mode]);

  const handleStartSession = async () => {
    if (!groupId) {
      toast.error("Please join or create a group first");
      return;
    }
    setIsStarting(true);
    try {
      const sid = `${userId}-${Date.now()}`;
      sessionRef.current = sid;
      await api.post("/session/start", { sessionId: sid, userId, groupId });
      setIsTiming(true);
      setStartTime(Date.now());
      toast.success("Session started!");
    } catch (error) {
      console.error("Failed to start session:", error);
      toast.error("Failed to start session. Please try again.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleEndSession = async () => {
    if (!isTiming) return;
    setIsStopping(true);
    try {
      setIsTiming(false);
      const elapsed = startTime ? Date.now() - startTime : 0;
      const minutes = mode === "pomodoro"
        ? Math.floor((pomConfig.focus * 60 * 1000 - timeLeft) / 60000)
        : Math.floor(elapsed / 60000);

      if (minutes > 0 && sessionRef.current) {
        await api.post("/session/end", {
          sessionId: sessionRef.current,
          userId,
          durationMinutes: minutes,
        });
        toast.success(`Session completed! ${minutes} minute${minutes !== 1 ? "s" : ""} logged.`);
        onSessionEnd?.();
      }
    } catch (error) {
      console.error("Failed to end session:", error);
      toast.error("Failed to end session. Please try again.");
    } finally {
      setIsStopping(false);
      setStartTime(null);
    }
  };

  const handleReset = () => {
    setIsTiming(false);
    if (mode === "standard") {
      setTimeLeft(standardMinutes * 60 * 1000);
    } else {
      setTimeLeft(pomConfig.focus * 60 * 1000);
      setCycleCount(0);
      setOnBreak(false);
    }
    setStartTime(null);
  };

  const pad = (n) => n.toString().padStart(2, "0");
  const formatMS = (ms) => {
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${pad(m)}:${pad(s)}`;
  };

  const totalTime = mode === "standard"
    ? standardMinutes * 60 * 1000
    : pomConfig.focus * 60 * 1000;
  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  return (
    <Card hover>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Timer</CardTitle>
          <Select
            value={mode}
            onChange={(e) => {
              setMode(e.target.value);
              setIsTiming(false);
            }}
            className="w-auto min-w-[140px]"
            disabled={isTiming}
          >
            <option value="standard">Standard</option>
            <option value="pomodoro">Pomodoro</option>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {mode === "pomodoro" && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setPomConfig({ focus: 25, shortBreak: 5, longBreak: 15, cycles: 4 });
                  if (!isTiming) setTimeLeft(25 * 60 * 1000);
                }}
                disabled={isTiming}
              >
                25/5
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setPomConfig({ focus: 50, shortBreak: 10, longBreak: 20, cycles: 4 });
                  if (!isTiming) setTimeLeft(50 * 60 * 1000);
                }}
                disabled={isTiming}
              >
                50/10
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Input
                label="Focus (min)"
                type="number"
                value={pomConfig.focus}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value) || 1);
                  setPomConfig((c) => ({ ...c, focus: val }));
                  if (!isTiming) setTimeLeft(val * 60 * 1000);
                }}
                disabled={isTiming}
                min="1"
              />
              <Input
                label="Break (min)"
                type="number"
                value={pomConfig.shortBreak}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value) || 1);
                  setPomConfig((c) => ({ ...c, shortBreak: val }));
                }}
                disabled={isTiming}
                min="1"
              />
            </div>
          </div>
        )}

        {mode === "standard" && (
          <div className="mb-6">
            <Input
              label="Duration (minutes)"
              type="number"
              value={standardMinutes}
              onChange={(e) => {
                const val = Math.max(1, parseInt(e.target.value) || 1);
                setStandardMinutes(val);
                if (!isTiming) setTimeLeft(val * 60 * 1000);
              }}
              disabled={isTiming}
              min="1"
            />
          </div>
        )}

        {/* Timer Display with Progress Ring */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-64 h-64 mb-4">
            <svg className="transform -rotate-90 w-full h-full">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-slate-200 dark:text-slate-800"
              />
              <motion.circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 120}`}
                strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                className="text-brand-600 dark:text-brand-400"
                transition={{ duration: 1, ease: "linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                key={timeLeft}
                initial={{ opacity: 0.7, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-5xl font-mono font-bold text-slate-900 dark:text-slate-100"
              >
                {formatMS(timeLeft)}
              </motion.div>
            </div>
          </div>

          {mode === "pomodoro" && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Badge variant={onBreak ? "info" : "success"}>
                {onBreak ? "Break" : "Focus"}
              </Badge>
              <span>•</span>
              <span>Cycle {cycleCount + 1}/{pomConfig.cycles}</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          {!isTiming ? (
            <Button
              onClick={handleStartSession}
              loading={isStarting}
              fullWidth
              disabled={isStarting}
            >
              Start Session
            </Button>
          ) : (
            <>
              <Button
                onClick={handleEndSession}
                loading={isStopping}
                variant="secondary"
                fullWidth
                disabled={isStopping}
              >
                End Session
              </Button>
              <Button
                onClick={handleReset}
                variant="ghost"
                disabled={isStopping}
              >
                Reset
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

