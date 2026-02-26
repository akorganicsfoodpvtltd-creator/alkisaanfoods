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
  const [locationPermission, setLocationPermission] = useState('prompt'); // 'prompt', 'granted', 'denied'

  // Check location permission status
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' })
        .then((permissionStatus) => {
          setLocationPermission(permissionStatus.state);
          
          // Listen for permission changes
          permissionStatus.onchange = () => {
            setLocationPermission(permissionStatus.state);
          };
        });
    }
  }, []);

  // Fetch branches from backend
  const fetchBranches = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/stores");
      if (!res.ok) throw new Error("Failed to fetch stores");
      
      const data = await res.json();
      console.log("📡 Backend Data:", data);
      
      if (!Array.isArray(data) || data.length === 0) {
        setError("No branches available from server.");
        return [];
      }

      // Normalize branch data
      const normalizedBranches = data.map(branch => ({
        id: branch.id || branch.store_id || Math.random(),
        store_name: branch.store_name || branch["Store Name"] || branch.name || "Unknown Store",
        address: branch.address || branch.Address || "",
        city: branch.city || branch.City || "",
        phone: branch.phone || branch.phone_number || branch["Phone Number"] || "",
        branch_type: branch.branch_type || branch.Branch || "",
        latitude: parseFloat(branch.latitude || branch.Latitude),
        longitude: parseFloat(branch.longitude || branch.Longitude),
        ...branch
      }));

      return normalizedBranches.filter(branch => 
        !isNaN(branch.latitude) && 
        !isNaN(branch.longitude)
      );

    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError("Failed to fetch stores. Please check backend connection.");
      return [];
    }
  };

  // Calculate distances and find nearest
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

  // Get user location with improved error handling
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
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
          ...options
        }
      );
    });
  };

  // Handle "Use My Location" button click
  const handleUseMyLocation = async () => {
    setLoading(true);
    setError("");
    
    try {
      const location = await getUserLocation();
      console.log("📍 Got User Location:", location.latitude, location.longitude);
      
      setUserLocation({ lat: location.latitude, lng: location.longitude });
      setManualCoords({ 
        lat: location.latitude.toString(), 
        lng: location.longitude.toString() 
      });
      setShowManualInput(false);
      setLocationPermission('granted');
      
      await calculateNearestStore(location.latitude, location.longitude);
      
    } catch (err) {
      console.error("❌ Location error:", err.message);
      setError(err.message);
      setShowManualInput(true);
      setLoading(false);
      
      // Guide user to browser settings
      if (err.message.includes("enable location access")) {
        setTimeout(() => {
          if (confirm("Would you like instructions on how to enable location access in your browser?")) {
            alert("To enable location access:\n\n1. Click the lock/padlock icon in your browser's address bar\n2. Click 'Site settings' or 'Permissions'\n3. Find 'Location' and change it to 'Allow'\n4. Refresh this page and try again");
          }
        }, 500);
      }
    }
  };

  // Handle manual search
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

  // Initialize on component mount
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      
      // Try to get location automatically if permission might be granted
      if (locationPermission === 'granted' || locationPermission === 'prompt') {
        try {
          const location = await getUserLocation({ timeout: 5000 });
          setUserLocation({ lat: location.latitude, lng: location.longitude });
          setManualCoords({ 
            lat: location.latitude.toString(), 
            lng: location.longitude.toString() 
          });
          await calculateNearestStore(location.latitude, location.longitude);
          return;
        } catch (err) {
          console.log("Auto-location failed:", err.message);
          // Continue to show manual input
        }
      }
      
      // If auto-location fails, fetch default data
      try {
        const branches = await fetchBranches();
        setBranches(branches);
        setError("Please enter your location or allow location access.");
      } catch (err) {
        setError("Failed to load store data.");
      } finally {
        setLoading(false);
        setShowManualInput(true);
      }
    };

    initialize();
  }, [locationPermission]);

  // SVG Icons
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
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Finding your nearest store...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      {/* Main Header */}
      <div className="bg-gradient-to-r from-green-500 via-green-600 to-blue-600 text-white rounded-3xl shadow-2xl p-6 md:p-8 mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <LocationIcon />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1 text-green-100">Find Nearest Store</h1>
            <p className="opacity-90 text-green-50 text-sm md:text-base">Locate stores near you</p>
          </div>
        </div>

        {/* Location Status */}
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={handleUseMyLocation}
            disabled={locationPermission === 'denied'}
            className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 ${
              locationPermission === 'denied' 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-white text-green-600 hover:bg-green-50'
            }`}
          >
            <span>📍</span>
            {locationPermission === 'denied' ? 'Location Blocked' : 'Use My Location'}
          </button>
          
          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className="px-4 py-2 bg-green-400 text-white rounded-xl font-semibold hover:bg-green-500"
          >
            📍 Enter Location Manually
          </button>
        </div>

        {/* Manual Input */}
        {showManualInput && (
          <div className="bg-white/10 p-4 rounded-xl mt-4 animate-slideDown">
            <p className="text-green-100 font-semibold mb-3">Enter coordinates:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm mb-1 text-green-50">Latitude</label>
                <input
                  type="number"
                  placeholder="e.g., 31.5204"
                  value={manualCoords.lat}
                  onChange={(e) => setManualCoords({...manualCoords, lat: e.target.value})}
                  className="w-full p-3 border border-green-300 rounded-xl bg-white/10 text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                  step="any"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-green-50">Longitude</label>
                <input
                  type="number"
                  placeholder="e.g., 74.3587"
                  value={manualCoords.lng}
                  onChange={(e) => setManualCoords({...manualCoords, lng: e.target.value})}
                  className="w-full p-3 border border-green-300 rounded-xl bg-white/10 text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                  step="any"
                />
              </div>
            </div>
            <button
              onClick={handleManualSearch}
              className="w-full px-4 py-3 bg-white text-green-600 font-bold rounded-xl hover:bg-green-50 transition-all flex items-center justify-center gap-2"
            >
              🔍 Search Nearest Store
            </button>
            
            <div className="mt-3 text-xs text-green-200">
              <p>💡 Tip: You can find coordinates on Google Maps by right-clicking a location</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className={`mt-4 p-3 rounded-xl border ${
            error.includes("denied") ? "bg-red-500/20 border-red-400" : "bg-yellow-500/20 border-yellow-400"
          }`}>
            <p className={`${error.includes("denied") ? "text-red-100" : "text-yellow-100"}`}>
              {error}
            </p>
            {error.includes("enable location access") && (
              <button
                onClick={() => {
                  if (confirm("Open browser settings to enable location permission?")) {
                    // Chrome/Firefox settings
                    if (navigator.userAgent.includes("Chrome")) {
                      window.open("chrome://settings/content/location", "_blank");
                    } else {
                      alert("Please go to your browser's settings and enable location permission for this site.");
                    }
                  }
                }}
                className="mt-2 text-sm underline"
              >
                Fix location settings
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results Section */}
      {nearestBranch ? (
        <div className="space-y-6">
          {/* Nearest Store Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                <div className="inline-block px-4 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-2">
                  🎯 Nearest Store
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  {nearestBranch.store_name}
                </h2>
                <p className="text-gray-600 text-sm mt-1">{nearestBranch.branch_type}</p>
              </div>
              <div className="text-left md:text-right">
                <div className="text-2xl md:text-3xl font-bold text-green-600">
                  {nearestBranch.distance?.toFixed(1)} km
                </div>
                <div className="text-sm text-gray-500">Distance from you</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Store Details */}
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <LocationIcon />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Address</p>
                      <p className="text-gray-700">{nearestBranch.address}</p>
                      <p className="text-green-700 font-medium mt-1">{nearestBranch.city}</p>
                    </div>
                  </div>
                </div>

                {nearestBranch.phone && (
                  <div className="p-4 bg-green-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <PhoneIcon />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Contact</p>
                        <p className="text-xl font-bold text-green-600">{nearestBranch.phone}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Map Link */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
                <h3 className="font-bold mb-4 text-lg text-gray-900">📍 View on Map</h3>
                <a
                  href={`https://www.google.com/maps?q=${nearestBranch.latitude},${nearestBranch.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-xl text-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  Open in Google Maps
                </a>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Coordinates: {nearestBranch.latitude?.toFixed(4)}, {nearestBranch.longitude?.toFixed(4)}
                </p>
              </div>
            </div>
          </div>

          {/* Other Nearby Stores */}
          {branches.length > 1 && (
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100">
              <h3 className="text-lg md:text-xl font-bold mb-4 text-gray-900">Other Nearby Stores</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {branches.slice(1, 4).map((branch, index) => (
                  <div 
                    key={branch.id || index} 
                    className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all cursor-pointer"
                    onClick={() => {
                      setManualCoords({ lat: branch.latitude.toString(), lng: branch.longitude.toString() });
                      setUserLocation({ lat: branch.latitude, lng: branch.longitude });
                      calculateNearestStore(branch.latitude, branch.longitude);
                    }}
                  >
                    <div className="font-bold text-gray-900 mb-1 line-clamp-1">
                      {branch.store_name}
                    </div>
                    <div className="text-xl font-bold text-green-600 mb-1">
                      {branch.distance?.toFixed(1)}km
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-1">{branch.branch_type}</p>
                    <p className="text-xs text-gray-500 mt-2">{branch.city}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        // No stores found state
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-16 h-16 text-gray-400 mx-auto mb-4 flex items-center justify-center">
            <LocationIcon />
          </div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Find Your Nearest Store</h2>
          <p className="text-gray-600 mb-6">Enter your location above to discover stores near you.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            <button
              onClick={handleUseMyLocation}
              className="px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-all flex items-center justify-center gap-2"
            >
              <span>📍</span> Use My Location
            </button>
            <button
              onClick={() => setShowManualInput(true)}
              className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
            >
              <span>📝</span> Enter Manually
            </button>
          </div>
        </div>
      )}

      {/* Location Help */}
      {locationPermission === 'denied' && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <h3 className="font-bold text-yellow-800 mb-2">📍 Location Access Denied</h3>
          <p className="text-yellow-700 mb-4">
            You've denied location access. To use automatic location detection:
          </p>
          <ol className="list-decimal pl-5 text-yellow-700 space-y-1 text-sm">
            <li>Click the lock icon 🔒 in your browser's address bar</li>
            <li>Find "Location" settings</li>
            <li>Change it to "Allow"</li>
            <li>Refresh this page</li>
          </ol>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600"
          >
            🔄 Refresh Page
          </button>
        </div>
      )}
    </div>
  );
}