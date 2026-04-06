"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function CertificationSection() {
  const certifications = [
    { logo: "/Punjab_Food_Authority_logo-removebg-preview.png", name: "Punjab Food Authority Certified" },
    { logo: "/Hala Tag PNG.png", name: "Halal Certified" },
    { logo: "/Acerta ISO 9001.png", name: "ISO 9001:2015 Quality Management" },
    { logo: "/Acerta ISO 22000+.png", name: "ISO 22000+ Food Safety System" },
    { logo: "/Acerta ISO 22000.png", name: "ISO 22000 Food Safety Management" },
    { logo: "/Pakistan Standards Logo.png", name: "Pakistan Standards & Quality Control Authority" },
    { logo: "/Fortified Flour.png", name: "Fortified Flour Certification" }, // Fixed path
    { logo: "/PCSIR Logo.png", name: "PCSIR Laboratory Approved" },
    { logo: "/Qarshi Lab.jpg", name: "Qarshi Laboratories Approved" },
  ];

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [dimensions, setDimensions] = useState({
    isMobile: false,
    isTablet: false,
    radius: 200,
    circleSize: 500
  });

  // Responsive screen check and dimension calculation
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      
      // Calculate radius based on screen size
      let radius = 200;
      if (width < 640) radius = 100;
      else if (width < 768) radius = 130;
      else if (width < 1024) radius = 160;
      else radius = 200;

      // Calculate circle size based on screen size
      let circleSize = 500;
      if (width < 640) circleSize = 250;
      else if (width < 768) circleSize = 350;
      else if (width < 1024) circleSize = 400;
      else circleSize = 500;

      setDimensions({
        isMobile,
        isTablet,
        radius,
        circleSize
      });
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Circular rotation animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.2) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full py-8 md:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 md:-top-40 md:-right-40 w-40 h-40 md:w-80 md:h-80 bg-green-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 md:-bottom-40 md:-left-40 w-40 h-40 md:w-80 md:h-80 bg-emerald-100 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8 lg:mb-10 px-2 sm:px-4">
          <div className="inline-flex items-center justify-center gap-2 sm:gap-3 mb-3 md:mb-4">
            <div className="h-1 w-10 sm:w-16 md:w-20 bg-green-500 rounded-full"></div>
            <span className="text-green-600 font-semibold text-xs sm:text-sm uppercase tracking-wider sm:tracking-widest">
              Trusted Accreditations
            </span>
            <div className="h-1 w-10 sm:w-16 md:w-20 bg-green-500 rounded-full"></div>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-600 mb-3 md:mb-4">
            Certified <span className="text-green-600">By</span>
          </h2>

          <p className="text-gray-600 text-sm sm:text-base md:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed px-2">
            Our prestigious certifications validate our unwavering commitment to excellence, quality control, and international food safety standards.
          </p>
        </div>

        {/* Certification Circle */}
        <div className="relative w-full max-w-4xl mx-auto h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center mb-8 md:mb-10">
          {/* Rotating ring */}
          <div 
            className="absolute rounded-full border-2 border-green-200/50"
            style={{ 
              transform: `rotate(${rotation}deg)`,
              width: `${dimensions.circleSize}px`,
              height: `${dimensions.circleSize}px`
            }}
          >
            {Array.from({ length: 36 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 bg-green-400/40 rounded-full"
                style={{
                  left: `${50 + 50 * Math.cos((i * 10 * Math.PI) / 180)}%`,
                  top: `${50 + 50 * Math.sin((i * 10 * Math.PI) / 180)}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}
          </div>

          {/* Center Badge */}
          <div className="absolute z-30">
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full bg-green-600 shadow-xl md:shadow-2xl flex flex-col items-center justify-center p-4 relative">
              <div className="absolute -inset-2 sm:-inset-3 md:-inset-4 bg-gradient-to-r from-green-400/20 to-green-500/20 rounded-full blur-lg md:blur-xl"></div>
              <div className="text-center">
                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1">Certified</h3>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-white mt-1">By</p>
              </div>
            </div>
          </div>

          {/* Orbiting Certifications */}
          <div className="relative w-full h-full">
            {certifications.map((cert, index) => {
              const angle = (index / certifications.length) * 2 * Math.PI;
              const orbitX = Math.cos(angle + rotation * Math.PI / 180) * dimensions.radius;
              const orbitY = Math.sin(angle + rotation * Math.PI / 180) * dimensions.radius;

              // Determine image size based on screen size
              let imgSize = 64;
              if (dimensions.isMobile) imgSize = 32;
              else if (dimensions.isTablet) imgSize = 48;
              else imgSize = 56;

              // Determine container size
              let containerSize = dimensions.isMobile ? 'w-10 h-10' : dimensions.isTablet ? 'w-14 h-14' : 'w-20 h-20';

              return (
                <div
                  key={index}
                  className="absolute top-1/2 left-1/2 z-20"
                  style={{ transform: `translate(calc(-50% + ${orbitX}px), calc(-50% + ${orbitY}px))` }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className={`
                    relative ${containerSize}
                    rounded-full bg-white
                    shadow-lg md:shadow-xl border-2 sm:border-3 md:border-4 
                    transition-all duration-500 ease-out
                    ${hoveredIndex === index 
                      ? `scale-110 sm:scale-125 border-green-500 shadow-xl md:shadow-2xl shadow-green-300/50 z-40` 
                      : "border-green-100"
                    }
                    ${hoveredIndex !== null && hoveredIndex !== index ? "opacity-90" : "opacity-100"}
                    flex items-center justify-center cursor-pointer
                    overflow-hidden group
                  `}>
                    <div className={`
                      relative 
                      ${dimensions.isMobile ? 'w-8 h-8' : dimensions.isTablet ? 'w-10 h-10' : 'w-14 h-14 md:w-16 md:h-16'}
                      flex items-center justify-center
                    `}>
                      <Image
                        src={cert.logo}
                        alt={cert.name}
                        width={imgSize}
                        height={imgSize}
                        className={`object-contain p-1 transition-transform duration-300 ${hoveredIndex === index ? "scale-110" : "scale-100"}`}
                        onError={(e) => {
                          console.error(`Failed to load image: ${cert.logo}`);
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-green-100/0 to-emerald-100/0 transition-all duration-500 ${hoveredIndex === index ? "from-green-100/40 to-emerald-100/40" : ""}`}></div>
                  </div>
                  
                  {/* Tooltip on hover for larger screens */}
                  {hoveredIndex === index && !dimensions.isMobile && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50 shadow-lg">
                      {cert.name}
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quality Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-4xl mx-auto mt-6 md:mt-8 lg:mt-10 px-2 sm:px-0">
          {[
            { value: "5+", label: "International Certifications", icon: "🏆" },
            { value: "100%", label: "Quality Compliance", icon: "✓" },
            { value: "ISO", label: "Global Standards", icon: "🌍" },
            { value: "24/7", label: "Safety Monitoring", icon: "🛡️" }
          ].map((stat, index) => (
            <div 
              key={index}
              className="bg-gradient-to-br from-white to-green-50 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 text-center shadow-md sm:shadow-lg border border-green-100 hover:shadow-xl hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-500 group"
            >
              <div className="text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2 md:mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">{stat.icon}</div>
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-green-700 mb-1 group-hover:text-green-600 transition-colors duration-300">{stat.value}</div>
              <div className="text-xs sm:text-sm md:text-base text-gray-700 font-medium leading-tight">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}