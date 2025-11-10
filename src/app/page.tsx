import HeroSection from "@/components/features/HeroSection";
import OurStorySection from "@/components/features/OurStorySection";
import SearchSection from "@/components/features/SearchSection";
import OurService from "@/components/features/OurService";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <SearchSection /> 
      <OurStorySection />
      {/* <OurService /> */}
    </main>
  );
}
