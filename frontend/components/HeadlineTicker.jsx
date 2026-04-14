"use client";
import Image from "next/image";
import { FaMapMarkerAlt, FaStore } from "react-icons/fa";
import { useEffect, useState } from "react";

const PRIMARY_BLUE = "rgba(23, 47, 132, 0.89)";

export default function HeadlineTicker() {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        setError("");

        // ✅ FIX: localhost hata ke env variable use karo
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stores`);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        if (!data || data.length === 0) {
          setStores(getFallbackStores());
          return;
        }

        const uniqueStores = [];
        const storeKeys = new Set();

        data.forEach(store => {
          const storeName = store.store_name?.trim() || "";
          const branchName = store.branch_name?.trim() || store.Branch?.trim() || "Main";
          const uniqueKey = `${storeName.toLowerCase()}|${branchName.toLowerCase()}`;

          if (!storeName || storeKeys.has(uniqueKey)) return;

          storeKeys.add(uniqueKey);
          uniqueStores.push(store);
        });

        const formattedStores = uniqueStores.map(store => {
          const branchName = store.branch_name || store.Branch || "";
          const storeName = store.store_name || "Store";

          let displayName = storeName;
          if (branchName && branchName !== "Main" && branchName !== "main") {
            displayName = `${storeName} (${branchName})`;
          }

          return {
            id: store.id,
            text: `Available At ${displayName}`,
            logo: store.store_image || "/placeholder-store.png",
            storeName: displayName,
            originalName: storeName,
            branch: branchName,
            city: store.city,
          };
        });

        setStores(formattedStores);

      } catch (err) {
        console.error("❌ Error fetching stores:", err);
        setError(err.message);
        setStores(getFallbackStores());
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  const getFallbackStores = () => [
    { id: 1, text: "Available At Risen Cash & Carry", logo: "/Risen Store Logo.png", storeName: "Risen Cash & Carry" },
    { id: 2, text: "Available At Rainbow Cash & Carry", logo: "/Rainbow Store Logo.jpeg", storeName: "Rainbow Cash & Carry" },
    { id: 3, text: "Available At Victoria Departmental Store", logo: "/Victoria Store Logo.jpeg", storeName: "Victoria Departmental Store" },
    { id: 4, text: "Available At Swera Departmental Store", logo: "/Swera Store Logo.jpeg", storeName: "Swera Departmental Store" },
    { id: 5, text: "Available At Rubaika Cash & Carry", logo: "/Rubaika Store Logo.png", storeName: "Rubaika Cash & Carry" },
  ];

  const handleImageError = (storeId) => {
    setImageErrors(prev => ({ ...prev, [storeId]: true }));
  };

  const validStores = stores.filter(store => {
    if (!imageErrors[store.id]) return true;
    return store.logo.startsWith("/");
  });

  const scrollingHeadlines = validStores.length > 0
    ? [...validStores, ...validStores, ...validStores]
    : [...getFallbackStores(), ...getFallbackStores(), ...getFallbackStores()];

  if (loading) {
    return (
      <div className="w-full border-y border-blue-100 bg-white">
        <div className="flex items-center justify-center py-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-sm text-gray-600">Loading stores...</span>
        </div>
      </div>
    );
  }

  if (error && stores.length === 0) {
    return (
      <div className="w-full border-y border-blue-100 bg-white">
        <div className="flex items-center justify-center py-3 gap-3">
          <span className="text-sm text-red-500">⚠️ {error}</span>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative overflow-hidden border-y border-blue-100 bg-white">
      <div className="flex flex-col md:flex-row">
        {/* Left side */}
        <div className="hidden md:flex items-center px-6 py-3 bg-gradient-to-r from-blue-50 to-white border-r border-blue-100">
          <div className="flex items-center gap-2">
            <FaStore className="text-lg" style={{ color: PRIMARY_BLUE }} />
            <span className="font-semibold text-gray-800 whitespace-nowrap">Available At</span>
          </div>
        </div>

        {/* Scrolling ticker */}
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center h-full">
            <div className="flex animate-scroll-extremely-slow">
              {scrollingHeadlines.map((headline, idx) => (
                <div
                  key={`${headline.id}-${idx}`}
                  className="flex items-center justify-center gap-3 md:gap-4 px-4 md:px-8 py-3 whitespace-nowrap"
                >
                  <div className="relative h-5 w-12 md:h-6 md:w-16">
                    {!imageErrors[headline.id] ? (
                      <Image
                        src={headline.logo}
                        alt={headline.storeName}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 48px, 64px"
                        onError={() => handleImageError(headline.id)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
                        <FaStore className="text-gray-400 text-sm" />
                      </div>
                    )}
                  </div>

                  <span className="font-medium text-xs md:text-sm lg:text-base" style={{ color: PRIMARY_BLUE }}>
                    {headline.storeName}
                  </span>

                  <div className="h-4 w-px bg-blue-200"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Find Store Button */}
        <div className="flex items-center justify-center md:justify-start px-2 py-2 md:px-4 md:py-0 border-t md:border-t-0 border-blue-100">
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm md:text-base text-white hover:shadow-lg transition-all duration-300 whitespace-nowrap animate-pulse-slow relative overflow-hidden group
              ${isHovered ? "ring-2 ring-white ring-offset-2 ring-offset-blue-600" : ""}`}
            style={{ backgroundColor: PRIMARY_BLUE }}
            onClick={() => (window.location.href = "/find-nearest-store")}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <FaMapMarkerAlt className="text-sm animate-bounce-slow" />
            <span>Find Store Near You</span>
            {mounted && isMobile && (
              <svg className="ml-1 animate-bounce-vertical" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-extremely-slow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-scroll-extremely-slow {
          animation: scroll-extremely-slow 200s linear infinite;
          display: flex;
          width: fit-content;
        }
        .animate-scroll-extremely-slow:hover {
          animation-play-state: paused;
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-bounce-vertical {
          animation: bounce-vertical 1.5s ease-in-out infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(1.02); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes bounce-vertical {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(3px); }
        }
        @media (max-width: 768px) {
          .animate-scroll-extremely-slow {
            animation: scroll-extremely-slow 160s linear infinite;
          }
        }
        @media (max-width: 480px) {
          .animate-scroll-extremely-slow {
            animation: scroll-extremely-slow 130s linear infinite;
          }
        }
      `}</style>
    </div>
  );
}
