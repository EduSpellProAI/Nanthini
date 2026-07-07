import type { Metadata } from 'next';
import '../globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'EduSpell Pro AI',
  description: 'Premium AI learning experiences for schools, teachers, parents, and students.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(58,134,255,0.1),_transparent_35%),linear-gradient(135deg,_#f7fbff_0%,_#eef7ff_100%)]">
          <Header />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
