// frontend/src/components/Header.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
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
          <a href="/#create" className="text-lg hover:underline">
            Create
          </a>
          <a href="/#join" className="text-lg hover:underline">
            Join
          </a>
          <a href="/#features" className="text-lg hover:underline">
            Features
          </a>
        </nav>
      </div>
    </header>
  );
}
