'use client';

import { useState, useEffect } from 'react';
import { useRouter, Link } from '@/i18n/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { AppShell } from '@/components/layout/AppShell';
import { ArrowLeft, Send, Mail } from 'lucide-react';

const TEMPLATES = [
  {
    label: 'Weekly Update',
    subject: 'Your Veritamom Weekly Update',
    body: `<p style="color:#4b5563;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi {{name}},</p>
<p style="color:#4b5563;font-size:15px;line-height:1.7;margin:0 0 16px;">Here's what's new on Veritamom this week.</p>
<p style="color:#4b5563;font-size:15px;line-height:1.7;margin:0 0 24px;">We've added new research papers, community discussions, and tools to support you through every stage of your journey.</p>
<div style="text-align:center;margin:28px 0;">
  <a href="https://veritamom.com" style="display:inline-block;background:#8B1A2B;color:#fff;text-decoration:none;padding:14px 32px;border-radius:999px;font-size:14px;font-weight:600;">See What's New</a>
</div>`,
  },
  {
    label: 'Announcement',
    subject: 'An update from Veritamom',
    body: `<p style="color:#4b5563;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi {{name}},</p>
<p style="color:#4b5563;font-size:15px;line-height:1.7;margin:0 0 24px;">We have an exciting announcement to share with you.</p>
<p style="color:#4b5563;font-size:15px;line-height:1.7;margin:0 0 24px;">[Write your announcement here]</p>`,
  },
];

export default function CommunicationPage({ params: { locale } }: { params: { locale: string } }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) router.replace('/');
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'ADMIN') {
    return (
      <AppShell locale={locale}>
        <div className="max-w-3xl mx-auto px-4 py-16 flex justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-brand-crimson/30 border-t-brand-crimson animate-spin" />
        </div>
      </AppShell>
    );
  }

  async function handleSend() {
    if (!subject.trim() || !body.trim()) {
      setError('Subject and body are required.');
      return;
    }
    const confirmed = window.confirm(`Send "${subject}" to ALL registered users? This cannot be undone.`);
    if (!confirmed) return;

    setSending(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/admin/communication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setResult(data);
    } catch (e: unknown) {
      setError((e as Error).message || 'Something went wrong.');
    } finally {
      setSending(false);
    }
  }

  return (
    <AppShell locale={locale}>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-crimson mb-6">
          <ArrowLeft size={14} /> Back to Admin
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(201,168,76,0.12)' }}>
            <Mail size={20} style={{ color: '#C9A84C' }} />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold" style={{ color: '#8B1A2B' }}>User Communication</h1>
            <p className="text-sm text-gray-500">Send an email to all registered users</p>
          </div>
        </div>

        {result ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(139,26,43,0.08)' }}>
              <Send size={22} style={{ color: '#8B1A2B' }} />
            </div>
            <h2 className="font-serif text-xl mb-2" style={{ color: '#8B1A2B' }}>Emails sent</h2>
            <p className="text-gray-500 text-sm mb-1">Sent: <strong className="text-gray-800">{result.sent}</strong> / {result.total}</p>
            {result.failed > 0 && <p className="text-red-500 text-sm">Failed: {result.failed}</p>}
            <button
              onClick={() => { setResult(null); setSubject(''); setBody(''); }}
              className="mt-6 px-5 py-2 rounded-xl text-sm font-medium text-white"
              style={{ backgroundColor: '#8B1A2B' }}
            >
              Send another
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            {/* Templates */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Quick templates</p>
              <div className="flex gap-2 flex-wrap">
                {TEMPLATES.map(t => (
                  <button
                    key={t.label}
                    onClick={() => { setSubject(t.subject); setBody(t.body); }}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:border-brand-gold hover:text-brand-crimson transition-colors"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Subject line</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Your Veritamom Weekly Update"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-crimson/20 focus:border-brand-crimson/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Body <span className="font-normal text-gray-400">(HTML supported · use <code className="bg-gray-100 px-1 rounded">{'{{name}}'}</code> for personalisation)</span>
              </label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={12}
                placeholder="<p>Hi {{name}},</p><p>Here's what's new...</p>"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-crimson/20 focus:border-brand-crimson/50 resize-y"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              onClick={handleSend}
              disabled={sending}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity"
              style={{ backgroundColor: '#8B1A2B' }}
            >
              <Send size={15} />
              {sending ? 'Sending to all users…' : 'Send to all users'}
            </button>

            <p className="text-xs text-gray-400 text-center">
              This will send to every registered account. Use sparingly.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
