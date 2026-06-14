'use client';

import { useState, useEffect, useRef, useCallback, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth/AuthProvider';
import { Send, MessageSquare, Plus, X, Users } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import { FollowListModal } from '@/components/profile/FollowListModal';

interface MemberUser {
  id: string; name: string; username: string; avatarUrl: string | null;
}
interface ConvMessage {
  id: string; body: string; createdAt: string;
  sender: MemberUser;
}
interface Conversation {
  id: string; isGroup: boolean; name: string | null; createdAt: string;
  members: { user: MemberUser }[];
  messages: ConvMessage[];
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'sm' ? 'w-7 h-7 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-9 h-9 text-sm';
  return (
    <div className={cn('rounded-full bg-brand-crimson text-white flex items-center justify-center font-semibold flex-shrink-0', cls)}>
      {name[0].toUpperCase()}
    </div>
  );
}

function ConvName({ conv, currentUserId }: { conv: Conversation; currentUserId: string }) {
  if (conv.name) return <>{conv.name}</>;
  const others = conv.members.filter((m) => m.user.id !== currentUserId);
  if (others.length === 0) return <>You</>;
  return <>{others.map((m) => m.user.name).join(', ')}</>;
}

export function MessagesPanel() {
  const t = useTranslations();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConvMessage[]>([]);
  const [messageBody, setMessageBody] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [showNewDM, setShowNewDM] = useState(false);
  const [newDMUsername, setNewDMUsername] = useState('');
  const [newDMError, setNewDMError] = useState('');
  const [userResults, setUserResults] = useState<{ id: string; name: string; username: string }[]>([]);
  const [, startTransition] = useTransition();
  const [otherUserProfile, setOtherUserProfile] = useState<{ id: string; username: string; following: boolean; followers: number; followingCount: number } | null>(null);
  const [followModal, setFollowModal] = useState<'followers' | 'following' | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId);

  const fetchConversations = useCallback(async () => {
    const res = await fetch('/api/conversations');
    if (res.ok) {
      const d = await res.json();
      setConversations(d.conversations || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  async function openConversation(convId: string) {
    setActiveConvId(convId);
    setOtherUserProfile(null);
    setMessagesLoading(true);
    const res = await fetch(`/api/conversations/${convId}/messages`);
    if (res.ok) {
      const d = await res.json();
      setMessages(d.messages || []);
    }
    setMessagesLoading(false);

    // Load the other user's profile for the header
    const conv = conversations.find(c => c.id === convId);
    if (conv && !conv.isGroup && user) {
      const other = conv.members.find(m => m.user.id !== user.id)?.user;
      if (other) {
        const profileRes = await fetch(`/api/users/${other.id}`);
        if (profileRes.ok) {
          const pd = await profileRes.json();
          setOtherUserProfile({
            id: pd.user.id,
            username: pd.user.username,
            following: pd.isFollowing ?? false,
            followers: pd.user._count?.followers ?? 0,
            followingCount: pd.user._count?.following ?? 0,
          });
        }
      }
    }
  }

  async function toggleFollowOther() {
    if (!otherUserProfile) return;
    const res = await fetch(`/api/users/${otherUserProfile.id}/follow`, { method: 'POST' });
    const data = await res.json();
    setOtherUserProfile(prev => prev ? {
      ...prev,
      following: data.following,
      followers: prev.followers + (data.following ? 1 : -1),
    } : null);
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!messageBody.trim() || !activeConvId || sending) return;
    setSending(true);
    const res = await fetch(`/api/conversations/${activeConvId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: messageBody }),
    });
    if (res.ok) {
      const d = await res.json();
      setMessages((prev) => [...prev, d.message]);
      setMessageBody('');
    }
    setSending(false);
  }

  function handleDMSearch(q: string) {
    setNewDMUsername(q);
    setNewDMError('');
    if (q.length < 2) { setUserResults([]); return; }
    startTransition(() => {
      fetch(`/api/users/search?q=${encodeURIComponent(q)}`)
        .then(r => r.json())
        .then(d => setUserResults(d.users || []));
    });
  }

  async function startDM(targetId?: string) {
    setNewDMError('');
    let userId = targetId;
    if (!userId) {
      if (!newDMUsername.trim()) return;
      const profileRes = await fetch(`/api/users/${newDMUsername}`);
      if (!profileRes.ok) { setNewDMError('User not found'); return; }
      const { user: targetUser } = await profileRes.json();
      userId = targetUser.id;
    }
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      const { conversation } = await res.json();
      await fetchConversations();
      setShowNewDM(false);
      setNewDMUsername('');
      setUserResults([]);
      openConversation(conversation.id);
    }
  }

  if (!user) {
    return <MessagesGuestState />;
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] md:h-[calc(100vh-5rem)] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      {/* Sidebar — conversation list */}
      <div className={cn(
        'w-full md:w-72 flex-shrink-0 border-r border-gray-100 dark:border-gray-800 flex flex-col',
        activeConvId ? 'hidden md:flex' : 'flex'
      )}>
        {/* Sidebar header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-serif text-lg text-brand-crimson">{t('messages.title')}</h2>
          <button
            onClick={() => setShowNewDM(true)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-brand-crimson transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title={t('messages.newConversation')}
          >
            <Plus size={18} />
          </button>
        </div>

        {/* New DM form */}
        {showNewDM && (
          <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-brand-cream/50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Start a conversation</p>
              <button onClick={() => { setShowNewDM(false); setNewDMError(''); setUserResults([]); setNewDMUsername(''); }} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            </div>
            <div className="relative">
              <input
                value={newDMUsername}
                onChange={(e) => handleDMSearch(e.target.value)}
                placeholder="Search by name or username…"
                autoFocus
                className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-crimson/30"
              />
              {userResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 overflow-hidden">
                  {userResults.map(u => (
                    <button
                      key={u.id}
                      onClick={() => startDM(u.id)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-brand-crimson text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {u.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{u.name}</p>
                        {u.username && <p className="text-xs text-gray-400">@{u.username}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {newDMUsername.length >= 2 && userResults.length === 0 && (
                <p className="text-xs text-gray-400 mt-1.5 px-1">No users found</p>
              )}
            </div>
            {newDMError && <p className="text-xs text-red-500 mt-1">{newDMError}</p>}
          </div>
        )}

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
                    <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center">
              <MessageSquare size={28} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">{t('messages.noConversations')}</p>
              <button
                onClick={() => setShowNewDM(true)}
                className="mt-3 text-sm text-brand-crimson hover:underline"
              >
                Start one →
              </button>
            </div>
          ) : (
            conversations.map((conv) => {
              const lastMsg = conv.messages[0];
              const others = conv.members.filter((m) => m.user.id !== user.id);
              const displayName = conv.name || others.map((m) => m.user.name).join(', ') || 'You';
              return (
                <button
                  key={conv.id}
                  onClick={() => openConversation(conv.id)}
                  className={cn(
                    'w-full text-left flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800/50',
                    activeConvId === conv.id && 'bg-brand-cream dark:bg-gray-800 border-r-2 border-r-brand-crimson'
                  )}
                >
                  {conv.isGroup ? (
                    <div className="w-9 h-9 rounded-full bg-brand-gold/20 text-brand-gold-dark flex items-center justify-center flex-shrink-0">
                      <Users size={16} />
                    </div>
                  ) : (
                    <Avatar name={others[0]?.user.name || 'U'} size="sm" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{displayName}</p>
                    {lastMsg && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {lastMsg.sender.id === user.id ? 'You: ' : ''}{lastMsg.body}
                      </p>
                    )}
                  </div>
                  {lastMsg && (
                    <span className="text-[10px] text-gray-400 flex-shrink-0 pt-0.5">
                      {formatRelativeTime(lastMsg.createdAt)}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Message thread */}
      <div className={cn(
        'flex-1 flex flex-col',
        !activeConvId ? 'hidden md:flex' : 'flex'
      )}>
        {activeConv ? (
          <>
            {/* Thread header */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
              <button
                className="md:hidden p-1.5 text-gray-400 hover:text-brand-crimson flex-shrink-0"
                onClick={() => setActiveConvId(null)}
              >
                ←
              </button>

              {activeConv.isGroup ? (
                <div className="w-10 h-10 rounded-full bg-brand-gold/20 text-brand-gold-dark flex items-center justify-center flex-shrink-0">
                  <Users size={18} />
                </div>
              ) : otherUserProfile ? (
                <Link href={`/profile/${otherUserProfile.username}` as never} className="flex-shrink-0">
                  <Avatar name={activeConv.members.find(m => m.user.id !== user.id)?.user.name || 'U'} />
                </Link>
              ) : (
                <Avatar name={activeConv.members.find(m => m.user.id !== user.id)?.user.name || 'U'} />
              )}

              <div className="flex-1 min-w-0">
                {otherUserProfile ? (
                  <Link href={`/profile/${otherUserProfile.username}` as never} className="font-semibold text-gray-900 dark:text-gray-100 text-sm hover:text-brand-crimson transition-colors">
                    <ConvName conv={activeConv} currentUserId={user.id} />
                  </Link>
                ) : (
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                    <ConvName conv={activeConv} currentUserId={user.id} />
                  </p>
                )}

                {/* Follower/following stats */}
                {otherUserProfile && (
                  <div className="flex items-center gap-3 mt-0.5">
                    <button
                      onClick={() => setFollowModal('followers')}
                      className="text-[11px] text-gray-400 hover:text-brand-crimson transition-colors"
                    >
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{otherUserProfile.followers}</span> followers
                    </button>
                    <button
                      onClick={() => setFollowModal('following')}
                      className="text-[11px] text-gray-400 hover:text-brand-crimson transition-colors"
                    >
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{otherUserProfile.followingCount}</span> following
                    </button>
                  </div>
                )}

                {activeConv.isGroup && (
                  <p className="text-xs text-gray-400">{activeConv.members.length} members</p>
                )}
              </div>

              {/* Follow / Unfollow button */}
              {otherUserProfile && (
                <button
                  onClick={toggleFollowOther}
                  className={cn(
                    'flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                    otherUserProfile.following
                      ? 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      : 'bg-brand-crimson text-white hover:opacity-90'
                  )}
                >
                  {otherUserProfile.following ? 'Following' : 'Follow'}
                </button>
              )}
            </div>

            {/* Follow list modal */}
            {followModal && otherUserProfile && (
              <FollowListModal
                userId={otherUserProfile.id}
                type={followModal}
                onClose={() => setFollowModal(null)}
              />
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-sm text-gray-400">{t('common.loading')}</div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-gray-400">{t('messages.noMessages')}</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender.id === user.id;
                  return (
                    <div key={msg.id} className={cn('flex gap-2.5', isMe ? 'flex-row-reverse' : 'flex-row')}>
                      {!isMe && <Avatar name={msg.sender.name} size="sm" />}
                      <div className={cn('max-w-[70%] space-y-1', isMe ? 'items-end' : 'items-start', 'flex flex-col')}>
                        {!isMe && (
                          <span className="text-xs text-gray-400 ml-1">{msg.sender.name}</span>
                        )}
                        <div className={cn(
                          'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
                          isMe
                            ? 'bg-brand-crimson text-white rounded-tr-sm'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm'
                        )}>
                          {msg.body}
                        </div>
                        <span className="text-[10px] text-gray-400 mx-1">{formatRelativeTime(msg.createdAt)}</span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Compose */}
            <div className="p-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex gap-2">
                <input
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder={t('messages.typeMessage')}
                  className="flex-1 text-sm px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-crimson/30"
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  disabled={!messageBody.trim() || sending}
                  className="px-4 py-3 bg-brand-crimson text-white rounded-xl hover:bg-brand-crimson-dark disabled:opacity-50 transition-colors flex items-center justify-center min-w-[44px]"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageSquare size={48} className="text-gray-200 dark:text-gray-700 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Select a conversation or start a new one</p>
            <button
              onClick={() => setShowNewDM(true)}
              className="mt-4 px-4 py-2 bg-brand-crimson text-white rounded-lg text-sm hover:bg-brand-crimson-dark transition-colors"
            >
              {t('messages.newConversation')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Guest empty state ─────────────────────────────────────────────── */

function MessagesGuestState() {
  // Fake conversations for the greyed-out preview
  const fakeConvs = [
    { id: '1', name: 'Sarah Chen', preview: 'Have you tried the ginger tea recipe?', time: '2h' },
    { id: '2', name: 'Janna Anrisan', preview: 'My OB said the same thing last week!', time: '5h' },
    { id: '3', name: 'Mum Circle 🇸🇬', preview: 'Thanks everyone for the support 💛', time: '1d' },
  ];

  return (
    <div className="flex h-full rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm relative">
      {/* Blur overlay with CTA — sits above both panes */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-[3px] bg-white/60 dark:bg-gray-950/60">
        <div
          className="rounded-2xl px-8 py-7 text-center shadow-xl border border-brand-gold/20 max-w-xs mx-4"
          style={{ backgroundColor: '#FAF8F3' }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ backgroundColor: 'rgba(139,26,43,0.08)' }}
          >
            <MessageSquare size={22} style={{ color: '#8B1A2B' }} />
          </div>
          <h2
            className="font-serif text-lg mb-1.5"
            style={{ color: '#8B1A2B', fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Message mothers
          </h2>
          <p className="text-xs text-gray-500 mb-5 leading-relaxed">
            Connect privately with other mothers, join group chats, and share your journey.
          </p>
          <a
            href="/sign-in"
            className="block w-full text-center text-sm font-semibold py-3 rounded-full text-white mb-2 transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#8B1A2B' }}
          >
            Sign in to message
          </a>
          <a
            href="/sign-up"
            className="block text-xs font-medium transition-colors"
            style={{ color: '#8B1A2B' }}
          >
            No account? Sign up free →
          </a>
        </div>
      </div>

      {/* Ghost conversations list */}
      <div className="w-72 flex-shrink-0 border-r border-gray-100 dark:border-gray-800 flex flex-col bg-white dark:bg-gray-900 select-none pointer-events-none">
        <div className="p-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="font-semibold text-sm text-gray-800 dark:text-gray-200">Messages</h2>
          </div>
          <div className="relative">
            <div className="w-full h-9 rounded-lg bg-gray-100 dark:bg-gray-800" />
          </div>
        </div>
        <div className="flex-1 overflow-hidden divide-y divide-gray-50 dark:divide-gray-800">
          {fakeConvs.map((c) => (
            <div key={c.id} className="flex items-center gap-3 px-4 py-3.5 opacity-60">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ backgroundColor: '#8B1A2B' }}
              >
                {c.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{c.name}</p>
                  <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0">{c.time}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.preview}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ghost message pane */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 select-none pointer-events-none opacity-40">
        <MessageSquare size={36} className="text-gray-300 dark:text-gray-700 mb-3" />
        <p className="text-sm text-gray-400">Select a conversation</p>
      </div>
    </div>
  );
}
