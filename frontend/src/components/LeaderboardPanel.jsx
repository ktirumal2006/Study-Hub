// frontend/src/components/LeaderboardPanel.jsx
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card";
import Button from "./ui/Button";
import Skeleton from "./ui/Skeleton";
import Badge from "./ui/Badge";
import LoadingSpinner from "./LoadingSpinner";

export default function LeaderboardPanel({ leaderboard, isLoading, onRefresh }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getRankEmoji = (rank) => {
    if (rank === 0) return "🥇";
    if (rank === 1) return "🥈";
    if (rank === 2) return "🥉";
    return `#${rank + 1}`;
  };

  return (
    <Card hover>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Leaderboard</CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            loading={isRefreshing}
          >
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3" aria-busy="true" aria-live="polite">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700">
            <CardContent className="py-8 text-center">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="font-semibold mb-2">No sessions yet</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Start a study session to appear on the leaderboard!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2" aria-live="polite">
            {leaderboard.map((user, index) => (
              <div
                key={user.userId}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-slate-400 dark:text-slate-500 w-6">
                    {getRankEmoji(index)}
                  </span>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {user.userId}
                    </div>
                    {user.totalMinutes && (
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {user.totalMinutes} min total
                      </div>
                    )}
                  </div>
                </div>
                <Badge variant="success">
                  {user.weeklyMinutes} min
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

