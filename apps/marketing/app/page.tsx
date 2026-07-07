import { HeroSection } from '@/components/sections/HeroSection';
import { ProductOverview } from '@/components/sections/ProductOverview';
import { AIFeatures } from '@/components/sections/AIFeatures';
import { DemoSection } from '@/components/sections/DemoSection';
import { Testimonials } from '@/components/sections/Testimonials';
import { PricingSection } from '@/components/sections/PricingSection';
import { StatsSection } from '@/components/sections/StatsSection';
import { CTASection } from '@/components/sections/CTASection';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <ProductOverview />
      <AIFeatures />
      <DemoSection />
      <Testimonials />
      <PricingSection />
      <StatsSection />
      <CTASection />
    </main>
  );
}
