'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Link } from '@/i18n/navigation';
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Author {
  id: string;
  name: string;
  username: string;
  role: string;
  verifiedProfessionalTitle: string | null;
  country: string | null;
}

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  author: Author;
  replies: Comment[];
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function Avatar({ author }: { author: Author }) {
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
      style={{ backgroundColor: '#8B1A2B' }}
    >
      {author.name[0].toUpperCase()}
    </div>
  );
}

function CommentBox({
  paperId,
  parentId,
  onPosted,
  placeholder = 'Share your thoughts…',
  autoFocus = false,
}: {
  paperId: string;
  parentId?: string;
  onPosted: (c: Comment) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const { user } = useAuth();
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!body.trim() || submitting) return;
    setSubmitting(true);
    const res = await fetch(`/api/papers/${paperId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: body.trim(), parentId }),
    });
    if (res.ok) {
      const data = await res.json();
      onPosted({ ...data.comment, replies: [] });
      setBody('');
    }
    setSubmitting(false);
  }

  if (!user) {
    return (
      <p className="text-xs text-gray-400 py-2">
        <Link href="/sign-in" className="text-brand-crimson font-medium hover:underline">Sign in</Link> to join the discussion.
      </p>
    );
  }

  return (
    <div className="flex gap-3">
      <Avatar author={{ ...user, verifiedProfessionalTitle: null, country: null }} />
      <div className="flex-1">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          rows={3}
          className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 resize-none bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-crimson/30 focus:border-brand-crimson/60 placeholder:text-gray-400"
        />
        <div className="flex justify-end mt-1.5">
          <button
            onClick={submit}
            disabled={!body.trim() || submitting}
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ backgroundColor: '#8B1A2B' }}
          >
            {submitting ? 'Posting…' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CommentThread({
  comment,
  paperId,
  depth = 0,
}: {
  comment: Comment;
  paperId: string;
  depth?: number;
}) {
  const [replies, setReplies] = useState<Comment[]>(comment.replies);
  const [replyOpen, setReplyOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn('flex gap-3', depth > 0 && 'ml-8 mt-3')}>
      {/* Thread line */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <Avatar author={comment.author} />
        {!collapsed && replies.length > 0 && (
          <button
            onClick={() => setCollapsed(true)}
            className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-brand-crimson/40 rounded-full transition-colors mt-1"
            title="Collapse thread"
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Link
            href={`/profile/${comment.author.username}` as never}
            className="text-xs font-semibold text-gray-900 dark:text-gray-100 hover:text-brand-crimson transition-colors"
          >
            {comment.author.name}
          </Link>
          {comment.author.role === 'VERIFIED_PROFESSIONAL' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: 'rgba(201,168,76,0.15)', color: '#A88C3A' }}>
              {comment.author.verifiedProfessionalTitle || 'Verified'}
            </span>
          )}
          <span className="text-[11px] text-gray-400">{timeAgo(comment.createdAt)}</span>
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="ml-1 text-[11px] text-brand-crimson flex items-center gap-0.5"
            >
              <ChevronDown size={12} /> {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>

        {!collapsed && (
          <>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap mb-2">
              {comment.body}
            </p>

            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => setReplyOpen((o) => !o)}
                className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-brand-crimson transition-colors font-medium"
              >
                <ChevronUp size={12} className={cn('transition-transform', !replyOpen && 'rotate-180')} />
                Reply
              </button>
            </div>

            {replyOpen && (
              <div className="mb-3">
                <CommentBox
                  paperId={paperId}
                  parentId={comment.id}
                  autoFocus
                  placeholder={`Reply to ${comment.author.name}…`}
                  onPosted={(c) => {
                    setReplies((r) => [...r, c]);
                    setReplyOpen(false);
                  }}
                />
              </div>
            )}

            {replies.map((r) => (
              <CommentThread key={r.id} comment={r} paperId={paperId} depth={depth + 1} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export function PaperComments({ paperId }: { paperId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/papers/${paperId}/comments`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments || []))
      .finally(() => setLoading(false));
  }, [paperId]);

  return (
    <section className="mt-8">
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100 dark:border-gray-800">
        <MessageCircle size={16} style={{ color: '#8B1A2B' }} />
        <h2 className="font-serif text-base font-semibold" style={{ color: '#8B1A2B' }}>
          Discussion {comments.length > 0 && <span className="text-sm font-normal text-gray-400">({comments.length})</span>}
        </h2>
      </div>

      {/* New top-level comment */}
      <div className="mb-6">
        <CommentBox
          paperId={paperId}
          onPosted={(c) => setComments((prev) => [c, ...prev])}
        />
      </div>

      {/* Thread list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No comments yet — be the first to share your thoughts.</p>
      ) : (
        <div className="space-y-5">
          {comments.map((c) => (
            <CommentThread key={c.id} comment={c} paperId={paperId} />
          ))}
        </div>
      )}
    </section>
  );
}
