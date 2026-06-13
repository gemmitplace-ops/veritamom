'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Link, useRouter, usePathname as useLocalePathname } from '@/i18n/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useState } from 'react';
import { Bell, MessageSquare, Menu, X, ChevronDown } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { cn } from '@/lib/utils';

const locales = [
  { code: 'en', label: 'EN' },
  { code: 'zh', label: '中文' },
  { code: 'ko', label: '한국어' },
];

export function Header({ locale }: { locale: string }) {
  const t = useTranslations();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const localePathname = useLocalePathname(); // locale-stripped, e.g. '/tools'
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Primary navigation — shown as a desktop row here; mobile uses BottomNav + hamburger
  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/community', label: t('nav.community') },
    { href: '/tools', label: t('nav.tools') },
  ];

  function switchLocale(code: string) {
    // pathname includes locale prefix e.g. '/en/community' → strip first segment
    const segments = pathname.split('/').filter(Boolean);
    const pathWithoutLocale = segments.slice(1).join('/');
    window.location.href = `/${code}${pathWithoutLocale ? `/${pathWithoutLocale}` : ''}`;
  }

  return (
    <header className="sticky top-0 z-50 bg-brand-cream/98 dark:bg-gray-950/98 backdrop-blur-sm border-b border-brand-cream-dark dark:border-gray-800 shadow-sm">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Veritamom" height={52} style={{ height: '52px', width: 'auto' }} />
          <div className="hidden sm:block">
            <span className="block font-serif font-bold leading-none" style={{ color: '#8B1A2B', fontSize: '22px', fontFamily: 'Georgia, "Times New Roman", serif' }}>
              VERITAMOM
            </span>
            <span className="block font-semibold uppercase leading-none mt-1" style={{ color: '#C9A84C', fontSize: '7px', letterSpacing: '0.17em' }}>
              The Gold Standard in Maternal Intelligence
            </span>
          </div>
        </Link>

        {/* Search bar — center */}
        <div className="flex-1 max-w-xl mx-auto hidden md:block">
          <SearchBar />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
          {/* Language switcher */}
          <div className="hidden lg:flex items-center gap-0.5 text-xs mr-1">
            {locales.map((l, i) => (
              <span key={l.code} className="flex items-center">
                {i > 0 && <span className="text-gray-300 dark:text-gray-700 mx-1">|</span>}
                <button
                  onClick={() => switchLocale(l.code)}
                  className={cn(
                    'px-1.5 py-1 rounded transition-colors',
                    locale === l.code
                      ? 'text-brand-crimson font-bold'
                      : 'text-gray-500 dark:text-gray-400 hover:text-brand-crimson'
                  )}
                >
                  {l.label}
                </button>
              </span>
            ))}
          </div>

          {user ? (
            <div className="flex items-center gap-1">
              <Link
                href="/messages"
                className="p-2 rounded-lg text-gray-500 hover:text-brand-crimson hover:bg-white dark:hover:bg-gray-800 transition-colors min-h-[44px] min-w-[44px] hidden md:flex items-center justify-center"
              >
                <MessageSquare size={18} />
              </Link>
              <Link
                href="/notifications"
                className="p-2 rounded-lg text-gray-500 hover:text-brand-crimson hover:bg-white dark:hover:bg-gray-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <Bell size={18} />
              </Link>

              {/* Avatar menu */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-1.5 min-h-[44px] px-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-crimson text-white flex items-center justify-center text-sm font-bold ring-2 ring-brand-gold/30">
                    {user.name[0].toUpperCase()}
                  </div>
                  <ChevronDown size={13} className="text-gray-400 hidden sm:block" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user.name}</p>
                      <p className="text-xs text-gray-400">@{user.username}</p>
                    </div>
                    <Link href={`/profile/${user.username}`} className="flex items-center px-4 py-2 text-sm hover:bg-brand-cream dark:hover:bg-gray-800 transition-colors" onClick={() => setMenuOpen(false)}>
                      {t('nav.profile')}
                    </Link>
                    <Link href="/messages" className="flex items-center px-4 py-2 text-sm hover:bg-brand-cream dark:hover:bg-gray-800 transition-colors md:hidden" onClick={() => setMenuOpen(false)}>
                      {t('nav.messages')}
                    </Link>
                    <Link href="/notifications" className="flex items-center px-4 py-2 text-sm hover:bg-brand-cream dark:hover:bg-gray-800 transition-colors md:hidden" onClick={() => setMenuOpen(false)}>
                      {t('nav.notifications')}
                    </Link>
                    {(user.role === 'ADMIN' || user.role === 'PUBLISHER') && (
                      <Link href="/publisher/papers" className="flex items-center px-4 py-2 text-sm hover:bg-brand-cream dark:hover:bg-gray-800 transition-colors" onClick={() => setMenuOpen(false)}>
                        {t('nav.admin')}
                      </Link>
                    )}
                    <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                      <button onClick={() => { signOut(); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-brand-crimson hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                        {t('nav.signOut')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="hidden sm:flex text-sm text-gray-700 dark:text-gray-300 hover:text-brand-crimson px-3 py-2 min-h-[44px] items-center transition-colors"
              >
                {t('nav.signIn')}
              </Link>
              <Link
                href="/sign-up"
                className="text-sm bg-brand-crimson text-white px-5 py-2.5 rounded-full hover:bg-brand-crimson-dark transition-colors min-h-[44px] flex items-center font-medium shadow-sm"
              >
                Navigate
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:text-brand-crimson min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Desktop primary nav */}
      <nav className="hidden md:block border-t border-brand-cream-dark/60 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 h-11">
            {navLinks.map(({ href, label }) => {
              const isActive = href === '/' ? localePathname === '/' : localePathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href as never}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'text-brand-crimson'
                      : 'text-gray-600 dark:text-gray-300 hover:text-brand-crimson hover:bg-white/60 dark:hover:bg-gray-800'
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile search bar */}
      <div className="md:hidden px-4 pb-3">
        <SearchBar />
      </div>

      {/* Mobile expanded menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-brand-cream-dark dark:border-gray-800 bg-brand-cream dark:bg-gray-950 px-4 py-3 space-y-1">
          <Link href="/" className="block py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-brand-crimson border-b border-gray-100 dark:border-gray-800" onClick={() => setMobileMenuOpen(false)}>{t('nav.home')}</Link>
          <Link href="/community" className="block py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-brand-crimson border-b border-gray-100 dark:border-gray-800" onClick={() => setMobileMenuOpen(false)}>{t('nav.community')}</Link>
          <Link href="/tools" className="block py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-brand-crimson border-b border-gray-100 dark:border-gray-800" onClick={() => setMobileMenuOpen(false)}>{t('nav.tools')}</Link>
          {/* Language */}
          <div className="flex gap-3 pt-2">
            {locales.map((l) => (
              <button key={l.code} onClick={() => { switchLocale(l.code); setMobileMenuOpen(false); }}
                className={cn('text-sm', locale === l.code ? 'text-brand-crimson font-bold' : 'text-gray-500')}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
