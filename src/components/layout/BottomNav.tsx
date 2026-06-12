'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Home, LayoutGrid, Users, Shield, UserCircle } from 'lucide-react';

const navItems = [
  { href: '/',            icon: Home,        label: 'Home'       },
  { href: '/community',   icon: Users,       label: 'The Circle' },
  { href: '/tools',       icon: LayoutGrid,  label: 'Tools'      },
  { href: '/research',    icon: Shield,      label: 'The Vault'  },
  { href: '/profile',     icon: UserCircle,  label: 'Profile'    },
];

export function BottomNav() {
  useTranslations();
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 safe-area-pb">
      <div className="flex items-stretch h-16">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href as never}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative',
                isActive
                  ? 'text-brand-crimson'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              )}
            >
              {/* Active indicator pill */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-brand-crimson" />
              )}
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              <span className={cn(
                'text-[9px] leading-none font-medium tracking-tight',
                isActive ? 'text-brand-crimson' : 'text-gray-400 dark:text-gray-500'
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
