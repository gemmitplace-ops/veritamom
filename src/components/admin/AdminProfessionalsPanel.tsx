'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { BadgeCheck, X, Check, Users, Mail, MapPin, FileText } from 'lucide-react';
import { formatRelativeTime, getCountryFlag } from '@/lib/utils';

interface Applicant {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  verifiedProfessionalTitle: string | null;
  country: string | null;
  city: string | null;
  createdAt: string;
  avatarUrl: string | null;
  _count: { posts: number; comments: number };
}

export function AdminProfessionalsPanel() {
  const t = useTranslations();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/professionals')
      .then((r) => r.json())
      .then((d) => { setApplicants(d.applicants || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleAction(userId: string, action: 'approve' | 'reject') {
    setProcessing(userId);
    const res = await fetch(`/api/admin/professionals/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      // Update local state
      setApplicants((prev) =>
        prev.map((a) =>
          a.id === userId
            ? { ...a, role: action === 'approve' ? 'VERIFIED_PROFESSIONAL' : 'MOTHER' }
            : a
        )
      );
    }
    setProcessing(null);
  }

  const pending = applicants.filter((a) => a.role !== 'VERIFIED_PROFESSIONAL');
  const approved = applicants.filter((a) => a.role === 'VERIFIED_PROFESSIONAL');

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Pending */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-serif text-xl text-brand-crimson">{t('admin.profesionalApplicants')}</h2>
          {pending.length > 0 && (
            <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 rounded-full font-medium">
              {pending.length} pending
            </span>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
            <Users size={28} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">{t('admin.noProfessionals')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((applicant) => (
              <ApplicantCard
                key={applicant.id}
                applicant={applicant}
                processing={processing === applicant.id}
                onAction={handleAction}
              />
            ))}
          </div>
        )}
      </section>

      {/* Approved */}
      {approved.length > 0 && (
        <section>
          <h2 className="font-serif text-xl text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <BadgeCheck size={18} className="text-brand-gold-dark" />
            Verified Professionals ({approved.length})
          </h2>
          <div className="space-y-3">
            {approved.map((applicant) => (
              <ApplicantCard
                key={applicant.id}
                applicant={applicant}
                processing={processing === applicant.id}
                onAction={handleAction}
                isApproved
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ApplicantCard({
  applicant,
  processing,
  onAction,
  isApproved = false,
}: {
  applicant: Applicant;
  processing: boolean;
  onAction: (id: string, action: 'approve' | 'reject') => void;
  isApproved?: boolean;
}) {
  const t = useTranslations();

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
      <div className="flex gap-4 flex-wrap sm:flex-nowrap">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-brand-crimson/10 text-brand-crimson flex items-center justify-center text-lg font-serif font-bold flex-shrink-0">
          {applicant.name[0].toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/profile/${applicant.username}`}
              className="font-semibold text-gray-900 dark:text-gray-100 hover:text-brand-crimson transition-colors"
            >
              {applicant.name}
            </Link>
            {isApproved && (
              <span className="flex items-center gap-1 text-xs text-brand-gold-dark bg-brand-gold/10 px-2 py-0.5 rounded-full">
                <BadgeCheck size={11} />
                Verified
              </span>
            )}
            <span className="text-sm text-gray-500">@{applicant.username}</span>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
            {applicant.verifiedProfessionalTitle && (
              <span className="flex items-center gap-1">
                <FileText size={11} />
                {applicant.verifiedProfessionalTitle}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Mail size={11} />
              {applicant.email}
            </span>
            {applicant.country && (
              <span className="flex items-center gap-1">
                <MapPin size={11} />
                {getCountryFlag(applicant.country)} {applicant.city ? `${applicant.city}, ` : ''}{applicant.country}
              </span>
            )}
          </div>

          <div className="flex gap-3 text-xs text-gray-400">
            <span>{applicant._count.posts} posts</span>
            <span>{applicant._count.comments} comments</span>
            <span>Joined {formatRelativeTime(applicant.createdAt)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-start gap-2 flex-shrink-0">
          {!isApproved ? (
            <>
              <button
                onClick={() => onAction(applicant.id, 'approve')}
                disabled={processing}
                className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg disabled:opacity-50 transition-colors min-h-[44px]"
              >
                <Check size={14} />
                {t('admin.approve')}
              </button>
              <button
                onClick={() => onAction(applicant.id, 'reject')}
                disabled={processing}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 text-sm rounded-lg disabled:opacity-50 transition-colors min-h-[44px]"
              >
                <X size={14} />
                {t('admin.reject')}
              </button>
            </>
          ) : (
            <button
              onClick={() => onAction(applicant.id, 'reject')}
              disabled={processing}
              className="flex items-center gap-1.5 px-3 py-2 text-gray-400 hover:text-red-500 text-sm rounded-lg disabled:opacity-50 transition-colors border border-gray-200 dark:border-gray-700 hover:border-red-300 min-h-[44px]"
            >
              <X size={14} />
              Revoke
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
