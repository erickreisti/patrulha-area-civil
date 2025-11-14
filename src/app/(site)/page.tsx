// src/app/(site)/page.tsx
import { HeroSection } from "@/components/site/sections/HeroSection";
import { AboutSection } from "@/components/site/sections/AboutSection";
import { ServicesGrid } from "@/components/site/sections/ServicesGrid";
import { ActivitiesShowcase } from "@/components/site/sections/ActivitiesShowcase";
import { NewsSection } from "@/components/site/sections/NewsSection";
import { GalleryShowcase } from "@/components/site/sections/GalleryShowcase";
import { CTASection } from "@/components/site/sections/CTASection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ServicesGrid />
      <ActivitiesShowcase />
      <NewsSection />
      <GalleryShowcase />
      <CTASection />
    </>
  );
}
