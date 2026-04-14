"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function StoresPage() {
  const [allStores, setAllStores] = useState([]);
  const [groupedStores, setGroupedStores] = useState({});
  const [filteredGroupedStores, setFilteredGroupedStores] = useState({});
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("All");
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});

  const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';

  const getStoreImageUrl = (storeImage) => {
    if (!storeImage) return null;
    if (storeImage.startsWith('http')) return storeImage;
    if (storeImage.includes('/') || storeImage.match(/^v\d+/)) {
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${storeImage}`;
    }
    return `${process.env.NEXT_PUBLIC_API_URL}/uploads/${storeImage}`;
  };

  // Sort groups A-Z by store name (ignoring Al/The/A prefix)
  const sortGroupsAZ = (groups) => {
    return Object.values(groups).sort((a, b) => {
      const nameA = a.storeName.replace(/^(Al|The|A)\s+/i, '').toLowerCase().trim();
      const nameB = b.storeName.replace(/^(Al|The|A)\s+/i, '').toLowerCase().trim();
      return nameA.localeCompare(nameB);
    });
  };

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stores`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        const storesArray = Array.isArray(data) ? data : [];
        setAllStores(storesArray);

        const citySet = new Map();
        storesArray.forEach(store => {
          const raw = (store.City || store.city || '').trim();
          if (!raw) return;
          const key = raw.toLowerCase();
          if (!citySet.has(key)) citySet.set(key, raw);
        });

        const uniqueCities = [...citySet.values()].sort((a, b) => a.localeCompare(b));
        setCities(["All", ...uniqueCities]);

        const grouped = storesArray.reduce((acc, store) => {
          const storeName = (store["Store Name"] || store.store_name || '').trim();
          const city = (store.City || store.city || '').trim();
          if (!storeName || !city) return acc;
          const key = `${storeName.toLowerCase()}-${city.toLowerCase()}`;
          if (!acc[key]) {
            acc[key] = { storeName, city, storeImage: store.store_image, branches: [] };
          }
          acc[key].branches.push({
            Branch: store.Branch || store.branch_name || "Main Branch",
            Address: store.Address || store.address || "",
            PhoneNumber: store["Phone Number"] || store.phone || "",
          });
          return acc;
        }, {});

        setGroupedStores(grouped);
        setFilteredGroupedStores(grouped);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch stores:", err);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (selectedCity === "All") {
      setFilteredGroupedStores(groupedStores);
    } else {
      const filtered = Object.entries(groupedStores).reduce((acc, [key, group]) => {
        if (group.city.toLowerCase() === selectedCity.toLowerCase()) {
          acc[key] = group;
        }
        return acc;
      }, {});
      setFilteredGroupedStores(filtered);
    }
  }, [selectedCity, groupedStores]);

  const getFallbackLogo = (storeName) => {
    if (!storeName || typeof storeName !== "string") return null;
    const logoMap = {
      "Al Rehman Mart": "/Al Rehman Mart.png",
      "Bajwa Shopping Mart": "/bajwa.jpeg",
      "Bin Saed Cash & Carry": "/bin saed.webp",
      "Blazon Diagnostic/Surgical": "/blazon.png",
      "Decent Departmental Store": "/Decent Store Logo.jpeg",
      "Falcon Grand Mart": "/falcon.jpeg",
      "Haji Afzal Karyana Store": "/hajiafzal.jpeg",
      "Irfan Brothers General Varieties": "/irfanb.png",
      "Ihsan General Store": "/ihsangeneral.jpeg",
      "Punjab Cash & Carry": "/Punjab cash and carry.png",
      "Risen Cash & Carry": "/Risen Store Logo.png",
      "Rahim Store": "/Rahim Store Logo.jpg",
      "Rainbow Cash & Carry": "/Rainbow Store Logo.jpeg",
      "Rubaika Cash & Carry": "/Rubaika Store Logo.png",
      "Swera Departmental Store": "/Swera Store Logo.jpeg",
      "KK Mart": "/Layer_4.jpg",
      "Victoria Departmental Store": "/Victoria Store Logo.jpeg",
      "Lala Bakery": "/lala bakery.jpeg",
      "Royal Departmental Store": "/royaldep.jpeg",
      "Servaid Pharmacy": "/servaid.png",
      "Zain General Store": "/zain.jpeg",
      "Umer Usama Shopping Mall": "/umermall.jpeg",
      "Heaven Mart": "/heaven mart.webp",
    };
    if (logoMap[storeName]) return logoMap[storeName];
    const storeLower = storeName.toLowerCase();
    for (const [key, path] of Object.entries(logoMap)) {
      if (storeLower.includes(key.toLowerCase())) return path;
    }
    return null;
  };

  const handleImageError = (storeName) => {
    setImageErrors((prev) => ({ ...prev, [storeName]: true }));
  };

  if (loading) return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }} className="flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-xl text-gray-600">Loading stores...</p>
      </div>
    </div>
  );

  const storeGroups = sortGroupsAZ(filteredGroupedStores);

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', color: '#1a1a1a' }}>
      <div className="px-4 py-8 max-w-7xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">
            Al Kissan Products Available At These Stores
          </h1>
          <p className="text-gray-600 text-lg">
            Find our premium quality products at trusted retailers
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200">
            <span className="text-green-700 font-semibold">
              Total Stores: {allStores.length}
            </span>
          </div>
        </div>

        {/* City Filter Buttons */}
        <div className="mb-10">
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {cities.map((city) => {
              const storeCount = city === "All"
                ? allStores.length
                : allStores.filter(s =>
                    (s.City || s.city || '').trim().toLowerCase() === city.toLowerCase()
                  ).length;
              return (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedCity === city
                      ? "bg-green-700 text-white shadow-md"
                      : "bg-green-100 text-green-800 hover:bg-green-200"
                  }`}
                >
                  {city} <span className="text-sm opacity-75">({storeCount})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stores List — A to Z, no extra labels */}
        {storeGroups.length > 0 ? (
          <div className="space-y-16">
            {storeGroups.map((storeGroup, index) => {
              const dbImageUrl = getStoreImageUrl(storeGroup.storeImage);
              const fallbackLogo = getFallbackLogo(storeGroup.storeName);
              const imageSource = dbImageUrl || fallbackLogo;
              const hasImageError = imageErrors[storeGroup.storeName];

              return (
                <div key={`${storeGroup.storeName}-${storeGroup.city}-${index}`}>
                  <div className="md:grid md:grid-cols-12 gap-8 items-start">

                    {/* LEFT — Store Info */}
                    <div className="md:col-span-7 space-y-6">
                      <div>
                        <h2 className="text-3xl font-bold text-gray-800">{storeGroup.storeName}</h2>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xl font-semibold text-gray-600">{storeGroup.city}</span>
                          <span className="inline-block px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">
                            {storeGroup.branches.length} branch{storeGroup.branches.length !== 1 ? "es" : ""}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {storeGroup.branches.map((branch, i) => (
                          <div key={i}>
                            <h4 className="text-lg font-semibold text-gray-800">
                              {branch.Branch || "Main Branch"}
                            </h4>
                            {branch.Address && <p className="text-gray-600">{branch.Address}</p>}
                            {branch.PhoneNumber && (
                              <p className="text-gray-600 font-medium">{branch.PhoneNumber}</p>
                            )}
                            {i < storeGroup.branches.length - 1 && (
                              <div className="mt-4 border-b border-gray-100" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* RIGHT — Logo */}
                    <div className="md:col-span-5 mt-8 md:mt-0 text-center">
                      <div className="relative inline-block">
                        <div className="absolute inset-0 bg-green-300 blur-lg opacity-30 rounded-full"></div>
                        <div
                          className="relative w-72 h-72 md:w-80 md:h-80 rounded-full border-8 border-white shadow-xl overflow-hidden flex items-center justify-center"
                          style={{ backgroundColor: '#f0fdf4' }}
                        >
                          {imageSource && !hasImageError ? (
                            <Image
                              src={imageSource}
                              alt={`${storeGroup.storeName} Logo`}
                              className="object-contain"
                              onError={() => handleImageError(storeGroup.storeName)}
                              priority={index < 2}
                              unoptimized={!!dbImageUrl}
                              fill
                              sizes="(max-width: 768px) 288px, 320px"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center w-full h-full">
                              <div className="text-6xl font-bold text-green-600">
                                {storeGroup.storeName?.charAt(0)}
                              </div>
                              <p className="font-semibold text-gray-600 text-center px-4">
                                {storeGroup.storeName}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="mt-6 text-gray-600">
                        Visit <span className="font-semibold text-green-700">{storeGroup.storeName}</span> in {storeGroup.city}
                      </p>
                    </div>
                  </div>

                  {index < storeGroups.length - 1 && (
                    <div className="mt-16 border-t border-gray-200" />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              No stores found{selectedCity !== "All" ? ` in ${selectedCity}` : ""}.
            </p>
          </div>
        )}
      </div>

      <style>{`
        body { background-color: #ffffff !important; }
      `}</style>
    </div>
  );
}
