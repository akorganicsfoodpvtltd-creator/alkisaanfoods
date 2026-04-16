"use client";

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
              style={{ fontFamily: "Georgia, serif", fontSize: "clamp(1.8rem, 7vw, 4.5rem)" }}
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
            <div
              className="absolute left-0 top-0 h-full w-12 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to right, #ffffff, transparent)" }}
            />
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
            { imgSrc: "/stat-quality.png", imgAlt: "100% Quality", num: "100%", label: "Quality Compliance" },
            { imgSrc: "/stat-iso.png", imgAlt: "ISO International Standard", num: "ISO", label: "International Standard" },
            { imgSrc: "/stat-halal.png", imgAlt: "Halal Certified", num: "Halal", label: "Certified" },
            { imgSrc: "/stat-24-7.png", imgAlt: "24/7 Safety Monitoring", num: "24/7", label: "Safety Monitoring" },
          ].map((s, i) => (
            <StatCard key={i} {...s} />
          ))}
        </div>
      </div>

      {/* BOTTOM 2 — 4 Trust Cards */}
      <div className="mt-4 px-4 md:px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { imgSrc: "/trust-cod.png", imgAlt: "Cash on Delivery", num: "Cash on Delivery", label: "All Over Pakistan", desc: "Order now, pay when it arrives at your door" },
            { imgSrc: "/trust-fast-delivery.png", imgAlt: "Fast Delivery", num: "Fast Delivery", label: "Nationwide Shipping", desc: "Swift & reliable delivery to your doorstep" },
            { imgSrc: "/trust-happy-customers.png", imgAlt: "Happy Customers", num: "100,000+", label: "Happy Customers", desc: "Thousands of satisfied customers across Pakistan" },
            { imgSrc: "/trust-14-days.png", imgAlt: "14 Days Easy Return", num: "14 Days", label: "Happiness Guarantee", desc: "Not satisfied? Full money back, no questions asked" },
          ].map((s, i) => (
            <TrustCard key={i} {...s} />
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

/* ── Stat Box ── */
function StatCard({ imgSrc, imgAlt, num, label }) {
  const [error, setError] = useState(false);

  return (
    <div
      className="rounded-2xl text-center border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col items-center justify-center gap-2"
      style={{
        background: "#ffffff",
        padding: "clamp(1rem, 2.5vw, 1.5rem)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      {/* Image wrapper — white bg, no mismatch */}
      <div
        className="flex items-center justify-center rounded-xl"
        style={{
          width: "clamp(3rem, 8vw, 4.5rem)",
          height: "clamp(3rem, 8vw, 4.5rem)",
          background: "#ffffff",
          border: "1.5px solid #e5e7eb",
          padding: "0.4rem",
        }}
      >
        {!error ? (
          <img
            src={imgSrc}
            alt={imgAlt}
            onError={() => setError(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        ) : (
          <span style={{ fontSize: "1.8rem" }}>✅</span>
        )}
      </div>

      <div
        className="font-bold text-green-700"
        style={{ fontFamily: "Georgia, serif", fontSize: "clamp(1rem, 3vw, 1.6rem)" }}
      >
        {num}
      </div>
      <div
        className="text-gray-500 tracking-wide uppercase"
        style={{ fontFamily: "system-ui", fontSize: "clamp(0.55rem, 1.5vw, 0.75rem)" }}
      >
        {label}
      </div>
    </div>
  );
}

/* ── Trust Card ── */
function TrustCard({ imgSrc, imgAlt, num, label, desc }) {
  const [error, setError] = useState(false);

  return (
    <div
      className="rounded-2xl text-center border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col items-center justify-center gap-2"
      style={{
        background: "#ffffff",
        padding: "clamp(1rem, 2.5vw, 1.5rem)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      {/* Image wrapper — white bg matches image background */}
      <div
        className="flex items-center justify-center rounded-xl"
        style={{
          width: "clamp(3rem, 8vw, 4.5rem)",
          height: "clamp(3rem, 8vw, 4.5rem)",
          background: "#ffffff",
          border: "1.5px solid #e5e7eb",
          padding: "0.4rem",
        }}
      >
        {!error ? (
          <img
            src={imgSrc}
            alt={imgAlt}
            onError={() => setError(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        ) : (
          <span style={{ fontSize: "1.8rem" }}>✅</span>
        )}
      </div>

      <div
        className="font-bold text-green-700"
        style={{ fontFamily: "Georgia, serif", fontSize: "clamp(0.8rem, 2.5vw, 1.1rem)" }}
      >
        {num}
      </div>
      <div
        className="text-gray-500 tracking-wide uppercase"
        style={{ fontFamily: "system-ui", fontSize: "clamp(0.55rem, 1.5vw, 0.75rem)" }}
      >
        {label}
      </div>
      <div
        className="text-gray-400 leading-snug"
        style={{ fontSize: "clamp(0.5rem, 1.4vw, 0.7rem)" }}
      >
        {desc}
      </div>
    </div>
  );
}

/* ── Cert Circle (ticker) ── */
function CertCircle({ cert, hasError, onError }) {
  return (
    <div className="flex flex-col items-center flex-shrink-0 cursor-default group" style={{ gap: "6px" }}>
      <div
        className="rounded-full bg-white border-2 border-green-100 shadow-md flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-green-400 group-hover:shadow-lg group-hover:-translate-y-1"
        style={{ width: "clamp(2.8rem, 8vw, 5rem)", height: "clamp(2.8rem, 8vw, 5rem)" }}
      >
        {!hasError ? (
          <img
            src={cert.logo}
            alt={cert.name}
            onError={onError}
            style={{ width: "75%", height: "75%", objectFit: "contain" }}
          />
        ) : (
          <span className="text-green-700 text-sm font-bold">✓</span>
        )}
      </div>
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
