"use client";
import Image from "next/image";
import { useState } from "react";

export default function CertificationSection() {
  const certifications = [
    { logo: "/Punjab_Food_Authority_logo-removebg-preview.png", name: "Punjab Food Authority" },
    { logo: "/Hala Tag PNG.png", name: "Halal Certified" },
    
    { logo: "/Acerta ISO 22000+.png", name: "ISO 22000+" },
    { logo: "/Qarshi Lab.jpg", name: "Qarshi Labs" },
    { logo: "/Acerta ISO 22000.png", name: "ISO 22000" },
    { logo: "/Pakistan Standards Logo.png", name: "PSQCA" },
    { logo: "/Fortified Flour.png", name: "Fortified Flour" },
    { logo: "/Acerta ISO 9001.png", name: "ISO 9001:2015" },
    { logo: "/PCSIR Logo.png", name: "PCSIR Approved" },
    
  ];

  const [imgErrors, setImgErrors] = useState({});
  // repeat 4x for seamless infinite scroll
  const repeated = [
    ...certifications,
    ...certifications,
    ...certifications,
    ...certifications,
  ];

  return (
    <section className="w-full bg-white py-14 md:py-20 overflow-hidden">

      {/* TOP: Left Card + Single Ticker Row */}
      <div className="flex flex-col lg:flex-row items-center gap-0">

        {/* LEFT — Green Info Card */}
        <div className="lg:w-72 xl:w-80 flex-shrink-0 flex items-center justify-center px-6 lg:px-8 py-8 lg:py-0">
          <div
            className="w-full rounded-2xl p-7 flex flex-col justify-center"
            style={{
              background: "linear-gradient(135deg, #14532d 0%, #166534 60%, #15803d 100%)",
              boxShadow: "0 20px 60px rgba(20,83,45,0.25)",
              minHeight: "190px",
            }}
          >
            <div
              className="text-6xl xl:text-7xl font-bold text-white leading-none mb-1"
              style={{ fontFamily: "Georgia, serif" }}
            >
              5+
            </div>
            <div className="text-white font-semibold text-lg xl:text-xl leading-snug mb-3">
              Certificates
            </div>
            <div className="w-10 h-0.5 bg-green-400 mb-3" />
            <p className="text-green-100 text-sm leading-relaxed">
              From Global Regulatory Authorities
            </p>
          </div>
        </div>

        {/* RIGHT — Single Ticker Row: circles + name below */}
        <div className="flex-1 overflow-hidden py-4">
          <div className="relative">
            {/* Left fade */}
            <div
              className="absolute left-0 top-0 h-full w-16 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to right, #ffffff, transparent)" }}
            />
            {/* Right fade */}
            <div
              className="absolute right-0 top-0 h-full w-16 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to left, #ffffff, transparent)" }}
            />

            <div className="flex overflow-hidden">
              <div
                className="flex gap-8"
                style={{
                  animation: "scroll-ltr 40s linear infinite",
                  width: "max-content",
                }}
              >
                {repeated.map((cert, i) => (
                  <CertCircle
                    key={i}
                    cert={cert}
                    hasError={imgErrors[cert.name]}
                    onError={() => setImgErrors(p => ({ ...p, [cert.name]: true }))}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM — 4 Stat Boxes */}
      <div className="mt-12 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: (
                <span className="text-2xl font-bold text-green-600">✓</span>
              ),
              num: "100%",
              label: "Quality Compliance",
            },
            {
              icon: <span className="text-2xl">🌍</span>,
              num: "ISO",
              label: "International Standard",
            },
            {
              // Green crescent moon SVG instead of ☪️ emoji
              icon: (
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M14 4C10.134 4 7 7.134 7 11C7 14.866 10.134 18 14 18C15.393 18 16.69 17.594 17.78 16.9C16.11 16.613 14.6 15.77 13.46 14.54C11.94 12.9 11.1 10.76 11.1 8.5C11.1 6.9 11.54 5.41 12.3 4.13C12.87 4.046 13.43 4 14 4Z"
                    fill="#16a34a"
                  />
                  <circle cx="19" cy="9" r="2" fill="#16a34a" />
                </svg>
              ),
              num: "Halal",
              label: "Certified",
            },
            {
              icon: <span className="text-2xl">🛡️</span>,
              num: "24/7",
              label: "Safety Monitoring",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 text-center border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col items-center justify-center gap-1"
              style={{ background: "#f8faf8" }}
            >
              <div className="flex items-center justify-center h-8">{s.icon}</div>
              <div
                className="text-xl md:text-2xl font-bold text-green-700"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {s.num}
              </div>
              <div
                className="text-xs text-gray-500 tracking-wide uppercase"
                style={{ fontFamily: "system-ui" }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll-ltr {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}

/* Circle logo + name below */
function CertCircle({ cert, hasError, onError }) {
  return (
    <div className="flex flex-col items-center gap-2 flex-shrink-0 cursor-default group">
      {/* Circle */}
      <div
        className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white border-2 border-green-100 shadow-md flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-green-400 group-hover:shadow-lg group-hover:-translate-y-1"
      >
        {!hasError ? (
          <Image
            src={cert.logo}
            alt={cert.name}
            width={52}
            height={52}
            className="object-contain p-1.5"
            onError={onError}
          />
        ) : (
          <span className="text-green-700 text-sm font-bold">✓</span>
        )}
      </div>

      {/* Name below circle — FIXED: removed whitespace-nowrap, added proper wrapping */}
      <span
        className="text-xs text-gray-600 font-medium text-center leading-tight"
        style={{
          fontFamily: "system-ui, sans-serif",
          width: "80px",
          whiteSpace: "normal",
          wordBreak: "break-word",
          display: "block",
        }}
      >
        {cert.name}
      </span>
    </div>
  );
}
