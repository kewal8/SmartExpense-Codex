import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { MobileTopBar } from '@/components/layout/mobile-top-bar';
import { authOptions } from '@/lib/auth';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <div className="min-h-[100dvh] bg-[var(--bg-primary)]">
      <Sidebar />
      <MobileTopBar />
      <main id="main-content" className="mx-auto max-w-[960px] px-4 pb-[calc(env(safe-area-inset-bottom)+7rem)] pt-[calc(env(safe-area-inset-top)+0.5rem)] lg:ml-[300px] lg:px-6 lg:pb-8 lg:pt-4">
        <Header />
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
