import HeroSection from "@/components/features/landing-page/HeroSection";import SearchSection from "@/components/features/landing-page/SearchSection";
import OurService from "@/components/features/landing-page/OurService";

import FaqSection from "@/components/features/landing-page/FagSection";
import AboutUs from "@/components/features/landing-page/AboutUs";

export default function Home() {
  return (
    <main>
      {/* <HeroSection /> */}
      <SearchSection /> 
      <AboutUs />
      <OurService />
      <FaqSection />
      
    </main>
  );
}
