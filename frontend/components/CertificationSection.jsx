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
  
    { logo: "/Acerta ISO 9001.png", name: "ISO 9001:2015" },
    { logo: "/PCSIR Logo.png", name: "PCSIR Approved" },
  ];

  const [imgErrors, setImgErrors] = useState({});
  const repeated = [
    ...certifications,
    ...certifications,
    ...certifications,
    ...certifications,
  ];

  return (
    <section className="w-full bg-white py-14 md:py-20 overflow-hidden">

      {/* TOP: Left Card + Single Ticker Row */}
      <div className="flex flex-row items-center gap-0">

        {/* LEFT — Green Info Card */}
        <div
          className="flex-shrink-0 flex items-center justify-center py-6 lg:py-0 px-4 lg:px-8"
          style={{ width: "clamp(110px, 30vw, 320px)" }}
        >
          <div
            className="w-full rounded-2xl flex flex-col justify-center"
            style={{
              background: "linear-gradient(135deg, #14532d 0%, #166534 60%, #15803d 100%)",
              boxShadow: "0 20px 60px rgba(20,83,45,0.25)",
              minHeight: "clamp(120px, 20vw, 190px)",
              padding: "clamp(0.75rem, 3vw, 1.75rem)",
            }}
          >
            <div
              className="font-bold text-white leading-none mb-1"
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "clamp(1.8rem, 7vw, 4.5rem)",
              }}
            >
              5+
            </div>
            <div
              className="text-white font-semibold leading-snug mb-2"
              style={{ fontSize: "clamp(0.65rem, 2.2vw, 1.1rem)" }}
            >
              Certificates
            </div>
            <div className="bg-green-400 mb-2" style={{ width: "2rem", height: "2px" }} />
            <p
              className="text-green-100 leading-relaxed"
              style={{ fontSize: "clamp(0.6rem, 1.8vw, 0.875rem)" }}
            >
              From Global Regulatory Authorities
            </p>
          </div>
        </div>

        {/* RIGHT — Single Ticker Row */}
        <div className="flex-1 overflow-hidden py-4">
          <div className="relative">
            {/* Left fade */}
            <div
              className="absolute left-0 top-0 h-full w-12 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to right, #ffffff, transparent)" }}
            />
            {/* Right fade */}
            <div
              className="absolute right-0 top-0 h-full w-12 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to left, #ffffff, transparent)" }}
            />

            <div className="flex overflow-hidden">
              <div
                className="flex"
                style={{
                  animation: "scroll-ltr 40s linear infinite",
                  width: "max-content",
                  gap: "clamp(1rem, 3vw, 2rem)",
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
      <div className="mt-10 px-4 md:px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            {
              icon: <span style={{ fontSize: "16px", fontWeight: "bold", color: "#15803d" }}>✓</span>,
              num: "100%",
              label: "Quality Compliance",
            },
            {
              icon: <span style={{ fontSize: "16px" }}>🌍</span>,
              num: "ISO",
              label: "International Standard",
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              icon: <span style={{ fontSize: "16px" }}>🛡️</span>,
              num: "24/7",
              label: "Safety Monitoring",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-2xl text-center border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col items-center justify-center gap-1"
              style={{ background: "#f8faf8", padding: "clamp(0.75rem, 2vw, 1.25rem)" }}
            >
              <div className="flex items-center justify-center" style={{ height: "1.5rem" }}>{s.icon}</div>
              <div
                className="font-bold text-green-700"
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "clamp(0.9rem, 3vw, 1.5rem)",
                }}
              >
                {s.num}
              </div>
              <div
                className="text-gray-500 tracking-wide uppercase"
                style={{
                  fontFamily: "system-ui",
                  fontSize: "clamp(0.55rem, 1.5vw, 0.75rem)",
                }}
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
    <div className="flex flex-col items-center flex-shrink-0 cursor-default group" style={{ gap: "6px" }}>
      {/* Circle */}
      <div
        className="rounded-full bg-white border-2 border-green-100 shadow-md flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-green-400 group-hover:shadow-lg group-hover:-translate-y-1"
        style={{
          width: "clamp(2.8rem, 8vw, 5rem)",
          height: "clamp(2.8rem, 8vw, 5rem)",
        }}
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

      {/* Name below circle */}
      <span
        className="text-gray-600 font-medium text-center leading-tight"
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: "clamp(0.55rem, 1.5vw, 0.75rem)",
          width: "clamp(55px, 8vw, 80px)",
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
