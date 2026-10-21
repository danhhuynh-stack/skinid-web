'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, Store, MessageCircle, User } from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Trang chủ', icon: Home },
    { href: '/phan-tich-da', label: 'Skin AI', icon: Sparkles, isHighlight: true },
    { href: '/san-pham', label: 'Cửa hàng', icon: Store },
    { href: siteConfig.zaloUrl, label: 'Tư vấn', icon: MessageCircle, isExternal: true },
    { href: '/tai-khoan', label: 'Hồ sơ', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-brand-petal/30 shadow-lg px-2 py-1.5">
      <div className="flex items-center justify-around">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isHighlight) {
            return (
              <Link
                key={index}
                href={item.href}
                className="flex flex-col items-center justify-center relative -top-3"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-pink to-brand-pink-bright text-white flex items-center justify-center shadow-pink-glow ring-4 ring-white active:scale-90 transition-transform">
                  <Icon className="w-6 h-6 animate-pulse" />
                </div>
                <span className="text-[10px] font-semibold text-brand-pink mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          }

          if (item.isExternal) {
            return (
              <a
                key={index}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center py-1 px-2 text-brand-muted hover:text-brand-pink transition-colors"
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </a>
            );
          }

          return (
            <Link
              key={index}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2 transition-colors ${
                isActive ? 'text-brand-pink font-semibold' : 'text-brand-muted hover:text-brand-espresso'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
