import dynamic from "next/dynamic";
import HeroSection from "@/components/Landing/HeroSection";
import AboutSection from "@/components/Landing/AboutSection";
import Features from "@/components/Landing/Features";
import Testimonials from "@/components/Landing/Testimonials";
import Contact from "@/components/Landing/Contact";
import Footer from "@/components/Landing/Footer";

// Dynamic import for components that use Clerk hooks to avoid SSR issues
const FloatingNavbar = dynamic(() => import("@/components/Landing/FloatingNavbar"), {
  ssr: false,
  loading: () => <div className="h-16" /> // Placeholder to prevent layout shift
});

const Landing = () => {
  return (
    <>
      <FloatingNavbar />
      <HeroSection />
      <AboutSection />
      <Features />
      <Testimonials />
      <Contact /> 
      <Footer />
    </>
  );
};

export default Landing;