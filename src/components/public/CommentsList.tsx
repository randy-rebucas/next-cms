import { User } from "lucide-react";

export interface CommentItem {
  _id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface CommentsListProps {
  comments: CommentItem[];
}

export default function CommentsList({ comments }: CommentsListProps) {
  if (comments.length === 0) {
    return (
      <p className="text-slate-500 text-sm text-center py-6">
        No comments yet. Be the first to comment!
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {comments.map((c) => (
        <div key={c._id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-amber-700/30 flex items-center justify-center">
              <User size={14} className="text-amber-400" />
            </div>
            <span className="text-sm font-semibold text-white">{c.authorName}</span>
            <span className="text-xs text-slate-500 ml-auto">
              {new Date(c.createdAt).toLocaleDateString("en-PH", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{c.content}</p>
        </div>
      ))}
    </div>
  );
}
