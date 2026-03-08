import HeroSection from "./home/HeroSection";
import StatsSection from "./home/StatsSection";
import FeaturesSection from "./home/FeaturesSection";
import HowItWorksSection from "./home/HowItWorksSection";
import AudienceSection from "./home/AudienceSection";
import CtaSection from "./home/CtaSection";

const Home = () => {
  return (
    <div className="relative bg-oil-black overflow-hidden">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <AudienceSection />
      <CtaSection />
    </div>
  );
};

export default Home;
