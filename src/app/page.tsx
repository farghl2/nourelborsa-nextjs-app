import HeroSection from "@/components/features/landing-page/HeroSection";
import OurStorySection from "@/components/features/landing-page/OurStorySection";
import SearchSection from "@/components/features/landing-page/SearchSection";
import OurService from "@/components/features/landing-page/OurService";
import PricesPlanSection from "@/components/features/landing-page/PricesPlanSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <SearchSection /> 
      <PricesPlanSection />
      <OurStorySection />
      <OurService />
      
    </main>
  );
}
