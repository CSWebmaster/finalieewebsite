import React from 'react';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

type PageLayoutProps = {
  children: React.ReactNode;
  className?: string;
  showFooter?: boolean;
  hasHero?: boolean;
};

const FOOTER_ROUTES = ['/', '/contact'];

export default function PageLayout({
  children,
  className = '',
  showFooter = false,
  hasHero = false,
}: PageLayoutProps) {
  const { pathname } = useLocation();
  const shouldShowFooter = showFooter && FOOTER_ROUTES.includes(pathname);

  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden">
      <Navbar />
      <main className={cn(
        "flex-grow w-full",
        !hasHero && "pt-[72px] lg:pt-[80px]",
        className
      )}>
        {children}
      </main>
      {shouldShowFooter && <Footer />}
    </div>
  );
}
