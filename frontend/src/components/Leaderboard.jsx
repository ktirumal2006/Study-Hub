// frontend/src/components/Leaderboard.jsx
import React, { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

export default function Leaderboard({ leaderboard, onRefresh }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <aside className="fixed top-16 left-2 right-2 sm:left-4 sm:right-auto sm:w-60 z-50 p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold mb-2">Leaderboard</h2>
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="mb-3 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2 rounded flex items-center justify-center"
      >
        {isRefreshing ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Refreshing...
          </>
        ) : (
          'Refresh'
        )}
      </button>
      <ul className="space-y-1 text-sm max-h-64 overflow-y-auto">
        {leaderboard.length === 0 ? (
          <li className="text-gray-500 text-center py-2">No data yet</li>
        ) : (
          leaderboard.map((u) => (
            <li key={u.userId} className="flex justify-between items-center py-1">
              <span className="font-medium truncate mr-2">{u.userId}</span>
              <span className="text-gray-600 text-xs sm:text-sm whitespace-nowrap">
                {u.weeklyMinutes} min
              </span>
            </li>
          ))
        )}
      </ul>
    </aside>
  );
}
