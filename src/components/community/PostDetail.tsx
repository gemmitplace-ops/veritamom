'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  ChevronUp, ChevronDown, MessageCircle, BadgeCheck,
  Flag, Trash2, ArrowLeft, Send,
} from 'lucide-react';
import { cn, getCountryFlag, formatRelativeTime } from '@/lib/utils';

interface Author {
  id: string; name: string; username: string; avatarUrl: string | null;
  role: string; verifiedProfessionalTitle: string | null; country: string | null;
}

interface Comment {
  id: string; body: string; createdAt: string; author: Author;
  replies: Comment[];
}

interface Post {
  id: string; title: string; body: string; category: string;
  upvotes: number; downvotes: number; isPinned: boolean;
  isFlagged: boolean; createdAt: string; userVote: number;
  author: Author;
  _count: { comments: number; votes: number };
}

const categoryColors: Record<string, string> = {
  QUESTION: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  WIN: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  CONCERN: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  PRODUCT_REVIEW: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  RECIPE: 'bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400',
};

function Avatar({ author, size = 'md' }: { author: Author; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
  return (
    <div className={cn('rounded-full bg-brand-crimson/10 text-brand-crimson flex items-center justify-center font-semibold flex-shrink-0', dim)}>
      {author.name[0].toUpperCase()}
    </div>
  );
}

function CommentItem({ comment, postId, onPosted }: { comment: Comment; postId: string; onPosted: () => void }) {
  const { user } = useAuth();
  const [replying, setReplying] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submitReply() {
    if (!replyBody.trim()) return;
    setSubmitting(true);
    await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: replyBody, parentId: comment.id }),
    });
    setReplyBody('');
    setReplying(false);
    setSubmitting(false);
    onPosted();
  }

  return (
    <div className="group">
      <div className="flex gap-3">
        <Avatar author={comment.author} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/profile/${comment.author.username}`} className="text-sm font-semibold hover:text-brand-crimson transition-colors">
              {comment.author.name}
            </Link>
            {comment.author.role === 'VERIFIED_PROFESSIONAL' && (
              <BadgeCheck size={13} className="text-brand-gold-dark" />
            )}
            {comment.author.country && (
              <span className="text-xs">{getCountryFlag(comment.author.country)}</span>
            )}
            <span className="text-xs text-gray-400">{formatRelativeTime(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 leading-relaxed whitespace-pre-wrap">{comment.body}</p>
          {user && (
            <button
              onClick={() => setReplying(!replying)}
              className="mt-1 text-xs text-gray-400 hover:text-brand-crimson transition-colors"
            >
              Reply
            </button>
          )}
          {replying && (
            <div className="mt-2 flex gap-2">
              <input
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-crimson/30"
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && submitReply()}
              />
              <button
                onClick={submitReply}
                disabled={submitting || !replyBody.trim()}
                className="px-3 py-2 bg-brand-crimson text-white rounded-lg text-sm disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies.length > 0 && (
        <div className="ml-10 mt-3 space-y-3 border-l-2 border-gray-100 dark:border-gray-800 pl-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} postId={postId} onPosted={onPosted} />
          ))}
        </div>
      )}
    </div>
  );
}

export function PostDetail({ postId, locale }: { postId: string; locale: string }) {
  const t = useTranslations();
  const { user } = useAuth();
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentBody, setCommentBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [votes, setVotes] = useState({ upvotes: 0, downvotes: 0, userVote: 0 });
  const [flagging, setFlagging] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [deleting, setDeleting] = useState(false);

  const fetchPost = useCallback(async () => {
    const [postRes, commentsRes] = await Promise.all([
      fetch(`/api/posts/${postId}`),
      fetch(`/api/posts/${postId}/comments`),
    ]);
    if (!postRes.ok) { setLoading(false); return; }
    const postData = await postRes.json();
    const commentsData = commentsRes.ok ? await commentsRes.json() : { comments: [] };
    setPost(postData.post);
    setVotes({ upvotes: postData.post.upvotes, downvotes: postData.post.downvotes, userVote: postData.post.userVote });
    setComments(commentsData.comments || []);
    setLoading(false);
  }, [postId]);

  useEffect(() => { fetchPost(); }, [fetchPost]);

  async function vote(value: 1 | -1) {
    if (!user || !post) return;
    const newValue = votes.userVote === value ? 0 : value;
    const res = await fetch(`/api/posts/${post.id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: newValue }),
    });
    if (res.ok) {
      setVotes((v) => {
        const up = v.upvotes + (newValue === 1 ? 1 : v.userVote === 1 ? -1 : 0);
        const down = v.downvotes + (newValue === -1 ? 1 : v.userVote === -1 ? -1 : 0);
        return { upvotes: up, downvotes: down, userVote: newValue };
      });
    }
  }

  async function submitComment() {
    if (!commentBody.trim() || submitting) return;
    setSubmitting(true);
    await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: commentBody }),
    });
    setCommentBody('');
    setSubmitting(false);
    fetchPost();
  }

  async function submitFlag() {
    if (!flagReason.trim()) return;
    await fetch('/api/flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType: 'POST', targetId: postId, reason: flagReason }),
    });
    setFlagging(false);
    setFlagReason('');
  }

  async function handleDelete() {
    if (!confirm('Delete this post?')) return;
    setDeleting(true);
    await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
    router.push('/community');
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Post not found.</p>
        <Link href="/community" className="mt-4 inline-block text-brand-crimson hover:underline">
          ← Back to Community
        </Link>
      </div>
    );
  }

  const netScore = votes.upvotes - votes.downvotes;
  const isAuthor = user?.id === post.author.id;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Back link */}
      <Link
        href="/community"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-crimson transition-colors mb-6"
      >
        <ArrowLeft size={15} />
        {t('community.title')}
      </Link>

      {/* Post card */}
      <article className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-6">
        {/* Category + meta */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', categoryColors[post.category] || '')}>
            {post.category.replace('_', ' ')}
          </span>
          <span className="text-xs text-gray-400">{formatRelativeTime(post.createdAt, locale)}</span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-2xl text-gray-900 dark:text-gray-100 leading-snug mb-4">
          {post.title}
        </h1>

        {/* Author */}
        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100 dark:border-gray-800">
          <Avatar author={post.author} />
          <div>
            <div className="flex items-center gap-1.5">
              <Link href={`/profile/${post.author.username}`} className="text-sm font-semibold hover:text-brand-crimson transition-colors">
                {post.author.name}
              </Link>
              {post.author.role === 'VERIFIED_PROFESSIONAL' && (
                <span title={post.author.verifiedProfessionalTitle || t('community.verified')}>
                  <BadgeCheck size={14} className="text-brand-gold-dark" />
                </span>
              )}
              {post.author.country && (
                <span className="text-sm">{getCountryFlag(post.author.country)}</span>
              )}
            </div>
            {post.author.verifiedProfessionalTitle && (
              <p className="text-xs text-brand-gold-dark">{post.author.verifiedProfessionalTitle}</p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{post.body}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          {/* Vote */}
          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg px-2">
            <button
              onClick={() => vote(1)}
              className={cn('p-1.5 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center', votes.userVote === 1 ? 'text-brand-crimson' : 'text-gray-400 hover:text-brand-crimson')}
            >
              <ChevronUp size={18} />
            </button>
            <span className="text-sm font-bold text-gray-800 dark:text-gray-200 min-w-[24px] text-center">{netScore}</span>
            <button
              onClick={() => vote(-1)}
              className={cn('p-1.5 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center', votes.userVote === -1 ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500')}
            >
              <ChevronDown size={18} />
            </button>
          </div>

          {/* Comment count */}
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <MessageCircle size={15} />
            <span>{comments.length} {t('community.reply')}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Flag */}
            {user && !isAuthor && (
              <button
                onClick={() => setFlagging(!flagging)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10"
              >
                <Flag size={15} />
              </button>
            )}
            {/* Delete */}
            {(isAuthor || isAdmin) && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Flag form */}
        {flagging && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <textarea
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder={t('community.flagReason')}
              className="w-full text-sm p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
              rows={2}
            />
            <div className="flex gap-2 mt-2">
              <button onClick={() => setFlagging(false)} className="text-sm text-gray-500 px-3 py-1.5">{t('common.cancel')}</button>
              <button onClick={submitFlag} className="text-sm bg-red-500 text-white px-4 py-1.5 rounded-lg">{t('community.flagSubmit')}</button>
            </div>
          </div>
        )}
      </article>

      {/* Comments section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-5">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </h2>

        {/* Add comment */}
        {user ? (
          <div className="flex gap-3 mb-6">
            <div className="w-9 h-9 rounded-full bg-brand-crimson text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {user.name[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder={t('research.addComment')}
                rows={3}
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-crimson/30 resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={submitComment}
                  disabled={!commentBody.trim() || submitting}
                  className="px-4 py-2 bg-brand-crimson text-white text-sm rounded-lg hover:bg-brand-crimson-dark disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <Send size={13} />
                  {submitting ? t('common.loading') : t('research.postComment')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 text-center py-4 bg-brand-cream dark:bg-gray-800 rounded-xl">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <Link href="/sign-in" className="text-brand-crimson hover:underline font-medium">Sign in</Link>
              {' '}to join the conversation
            </p>
          </div>
        )}

        {/* Comment list */}
        {comments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">{t('research.noComments')}</p>
        ) : (
          <div className="space-y-5 divide-y divide-gray-50 dark:divide-gray-800">
            {comments.map((comment) => (
              <div key={comment.id} className="pt-5 first:pt-0">
                <CommentItem comment={comment} postId={postId} onPosted={fetchPost} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
