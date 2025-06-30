import HeroSection from "@/components/Landing/HeroSection";
import AboutSection from "@/components/Landing/AboutSection";
import Features from "@/components/Landing/Features";
import Testimonials from "@/components/Landing/Testimonials";
import Contact from "@/components/Landing/Contact";
import Footer from "@/components/Landing/Footer";
import FloatingNavbar from "@/components/Landing/FloatingNavbar";

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