import TopHeader from "../components/TopHeader";
import MainHeader from "../components/MainHeader";
import HeadlineTicker from "../components/HeadlineTicker";
import HeroSlider from "../components/HeroSlider";

import ProductsSection from "../components/ProductsSection";
import DietitianSection from "../components/DietitianSection";
import BlogRecipesSection from "../components/BlogRecipesSection";
import AboutSection from "../components/AboutSection";
import ContactSection from "../components/ContactSection";
import Chatbot from "@/components/FloatingChatbot";

import FooterSection from "../components/FooterSection";

import CertificationSection from "@/components/CertificationSection";

export default function Home() {
  return (
    <div className="relative">
     

      {/* Hero / Slider */}
      <HeroSlider />
 {/* Certifications Section */}
      <section id="certifications">
        <CertificationSection />
      </section>
      {/* Products Section */}
      <section id="products">
        <ProductsSection />
      </section>

      {/* Dietitian Section */}
      <section id="dietician">
        <DietitianSection />
      </section>

      {/* Blog / Recipes Section */}
      <section id="blog-recipes">
        <BlogRecipesSection />
      </section>

      {/* About Section */}
      <section id="about-us">
        <AboutSection />
      </section>

     

      {/* Contact Section */}
      <section id="contact-us">
        <ContactSection />
      </section>

     

      {/* Floating Chatbot – now properly floating on every page */}
      <Chatbot />
    </div>
  );
}
