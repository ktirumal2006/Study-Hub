// frontend/src/components/chat/LinkifiedText.jsx
import React from "react";

/**
 * URL regex pattern (matches http/https URLs)
 */
const URL_REGEX = /(https?:\/\/[^\s<>"]+)/gi;

/**
 * Component that auto-links URLs in text
 */
export default function LinkifiedText({ text, className = "" }) {
  if (!text) return null;

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = URL_REGEX.exec(text)) !== null) {
    // Add text before URL
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>{text.substring(lastIndex, match.index)}</span>
      );
    }

    // Add linked URL
    const url = match[0];
    parts.push(
      <a
        key={`link-${match.index}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="text-brand-600 dark:text-brand-400 hover:underline break-all"
      >
        {url}
      </a>
    );

    lastIndex = match.index + url.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
  }

  return <span className={className}>{parts.length > 0 ? parts : text}</span>;
}

