"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

interface CommentFormProps {
  postId: string;
}

export default function CommentForm({ postId }: CommentFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !content.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/db/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post: postId, authorName: name.trim(), authorEmail: email.trim(), content: content.trim() }),
      });

      const data = await res.json() as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to submit comment.");
        return;
      }

      setSubmitted(true);
      setName("");
      setEmail("");
      setContent("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-900/20 border border-green-800/50 rounded-xl p-5 flex items-start gap-3">
        <CheckCircle size={20} className="text-green-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-green-400 font-semibold text-sm">Comment submitted!</p>
          <p className="text-slate-400 text-sm mt-0.5">Your comment is awaiting moderation and will appear shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            maxLength={200}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com (not displayed)"
            required
            maxLength={300}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Comment *</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts…"
          required
          maxLength={5000}
          rows={4}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-y"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
      >
        <Send size={14} />
        {submitting ? "Submitting…" : "Post Comment"}
      </button>
    </form>
  );
}
