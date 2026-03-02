"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FaWhatsapp, FaArrowRight } from "react-icons/fa";

import slide1 from "../assets/slide1.png";
import slide2 from "../assets/slide2.png";
import slide3 from "../assets/slide3.png";
import slide4 from "../assets/slide4.png";

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHoveringExplore, setIsHoveringExplore] = useState(false);
  const [isHoveringWhatsapp, setIsHoveringWhatsapp] = useState(false);

  const slides = [
    { img: slide1, text: "Al Kissan Multigrain Flour 2.5KG" },
    { img: slide2, text: "Al Kissan Gluten Free Flour 2KG" },
    { img: slide3, text: "Al Kissan Barley Flour 1KG" },
    { img: slide4, text: "Al Kissan Multigrain Flour 5KG" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // ✅ FIXED: Scroll to Products Section
  const scrollToProducts = () => {
    console.log("🔍 Searching for products section...");
    
    // Try multiple possible IDs
    const productsSection = 
      document.getElementById('products') || 
      document.getElementById('products-section') || 
      document.querySelector('#products');
    
    if (productsSection) {
      console.log("✅ Products section found, scrolling...");
      productsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      console.log("❌ Products section not found with ID 'products'");
      
      // Backup: Search for any element with ProductsSection
      const allSections = document.querySelectorAll('section');
      for (let section of allSections) {
        if (section.id === 'products' || section.id === 'products-section') {
          section.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
      
      // If still not found, try scrolling to bottom
      console.log("⚠️ Products section not found, scrolling to bottom");
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Hello Al Kissan Foods! I would like to know more about your products.");
    window.open(`https://wa.me/923004809083?text=${message}`, '_blank');
  };

  return (
    <div className="px-8 md:px-16 pt-6 pb-4 flex flex-col md:flex-row justify-between items-center gap-6 min-h-[80vh] bg-white dark:bg-white">
      
      {/* Image Slider */}
      <div className="w-full md:w-1/2 relative h-80 md:h-[32rem] overflow-hidden group">
        <Image
          src={slides[currentSlide].img}
          alt="slide"
          fill
          className="object-contain duration-1000 transition-transform group-hover:scale-105"
        />
        
        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-green-600 w-8' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Text + Buttons */}
      <div className="flex-1 space-y-6 md:space-y-8">
        <div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-green-800 font-['Playfair_Display'] leading-tight tracking-tight">
            {slides[currentSlide].text}
          </h2>

          <p className="mt-4 md:mt-6 text-gray-700 text-lg md:text-xl lg:text-2xl font-light italic border-l-4 border-green-500 pl-4 font-['Merriweather']">
            Live Natural, Eat Natural, Stay Healthy
          </p>
        </div>

        {/* Buttons Container */}
        <div className="flex flex-wrap gap-4 md:gap-6 items-center">
          {/* Explore Products Button - FIXED */}
          <button
            onClick={scrollToProducts}
            onMouseEnter={() => setIsHoveringExplore(true)}
            onMouseLeave={() => setIsHoveringExplore(false)}
            className="relative group/explore bg-gradient-to-r from-green-600 to-green-700 text-white py-3 md:py-4 px-6 md:px-8 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-green-200"
          >
            <span className="relative z-10 flex items-center gap-2 md:gap-3 text-base md:text-lg font-semibold font-['Inter']">
              Explore Products
              <FaArrowRight className={`transition-transform duration-300 ${isHoveringExplore ? 'translate-x-2' : ''}`} />
            </span>
            
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-green-800 opacity-0 group-hover/explore:opacity-100 transition-opacity duration-300"></div>
            
            {/* Shine Effect */}
            <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/explore:left-[200%] transition-all duration-1000"></div>
          </button>

          {/* Chat with Us Button */}
          <button
            onClick={handleWhatsAppClick}
            onMouseEnter={() => setIsHoveringWhatsapp(true)}
            onMouseLeave={() => setIsHoveringWhatsapp(false)}
            className="relative group/whatsapp bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white py-3 md:py-4 px-6 md:px-8 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-green-100"
          >
            <span className="relative z-10 flex items-center gap-2 md:gap-3 text-base md:text-lg font-semibold font-['Inter']">
              <FaWhatsapp className={`text-lg md:text-xl transition-transform duration-300 ${isHoveringWhatsapp ? 'scale-110' : ''}`} />
              Chat with Us
            </span>
            
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#128C7E] to-[#075E54] opacity-0 group-hover/whatsapp:opacity-100 transition-opacity duration-300"></div>
            
            {/* Pulse Effect */}
            <div className={`absolute inset-0 rounded-lg bg-[#25D366] opacity-0 ${isHoveringWhatsapp ? 'animate-ping' : ''}`}></div>
            
            {/* Shine Effect */}
            <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover/whatsapp:left-[200%] transition-all duration-1000"></div>
          </button>
        </div>
      </div>
    </div>
  );
}
