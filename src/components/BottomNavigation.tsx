'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Settings, ShoppingCart } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { label: 'Главная', href: '/', icon: Home },
  { label: 'Покупки', href: '/shopping', icon: ShoppingCart },
  { label: 'Семья', href: '/family', icon: Users },
  { label: 'Настройки', href: '/settings', icon: Settings },
];

export function BottomNavigation() {
  const pathname = usePathname();

  // Don't show navigation on auth pages
  if (pathname.startsWith('/auth') || pathname === '/family-setup') {
    return null;
  }

  return (
    <nav className="fixed bottom-0 w-full max-w-md bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-brand-violet" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
