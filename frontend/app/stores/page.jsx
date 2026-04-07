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

  // Cloudinary configuration
  const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';

  // Helper function to get image URL from database
  const getStoreImageUrl = (storeImage) => {
    if (!storeImage) return null;
    
    // If it's already a full URL
    if (storeImage.startsWith('http')) {
      return storeImage;
    }
    
    // If it's a Cloudinary public ID
    if (storeImage.includes('/') || storeImage.match(/^v\d+/)) {
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${storeImage}`;
    }
    
    // If it's a local file
    return `${process.env.NEXT_PUBLIC_API_URL}/uploads/${storeImage}`;
  };

  useEffect(() => {
    const controller = new AbortController();

   fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stores`,{ signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ API Response - Total records:", data.length);
        
        // Ensure data is array
        const storesArray = Array.isArray(data) ? data : [];
        console.log("✅ Total stores from API:", storesArray.length);
        
        // Log images to check if they're coming
        storesArray.slice(0, 3).forEach(store => {
          console.log(`📸 Store: ${store["Store Name"] || store.store_name}, Image:`, store.store_image);
        });
        
        // Store ALL stores
        setAllStores(storesArray);

        // Extract unique cities from ALL stores
        const uniqueCities = [...new Set(storesArray
          .map(store => store.City || store.city)
          .filter(city => city && city.trim() !== '')
        )].sort();
        
        console.log("✅ Unique cities found:", uniqueCities.length);
        setCities(["All", ...uniqueCities]);

        // Group stores by Store Name + City
        const grouped = storesArray.reduce((acc, store) => {
          const storeName = store["Store Name"] || store.store_name;
          const city = store.City || store.city;
          
          // Skip only if absolutely no name or city
          if (!storeName || !city) {
            console.warn("⚠️ Store missing name/city:", store);
            return acc;
          }

          const key = `${storeName}-${city}`;
          
          if (!acc[key]) {
            acc[key] = {
              storeName: storeName,
              city: city,
              storeImage: store.store_image, // Store image at group level
              branches: [],
            };
          }
          
          // Add branch with all data
          acc[key].branches.push({
            Branch: store.Branch || store.branch_name || "Main Branch",
            Address: store.Address || store.address || "",
            PhoneNumber: store["Phone Number"] || store.phone || "",
          });
          
          return acc;
        }, {});

        console.log("✅ Grouped stores count:", Object.keys(grouped).length);
        console.log("✅ Total branches across all groups:", storesArray.length);
        
        setGroupedStores(grouped);
        setFilteredGroupedStores(grouped);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("❌ Failed to fetch stores:", err);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  // Filter stores by city and sort alphabetically
  useEffect(() => {
    if (selectedCity === "All") {
      // Sort ALL groups alphabetically by store name
      const sortedGroups = Object.values(groupedStores).sort((a, b) => {
        const nameA = a.storeName.replace(/^(Al|The|A)\s+/i, '').toLowerCase();
        const nameB = b.storeName.replace(/^(Al|The|A)\s+/i, '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
      
      // Convert back to object with sorted order
      const sortedObj = {};
      sortedGroups.forEach(group => {
        const key = `${group.storeName}-${group.city}`;
        sortedObj[key] = group;
      });
      
      setFilteredGroupedStores(sortedObj);
    } else {
      // Filter by city and then sort
      const filtered = Object.values(groupedStores)
        .filter(group => group.city === selectedCity)
        .sort((a, b) => {
          const nameA = a.storeName.replace(/^(Al|The|A)\s+/i, '').toLowerCase();
          const nameB = b.storeName.replace(/^(Al|The|A)\s+/i, '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
      
      // Convert back to object
      const filteredObj = {};
      filtered.forEach(group => {
        const key = `${group.storeName}-${group.city}`;
        filteredObj[key] = group;
      });
      
      setFilteredGroupedStores(filteredObj);
    }
  }, [selectedCity, groupedStores]);

  // Map store names to their logos (fallback if no database image)
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
    console.log(`❌ Image error for store: ${storeName}`);
    setImageErrors((prev) => ({
      ...prev,
      [storeName]: true,
    }));
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
  };

  if (loading) return (
    <div className="text-center mt-10">
      <p className="text-xl">Loading stores... ({allStores.length} loaded)</p>
    </div>
  );

  // Convert filtered grouped stores to array for rendering
  const storeGroups = Object.values(filteredGroupedStores);
  
  // Calculate total branches being displayed
  const totalBranchesDisplayed = storeGroups.reduce((sum, group) => sum + group.branches.length, 0);

  console.log("📊 Final stats:", {
    totalStoresInDB: allStores.length,
    totalGroups: storeGroups.length,
    totalBranchesDisplayed: totalBranchesDisplayed,
    selectedCity: selectedCity
  });

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      {/* Heading */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">
          Al Kissan Products Available At These Stores
        </h1>
        <p className="text-gray-600 text-lg">
          Find our premium quality products at trusted retailers
        </p>
        
        {/* Total stores count */}
        <div className="mt-4 inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
          <span className="text-green-700 font-semibold">
            Total Stores: {allStores.length}
          </span>
        </div>
      </div>

      {/* City Filter Buttons */}
      <div className="mb-12">
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          {cities.map((city) => {
            // Count stores in this city
            const storeCount = city === "All" 
              ? allStores.length 
              : allStores.filter(s => (s.City || s.city) === city).length;
              
            return (
              <button
                key={city}
                onClick={() => handleCitySelect(city)}
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

      {/* Results Info */}
      <div className="mb-8 text-center">
        <p className="text-lg text-gray-700">
          Showing <span className="font-bold">{totalBranchesDisplayed}</span> store
          {totalBranchesDisplayed !== 1 ? "s" : ""} 
          {selectedCity !== "All" && ` in ${selectedCity}`}
        </p>
      </div>

      {/* Stores List */}
      {storeGroups.length > 0 ? (
        <div className="space-y-16">
          {storeGroups.map((storeGroup, index) => {
            // Get image from database (priority 1)
            const dbImageUrl = getStoreImageUrl(storeGroup.storeImage);
            
            // Get fallback logo (priority 2)
            const fallbackLogo = getFallbackLogo(storeGroup.storeName);
            
            // Determine which image to show: DB image > fallback logo > null
            const imageSource = dbImageUrl || fallbackLogo;
            const hasImageError = imageErrors[storeGroup.storeName];

            console.log(`🖼️ ${storeGroup.storeName}:`, {
              dbImage: storeGroup.storeImage,
              dbImageUrl,
              fallbackLogo,
              finalSource: imageSource
            });

            return (
              <div key={`${storeGroup.storeName}-${storeGroup.city}-${index}`}>
                <div className="md:grid md:grid-cols-12 gap-8 items-start">
                  {/* LEFT SIDE - Store Info */}
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

                  {/* RIGHT SIDE - Logo */}
                  <div className="md:col-span-5 mt-8 md:mt-0 text-center">
                    <div className="relative inline-block">
                      {/* Decorative blurred background */}
                      <div className="absolute inset-0 bg-green-300 blur-lg opacity-30 rounded-full"></div>

                      {/* Circular Image Container */}
                      <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-full bg-green-50 border-8 border-white shadow-xl overflow-hidden flex items-center justify-center">
                        {imageSource && !hasImageError ? (
                          <Image
                            src={imageSource}
                            alt={`${storeGroup.storeName} Logo`}
                            className="object-contain"
                            onError={() => handleImageError(storeGroup.storeName)}
                            priority={index < 2}
                            unoptimized={imageSource.startsWith('http')}
                            fill
                            sizes="(max-width: 768px) 288px, 320px"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center w-full h-full">
                            <div className="text-6xl font-bold text-green-600">
                              {storeGroup.storeName?.charAt(0)}
                            </div>
                            <p className="font-semibold text-gray-600 text-center">
                              {storeGroup.storeName}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Image source indicator */}
                    {dbImageUrl && !hasImageError && (
                      <p className="text-xs text-green-600 mt-2">
                      
                      </p>
                    )}
                    {!dbImageUrl && fallbackLogo && !hasImageError && (
                      <p className="text-xs text-blue-600 mt-2">
                      
                      </p>
                    )}

                    {/* Store info */}
                    <p className="mt-6 text-gray-600">
                      Visit{" "}
                      <span className="font-semibold text-green-700">{storeGroup.storeName}</span> in{" "}
                      {storeGroup.city}
                    </p>
                  </div>
                </div>

                {index < storeGroups.length - 1 && <div className="mt-16 border-t border-gray-200" />}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">
            No stores found in {selectedCity}. Try selecting a different city.
          </p>
        </div>
      )}
    </div>
  );
}
