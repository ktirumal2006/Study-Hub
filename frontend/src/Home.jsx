// frontend/src/Home.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./api";

export default function Home() {
  const navigate = useNavigate();

  // Persisted user display name
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || ""
  );

  // Create Group state
  const [groupId, setGroupId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [createError, setCreateError] = useState("");

  // Join Group state
  const [joinId, setJoinId] = useState("");
  const [joinError, setJoinError] = useState("");

  // Feature list
  const features = [
    {
      title: "Group Collaboration",
      description: "Create or join study groups to collaborate in real-time.",
      icon: (
        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M17 20h5v-2a3 3 0 00-3-3h-2M9 20H4v-2a3 3 0 013-3h2m0 0a3 3 0 100-6 3 3 0 000 6zm6 0a3 3 0 100-6 3 3 0 000 6z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      title: "Session Tracking",
      description: "Start/stop timers and log focused study sessions automatically.",
      icon: (
        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 8v4l2 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      title: "Pomodoro Mode",
      description: "Built-in Pomodoro timer with customizable focus/break cycles.",
      icon: (
        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 8v4l2 2m-8 4h8m0 0l-2-2m2 2l2-2m-6-8l-2-2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      title: "Live Leaderboard",
      description: "Compete with peers and see who’s studied the most this week.",
      icon: (
        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M3 3v18h18M9 17L15 11L21 17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ];

  // Handlers
  const handleCreate = async () => {
    setCreateError("");
    if (!userName.trim()) {
      setCreateError("Please enter your name.");
      return;
    }
    localStorage.setItem("userName", userName.trim());

    if (!groupId.trim() || !groupName.trim()) {
      setCreateError("Both fields are required.");
      return;
    }

    try {
      await api.post("/group", {
        groupId,
        groupName,
        createdBy: userName.trim()
      });
      await api.post("/group/join", {
        groupId,
        userId: userName.trim()
      });
      navigate(`/about?groupId=${encodeURIComponent(groupId)}`);
    } catch (err) {
      setCreateError(err.response?.data?.message || err.message);
    }
  };

  const handleJoin = async () => {
    setJoinError("");
    if (!userName.trim()) {
      setJoinError("Please enter your name.");
      return;
    }
    localStorage.setItem("userName", userName.trim());

    if (!joinId.trim()) {
      setJoinError("Please enter a Group ID.");
      return;
    }

    try {
      await api.post("/group/join", {
        groupId: joinId,
        userId: userName.trim()
      });
      navigate(`/about?groupId=${encodeURIComponent(joinId)}`);
    } catch (err) {
      setJoinError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="bg-indigo-50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white shadow">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-black rounded-full" />
            <div className="w-6 h-6 border-2 border-black rounded-full -ml-2" />
            <span className="ml-4 text-2xl font-bold">Study Hub</span>
          </div>
          <nav className="flex items-center space-x-8 text-gray-700">
            <a href="/#create" className="text-lg hover:underline">Create</a>
            <a href="/#join" className="text-lg hover:underline">Join</a>
            <a href="/#features" className="text-lg hover:underline">Features</a>
          </nav>
        </div>
      </header>

      {/* Hero + Create Form */}
      <section
        id="create"
        className="min-h-screen flex flex-col-reverse md:flex-row items-center justify-between max-w-7xl mx-auto px-8 py-16"
      >
        <div className="md:w-1/2 max-w-lg space-y-6">
          <h1 className="text-6xl font-extrabold text-gray-900 leading-tight">
            Create a Study Group
          </h1>
          <p className="text-xl text-gray-700">
            Create your own group and start tracking study sessions instantly.
          </p>
          <div className="space-y-3">
            {/* Your Name */}
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your Name"
              className="w-full border border-gray-300 rounded p-3 focus:ring-2 focus:ring-indigo-500"
            />

            {/* Group ID & Name */}
            <input
              type="text"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              placeholder="Group ID"
              className="w-full border border-gray-300 rounded p-3 focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group Name"
              className="w-full border border-gray-300 rounded p-3 focus:ring-2 focus:ring-indigo-500"
            />

            <button
              onClick={handleCreate}
              className="w-full bg-black text-white rounded-full py-3 text-lg font-medium hover:bg-gray-800 transition"
            >
              Create Group
            </button>
            {createError && <p className="text-red-600">{createError}</p>}
          </div>
        </div>

        <div className="md:w-1/2 flex justify-center mb-16 md:mb-0">
          <div className="w-80 h-80 bg-white rounded-full shadow-2xl"></div>
        </div>
      </section>

      {/* Join Group Section */}
      <section id="join" className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
            Already have a group? Join here
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Your Name */}
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your Name"
              className="w-full sm:w-1/2 border border-gray-300 rounded p-3 focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="Enter Group ID"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              className="w-full sm:w-1/2 border border-gray-300 rounded p-3 focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleJoin}
              className="w-full sm:w-auto bg-black text-white rounded-full py-3 px-8 font-medium hover:bg-gray-800 transition"
            >
              Join Group
            </button>
          </div>
          {joinError && (
            <p className="mt-4 text-center text-red-600">{joinError}</p>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-indigo-50 py-16">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {features.map((f) => (
              <div key={f.title} className="flex flex-col items-center text-center">
                <div className="mb-4">{f.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
