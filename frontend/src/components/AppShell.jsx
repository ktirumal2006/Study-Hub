// frontend/src/components/AppShell.jsx
import React from "react";
import Nav from "./Nav";
import Footer from "./Footer";

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-subtle">
      <Nav />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
