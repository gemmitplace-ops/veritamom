'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { PostCard } from './PostCard';
import { NewPostModal } from './NewPostModal';
import { useAuth } from '@/components/auth/AuthProvider';
import { cn } from '@/lib/utils';
import { Plus, Users } from 'lucide-react';

const categories = [
  { value: 'ALL', label: 'All' },
  { value: 'QUESTION', label: 'Questions' },
  { value: 'WIN', label: 'Wins' },
  { value: 'CONCERN', label: 'Concerns' },
  { value: 'PRODUCT_REVIEW', label: 'Reviews' },
  { value: 'RECIPE', label: 'Recipes' },
];

const sorts = [
  { value: 'hot', label: 'Hot' },
  { value: 'new', label: 'New' },
  { value: 'top', label: 'Top' },
];

interface Post {
  id: string;
  title: string;
  body: string;
  category: string;
  upvotes: number;
  downvotes: number;
  isPinned: boolean;
  isFlagged: boolean;
  createdAt: string;
  userVote: number;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
    role: string;
    verifiedProfessionalTitle: string | null;
    country: string | null;
  };
  _count: { comments: number };
}

export function CommunityFeed() {
  const t = useTranslations();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('ALL');
  const [sort, setSort] = useState('hot');
  const [showNewPost, setShowNewPost] = useState(false);

  const loadPosts = () => {
    setLoading(true);
    fetch(`/api/posts?category=${category}&sort=${sort}`)
      .then((r) => r.json())
      .then((data) => setPosts(data.posts || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPosts(); }, [category, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1
            className="font-serif leading-tight"
            style={{ color: '#8B1A2B', fontSize: '28px', fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            {t('community.title')}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1.5">
            <Users size={13} />
            {t('community.subtitle')}
          </p>
        </div>
        {user && (
          <button
            onClick={() => setShowNewPost(true)}
            className="flex items-center gap-2 text-white px-5 py-2.5 rounded-full font-medium hover:opacity-90 transition-opacity min-h-[44px] shadow-sm text-sm"
            style={{ backgroundColor: '#8B1A2B' }}
          >
            <Plus size={15} />
            <span className="hidden sm:inline">{t('community.newPost')}</span>
          </button>
        )}
      </div>

      {/* Category pills — matches homepage trimester pill style */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 no-scrollbar">
        {categories.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setCategory(value)}
            className={cn(
              'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border',
              category === value
                ? 'text-white border-transparent shadow-sm'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-brand-crimson/50 hover:text-brand-crimson'
            )}
            style={category === value ? { backgroundColor: '#8B1A2B', borderColor: '#8B1A2B' } : {}}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sort tabs */}
      <div className="flex items-center gap-1 mb-5">
        <span className="text-xs text-gray-400 mr-1 uppercase tracking-wider font-medium">Sort:</span>
        {sorts.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setSort(value)}
            className={cn(
              'text-xs px-3 py-1.5 rounded-full transition-colors border font-medium',
              sort === value
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700'
                : 'text-gray-400 border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-600'
            )}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400">{posts.length} posts</span>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
              style={{ backgroundColor: '#FAF8F3' }}
            >
              <div className="flex">
                <div className="w-1 flex-shrink-0 bg-brand-gold/30" />
                <div className="p-4 flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                      <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded w-1/6" />
                    </div>
                    <div className="h-5 w-20 bg-gray-100 dark:bg-gray-800 rounded-full" />
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-5/6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400 mb-2">{t('community.noPosts')}</p>
          {user ? (
            <button
              onClick={() => setShowNewPost(true)}
              className="text-sm font-medium mt-1"
              style={{ color: '#8B1A2B' }}
            >
              {t('community.newPost')}
            </button>
          ) : (
            <p className="text-gray-400 dark:text-gray-500 text-sm">{t('community.noPostsHint')}</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={loadPosts} />
          ))}
        </div>
      )}

      {showNewPost && (
        <NewPostModal onClose={() => setShowNewPost(false)} onSuccess={loadPosts} />
      )}
    </div>
  );
}
