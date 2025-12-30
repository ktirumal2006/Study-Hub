// frontend/src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto text-center">
      <Card>
        <CardContent className="py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-3xl font-bold mb-2">404</h1>
          <h2 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-4">
            Page Not Found
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button as={Link} to="/" fullWidth>
            Go to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

