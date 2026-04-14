"use client";

import { useEffect, useState } from "react";

export default function FindNearestStore() {
  const [branches, setBranches] = useState([]);
  const [nearestBranch, setNearestBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCoords, setManualCoords] = useState({ lat: '', lng: '' });
  const [locationPermission, setLocationPermission] = useState('prompt');
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' })
        .then((permissionStatus) => {
          setLocationPermission(permissionStatus.state);
          permissionStatus.onchange = () => {
            setLocationPermission(permissionStatus.state);
          };
        });
    }
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/stores`);
      if (!res.ok) throw new Error("Failed to fetch stores");
      
      const data = await res.json();
      console.log("📡 Backend Data:", data);
      
      if (!Array.isArray(data) || data.length === 0) {
        setError("No branches available from server.");
        return [];
      }

      console.log("📡 First branch structure:", data[0]);

      const normalizedBranches = data.map(branch => {
        const latitude = parseFloat(branch.latitude);
        const longitude = parseFloat(branch.longitude);
        
        console.log(`Processing branch: ${branch.store_name}, lat: ${latitude}, lng: ${longitude}`);
        
        return {
          id: branch.id || Math.random(),
          store_name: branch.store_name || "Unknown Store",
          address: branch.address || "",
          city: branch.city || "",
          phone: branch.phone || "",
          branch_type: branch.branch_name || "",
          store_image: branch.store_image || "",
          latitude: latitude,
          longitude: longitude,
          created_at: branch.created_at || ""
        };
      });

      const validBranches = normalizedBranches.filter(branch => {
        const isValid = !isNaN(branch.latitude) && 
                       !isNaN(branch.longitude) && 
                       branch.latitude !== null && 
                       branch.longitude !== null;
        if (!isValid) {
          console.warn("Invalid branch coordinates:", {
            name: branch.store_name,
            lat: branch.latitude,
            lng: branch.longitude
          });
        }
        return isValid;
      });

      console.log(`✅ Valid branches: ${validBranches.length} out of ${data.length}`);
      
      if (validBranches.length === 0) {
        setError("No branches with valid coordinates found. Please check database.");
      }
      
      return validBranches;

    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError("Failed to fetch stores. Please check backend connection.");
      return [];
    }
  };

  const calculateNearestStore = async (targetLat, targetLng) => {
    setLoading(true);
    setError("");

    try {
      const allBranches = await fetchBranches();
      
      if (allBranches.length === 0) {
        setError("No valid branches with coordinates found.");
        setLoading(false);
        return;
      }

      const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };

      const branchesWithDistance = allBranches.map(branch => ({
        ...branch,
        distance: calculateDistance(targetLat, targetLng, branch.latitude, branch.longitude)
      }));

      branchesWithDistance.sort((a, b) => a.distance - b.distance);
      
      setNearestBranch(branchesWithDistance[0]);
      setBranches(branchesWithDistance);

    } catch (err) {
      console.error("❌ Calculation error:", err);
      setError("Error calculating nearest store.");
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = (options = {}) => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error) => {
          let errorMessage = "Location access denied. ";
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += "Please enable location access in your browser settings or use manual input.";
              setLocationPermission('denied');
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage += "Location request timed out.";
              break;
            default:
              errorMessage += "An unknown error occurred.";
          }
          reject(new Error(errorMessage));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0, ...options }
      );
    });
  };

  const handleUseMyLocation = async () => {
    setLoading(true);
    setError("");
    
    try {
      const location = await getUserLocation();
      setUserLocation({ lat: location.latitude, lng: location.longitude });
      setManualCoords({ 
        lat: location.latitude.toString(), 
        lng: location.longitude.toString() 
      });
      setShowManualInput(false);
      setLocationPermission('granted');
      await calculateNearestStore(location.latitude, location.longitude);
    } catch (err) {
      setError(err.message);
      setShowManualInput(true);
      setLoading(false);
    }
  };

  const handleManualSearch = async () => {
    const lat = parseFloat(manualCoords.lat);
    const lng = parseFloat(manualCoords.lng);
    
    if (!manualCoords.lat || !manualCoords.lng) {
      setError("Please enter both latitude and longitude.");
      return;
    }
    if (isNaN(lat) || isNaN(lng)) {
      setError("Please enter valid numbers for coordinates.");
      return;
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError("Invalid coordinates range. Lat: -90 to 90, Lng: -180 to 180");
      return;
    }

    setUserLocation({ lat, lng });
    setLoading(true);
    await calculateNearestStore(lat, lng);
    setShowManualInput(false);
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        const fetchedBranches = await fetchBranches();
        setBranches(fetchedBranches);
        if (fetchedBranches.length === 0) {
          setError("No stores found in database.");
        } else {
          setError("Please enter your location or allow location access to find nearest store.");
        }
      } catch (err) {
        setError("Failed to load store data.");
      } finally {
        setLoading(false);
        setShowManualInput(true);
      }
    };
    initialize();
  }, []);

  const LocationIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const PhoneIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );

  if (loading) {
    return (
      <div
        className="min-h-[400px] flex items-center justify-center"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p style={{ color: "#4b5563" }}>Finding your nearest store...</p>
        </div>
      </div>
    );
  }

  return (
    // ✅ Force white background always — overrides dark mode
    <div style={{ backgroundColor: "#ffffff", minHeight: "100%" }}>
      <div className="max-w-2xl mx-auto p-4 md:p-6">

        {/* Main Header */}
        <div className="bg-gradient-to-r from-green-500 via-green-600 to-blue-600 text-white rounded-3xl shadow-2xl p-6 md:p-8 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <LocationIcon />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: "#dcfce7" }}>
                Find Nearest Store
              </h1>
              <p className="text-sm md:text-base" style={{ color: "#f0fdf4", opacity: 0.9 }}>
                Locate stores near you
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={handleUseMyLocation}
              disabled={locationPermission === 'denied'}
              className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                locationPermission === 'denied'
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-white hover:bg-green-50'
              }`}
              style={locationPermission !== 'denied' ? { color: "#16a34a" } : {}}
            >
              <span>📍</span>
              {locationPermission === 'denied' ? 'Location Blocked' : 'Use My Location'}
            </button>

            <button
              onClick={() => setShowManualInput(!showManualInput)}
              className="px-4 py-2 rounded-xl font-semibold hover:bg-green-500 transition-all"
              style={{ backgroundColor: "#4ade80", color: "#ffffff" }}
            >
              📍 Enter Location Manually
            </button>
          </div>

          {/* Manual Input */}
          {showManualInput && (
            <div className="p-4 rounded-xl mt-4" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
              <p className="font-semibold mb-3" style={{ color: "#dcfce7" }}>Enter coordinates:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm mb-1" style={{ color: "#f0fdf4" }}>Latitude</label>
                  <input
                    type="number"
                    placeholder="e.g., 31.5204"
                    value={manualCoords.lat}
                    onChange={(e) => setManualCoords({ ...manualCoords, lat: e.target.value })}
                    className="w-full p-3 rounded-xl focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(134,239,172,0.5)",
                      color: "#ffffff",
                    }}
                    step="any"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: "#f0fdf4" }}>Longitude</label>
                  <input
                    type="number"
                    placeholder="e.g., 74.3587"
                    value={manualCoords.lng}
                    onChange={(e) => setManualCoords({ ...manualCoords, lng: e.target.value })}
                    className="w-full p-3 rounded-xl focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(134,239,172,0.5)",
                      color: "#ffffff",
                    }}
                    step="any"
                  />
                </div>
              </div>
              <button
                onClick={handleManualSearch}
                className="w-full px-4 py-3 font-bold rounded-xl hover:bg-green-50 transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: "#ffffff", color: "#16a34a" }}
              >
                🔍 Search Nearest Store
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="mt-4 p-3 rounded-xl border"
              style={
                error.includes("denied")
                  ? { backgroundColor: "rgba(239,68,68,0.2)", borderColor: "rgba(248,113,113,0.6)" }
                  : { backgroundColor: "rgba(234,179,8,0.2)", borderColor: "rgba(250,204,21,0.6)" }
              }
            >
              <p style={{ color: error.includes("denied") ? "#fecaca" : "#fef08a" }}>{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {nearestBranch ? (
          <div className="space-y-6">

            {/* Nearest Store Card */}
            <div
              className="rounded-3xl shadow-2xl p-6 md:p-8 border"
              style={{ backgroundColor: "#ffffff", borderColor: "#f3f4f6" }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                  <div
                    className="inline-block px-4 py-1 rounded-full text-sm font-semibold mb-2"
                    style={{ backgroundColor: "#dcfce7", color: "#166534" }}
                  >
                    🎯 Nearest Store
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold" style={{ color: "#111827" }}>
                    {nearestBranch.store_name}
                  </h2>
                  <p className="text-sm mt-1" style={{ color: "#4b5563" }}>{nearestBranch.branch_type}</p>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-2xl md:text-3xl font-bold" style={{ color: "#16a34a" }}>
                    {nearestBranch.distance?.toFixed(1)} km
                  </div>
                  <div className="text-sm" style={{ color: "#6b7280" }}>Distance from you</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl" style={{ backgroundColor: "#f0fdf4" }}>
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}
                      >
                        <LocationIcon />
                      </div>
                      <div>
                        <p className="font-semibold mb-1" style={{ color: "#111827" }}>Address</p>
                        <p style={{ color: "#374151" }}>{nearestBranch.address}</p>
                        <p className="font-medium mt-1" style={{ color: "#15803d" }}>{nearestBranch.city}</p>
                      </div>
                    </div>
                  </div>

                  {nearestBranch.phone && (
                    <div className="p-4 rounded-2xl" style={{ backgroundColor: "#f0fdf4" }}>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}
                        >
                          <PhoneIcon />
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: "#111827" }}>Contact</p>
                          <p className="text-xl font-bold" style={{ color: "#16a34a" }}>{nearestBranch.phone}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Map Link */}
                <div
                  className="rounded-2xl p-6 border"
                  style={{ backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }}
                >
                  <h3 className="font-bold mb-4 text-lg" style={{ color: "#111827" }}>📍 View on Map</h3>
                  
                    href={`https://www.google.com/maps?q=${nearestBranch.latitude},${nearestBranch.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block font-bold py-3 px-4 rounded-xl text-center text-white transition-all duration-300 hover:-translate-y-1"
                    style={{ background: "linear-gradient(to right, #22c55e, #2563eb)" }}
                  >
                    Open in Google Maps
                  </a>
                  <p className="text-xs mt-3 text-center" style={{ color: "#6b7280" }}>
                    Coordinates: {nearestBranch.latitude?.toFixed(4)}, {nearestBranch.longitude?.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>

            {/* Other Nearby Stores */}
            {branches.length > 1 && (
              <div
                className="rounded-3xl shadow-xl p-6 md:p-8 border"
                style={{ backgroundColor: "#ffffff", borderColor: "#f3f4f6" }}
              >
                <h3 className="text-lg md:text-xl font-bold mb-4" style={{ color: "#111827" }}>
                  Other Nearby Stores
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {branches.slice(1, 4).map((branch, index) => (
                    <div
                      key={branch.id || index}
                      className="p-4 rounded-xl transition-all cursor-pointer"
                      style={{ backgroundColor: "#f0fdf4" }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = "#dcfce7"}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = "#f0fdf4"}
                    >
                      <div className="font-bold mb-1 line-clamp-1" style={{ color: "#111827" }}>
                        {branch.store_name}
                      </div>
                      <div className="text-xl font-bold mb-1" style={{ color: "#16a34a" }}>
                        {branch.distance?.toFixed(1)}km
                      </div>
                      <p className="text-sm line-clamp-1" style={{ color: "#4b5563" }}>{branch.branch_type}</p>
                      <p className="text-xs mt-2" style={{ color: "#6b7280" }}>{branch.city}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Empty state
          <div
            className="rounded-3xl shadow-xl p-8 text-center border"
            style={{ backgroundColor: "#ffffff", borderColor: "#f3f4f6" }}
          >
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center" style={{ color: "#9ca3af" }}>
              <LocationIcon />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#374151" }}>
              Find Your Nearest Store
            </h2>
            <p className="mb-6" style={{ color: "#4b5563" }}>
              Enter your location above to discover stores near you.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
              <button
                onClick={handleUseMyLocation}
                className="px-6 py-3 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: "#22c55e" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#16a34a"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#22c55e"}
              >
                <span>📍</span> Use My Location
              </button>
              <button
                onClick={() => setShowManualInput(true)}
                className="px-6 py-3 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: "#3b82f6" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2563eb"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#3b82f6"}
              >
                <span>📝</span> Enter Manually
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
