import AboutHeaderSection from "./about/AboutHeaderSection";
import MetricsSection from "./about/MetricsSection";
import PipelineSection from "./about/PipelineSection";
import ModelDetailsSection from "./about/ModelDetailsSection";
import CapabilitiesSection from "./about/CapabilitiesSection";
import TechStackSection from "./about/TechStackSection";
import AboutCtaSection from "./about/AboutCtaSection";
import FooterNoteSection from "./about/FooterNoteSection";
import BackgroundGrid from "./ui/BackgroundGrid";
import GlowEffect from "./ui/GlowEffect";

const About = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 md:px-8 lg:px-10 relative overflow-hidden bg-oil-black">
      <GlowEffect
        color="blue"
        size="lg"
        position={{ bottom: "10rem", right: "2.5rem" }}
        blur={120}
        opacity={5}
      />
      <BackgroundGrid opacity={20} />

      <div className="max-w-6xl mx-auto relative z-10">
        <AboutHeaderSection />
        <MetricsSection />
        <PipelineSection />
        <ModelDetailsSection />
        <CapabilitiesSection />
        <TechStackSection />
        <AboutCtaSection />
        <FooterNoteSection />
      </div>
    </div>
  );
};

export default About;
