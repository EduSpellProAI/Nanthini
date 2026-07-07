import type { Metadata } from 'next';
import '../globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileNavigation } from '@/components/layout/MobileNavigation';

export const metadata: Metadata = {
  title: 'EduSpell Pro AI | Parent',
  description: 'A modern parent portal for school communication and learning progress.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(58,134,255,0.12),_transparent_32%),linear-gradient(135deg,_#f7fbff_0%,_#eef7ff_100%)] p-4 sm:p-6 lg:p-8">
          <div className="mx-auto flex max-w-7xl gap-6">
            <Sidebar />
            <div className="flex-1 space-y-4">
              <Header />
              <MobileNavigation />
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
