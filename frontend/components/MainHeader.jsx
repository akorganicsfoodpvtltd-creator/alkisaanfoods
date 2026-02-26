"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { FiSearch, FiMenu, FiX, FiLogOut, FiUser, FiShoppingBag, FiShoppingCart, FiChevronRight, FiPackage, FiStar, FiShield, FiLock, FiChevronLeft } from "react-icons/fi";
import { FaShoppingCart, FaUserCircle, FaTrash, FaTimes, FaCheck, FaPlus, FaMinus, FaFacebook, FaInstagram, FaPinterest, FaYoutube, FaTiktok, FaSnapchat, FaLeaf, FaSeedling, FaBreadSlice, FaSpinner } from "react-icons/fa";
import { SiGooglemaps } from "react-icons/si";
import { IoBagCheckOutline } from "react-icons/io5";
import { RiSecurePaymentLine, RiShieldCheckFill } from "react-icons/ri";
import { MdLocalShipping, MdDiscount } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import logo from "../assets/logo.jpg";
import { useRouter, usePathname } from "next/navigation";
import axios from "../utils/axiosInstance";

// Compact Login Modal Component
const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState({ type: null, message: "" });
  const [countdown, setCountdown] = useState(0);
  const [googleClicked, setGoogleClicked] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const codeInputRefs = useRef([]);

  // Reset when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setEmail("");
      setCode(["", "", "", "", "", ""]);
      setStatus({ type: null, message: "" });
      setCountdown(0);
      setGoogleClicked(false);
      setEmailSubmitted(false);
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Focus first code input
  useEffect(() => {
    if (step === 2 && codeInputRefs.current[0]) {
      setTimeout(() => codeInputRefs.current[0].focus(), 100);
    }
  }, [step]);

  // Close modal on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleGoogleLogin = async () => {
    setGoogleClicked(true);
    setLoading(true);
    setStatus({ type: 'info', message: "Redirecting to Google..." });
    
    try {
      const googleAuthUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/google`;
      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error("Google login error:", error);
      setStatus({ 
        type: 'error', 
        message: "Failed to initiate Google login" 
      });
      setGoogleClicked(false);
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setStatus({ 
        type: 'error', 
        message: "Please enter a valid email address" 
      });
      return;
    }

    setLoading(true);
    setEmailSubmitted(true);
    setStatus({ type: 'info', message: "Sending verification code..." });

    try {
      console.log("Sending verification code to:", email);
      const response = await axios.post("/api/auth/send-code", { 
        email
      });

      console.log("Send code response:", response.data);

      if (response.data.success) {
        setStep(2);
        setCountdown(60);
        
        // Show success message
        let successMessage = `✅ Verification code sent to <strong>${email}</strong>`;
        if (response.data.data?.testMode) {
          successMessage += `<br><small style="color: #666;">Development mode - Code: ${response.data.data.code}</small>`;
        } else {
          successMessage += `<br><small style="color: #666;">Please check your inbox (and spam folder)</small>`;
        }
        
        setStatus({ 
          type: 'success', 
          message: successMessage 
        });
        
        // Auto-focus first code input
        setTimeout(() => {
          if (codeInputRefs.current[0]) {
            codeInputRefs.current[0].focus();
          }
        }, 200);
        
      } else {
        setStatus({ 
          type: 'error', 
          message: response.data.message || "Failed to send verification code" 
        });
        setEmailSubmitted(false);
      }
    } catch (error) {
      console.error("Send code error:", error);
      
      // For development/testing, still go to step 2
      setStep(2);
      setCountdown(60);
      setStatus({ 
        type: 'info', 
        message: `⚠️ Development mode<br>Use test code: <strong>123456</strong>` 
      });
      
      setTimeout(() => {
        if (codeInputRefs.current[0]) {
          codeInputRefs.current[0].focus();
        }
      }, 200);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    
    if (value && index < 5) {
      setTimeout(() => {
        codeInputRefs.current[index + 1]?.focus();
      }, 50);
    }
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const numbers = text.replace(/\D/g, '').slice(0, 6);
        const newCode = [...code];
        numbers.split('').forEach((num, i) => {
          if (i < 6) newCode[i] = num;
        });
        setCode(newCode);
        
        // Focus last input
        const lastIndex = Math.min(numbers.length - 1, 5);
        setTimeout(() => {
          codeInputRefs.current[lastIndex]?.focus();
        }, 50);
      });
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      setStatus({ type: 'error', message: "Please enter the complete 6-digit code" });
      return;
    }

    setLoading(true);
    setStatus({ type: 'info', message: "Verifying code..." });

    try {
      console.log("Verifying code:", verificationCode, "for email:", email);
      const response = await axios.post("/api/auth/verify-code", {
        email,
        code: verificationCode
      });

      console.log("Verify response:", response.data);

      if (response.data.success) {
        setStatus({ 
          type: 'success', 
          message: "✅ Login successful! Redirecting..." 
        });
        
        if (onLoginSuccess) {
          onLoginSuccess(response.data.user);
        }
        
        // Close modal after success
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1500);
      } else {
        setStatus({ 
          type: 'error', 
          message: response.data.message || "Invalid verification code" 
        });
      }
    } catch (error) {
      console.error("Verify error:", error);
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || "Verification failed. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    setStatus({ type: 'info', message: "Sending new code..." });
    
    try {
      const response = await axios.post("/api/auth/resend-code", { email });
      
      if (response.data.success) {
        setCountdown(60);
        setStatus({ 
          type: 'success', 
          message: "✅ New verification code sent!" 
        });
      } else {
        setStatus({ 
          type: 'error', 
          message: response.data.message || "Failed to resend code" 
        });
      }
    } catch (error) {
      console.error("Resend error:", error);
      setStatus({ 
        type: 'error', 
        message: "Failed to resend code. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep(1);
    setCode(["", "", "", "", "", ""]);
    setStatus({ type: null, message: "" });
    setCountdown(0);
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-xl w-full max-w-md mx-auto relative overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          style={{ 
            maxHeight: '90vh',
            maxWidth: '400px'
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-all"
            aria-label="Close login modal"
          >
            <FiX className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="p-6">
            {/* Logo & Title */}
            <div className="text-center mb-6">
              <div className="relative w-16 h-16 mx-auto mb-3">
                <Image
                  src={logo}
                  alt="Al Kissan Foods"
                  fill
                  className="rounded-lg object-contain"
                  priority
                />
              </div>
              <h2 className="text-xl font-bold text-[rgba(23,47,132,0.89)]">
                {step === 1 ? "Sign in" : "Enter Code"}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {step === 1 ? "Continue to your account" : `Sent to ${email}`}
              </p>
            </div>

            {/* Status Message */}
            {status.message && (
              <div className={`mb-4 p-3 rounded text-sm ${
                status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                <div dangerouslySetInnerHTML={{ __html: status.message }} />
              </div>
            )}

            {/* Step 1: Email/Google */}
            {step === 1 ? (
              <div className="space-y-4">
                {/* Google Button */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className={`
                    w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg font-medium text-sm sm:text-base
                    transition-all duration-200 border relative
                    disabled:opacity-70 disabled:cursor-not-allowed
                    ${googleClicked 
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white border-green-600 shadow-md' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:shadow-sm'
                    }
                  `}
                >
                  {loading && googleClicked ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Redirecting...</span>
                    </>
                  ) : (
                    <>
                      <FcGoogle className="text-xl" />
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-white text-gray-500 text-sm">or</span>
                  </div>
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm sm:text-base disabled:bg-gray-50"
                      placeholder="Enter your email"
                      required
                      autoComplete="email"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email || !validateEmail(email)}
                    className={`
                      w-full py-3 rounded-lg font-medium text-sm sm:text-base
                      transition-all duration-200 relative
                      disabled:opacity-70 disabled:cursor-not-allowed
                      ${emailSubmitted 
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md' 
                        : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:shadow-md'
                      }
                    `}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <FaSpinner className="animate-spin" />
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span>Continue</span>
                        <FiChevronRight className="text-lg" />
                      </div>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* Step 2: Code Verification */
              <div className="space-y-5">
                {/* Code Input */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Enter the 6-digit code sent to:
                  </p>
                  <p className="font-medium text-gray-800 mb-6">{email}</p>
                  
                  <div className="flex justify-center gap-2 sm:gap-3 mb-6">
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => codeInputRefs.current[index] = el}
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleCodeKeyDown(index, e)}
                        disabled={loading}
                        className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-lg border-2 border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-200 outline-none transition-all bg-white disabled:bg-gray-50"
                        autoComplete="off"
                      />
                    ))}
                  </div>
                  
                  {/* Code Status */}
                  <div className="text-sm text-gray-600 mb-4">
                    {code.join('').length === 6 ? (
                      <span className="text-green-600">✓ Complete</span>
                    ) : (
                      <span>{code.join('').length}/6 digits</span>
                    )}
                  </div>
                </div>

                {/* Countdown/Resend */}
                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-sm text-gray-600">
                      Resend code in <span className="font-semibold text-green-600">{countdown}s</span>
                    </p>
                  ) : (
                    <button
                      onClick={handleResendCode}
                      disabled={loading}
                      className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
                    >
                      Resend code
                    </button>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleCodeSubmit}
                  disabled={loading || code.join('').length !== 6}
                  className={`
                    w-full py-3 rounded-lg font-medium text-sm sm:text-base
                    transition-all duration-200
                    disabled:opacity-70 disabled:cursor-not-allowed
                    bg-gradient-to-r from-green-600 to-green-700 text-white hover:shadow-md
                  `}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <FaSpinner className="animate-spin" />
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>Submit</span>
                      <FiChevronRight className="text-lg" />
                    </div>
                  )}
                </button>

                {/* Back Link */}
                <div className="text-center pt-4 border-t border-gray-200">
                  <button
                    onClick={handleBackToEmail}
                    disabled={loading}
                    className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center justify-center gap-1 mx-auto disabled:opacity-50"
                  >
                    <FiChevronLeft className="text-base" />
                    Use different email
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Policy */}
            <div className="mt-6 pt-5 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                By continuing, you agree to our{" "}
                <a href="/privacy" className="text-green-600 hover:text-green-700 font-medium">Privacy Policy</a>{" "}
                and{" "}
                <a href="/terms" className="text-green-600 hover:text-green-700 font-medium">Terms of Service</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </>
  );
};

// Search Bar Component (keep as before)
const SearchBar = ({ isOpen, onClose, searchTerm, setSearchTerm, filteredProducts }) => {
  const router = useRouter();
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  const alKissanProducts = [
    { 
      name: "Al Kissan Multigrain Flour", 
      icon: FaBreadSlice,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    { 
      name: "Al Kissan Gluten Free Flour", 
      icon: FaLeaf,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    { 
      name: "Al Kissan Barley Flour", 
      icon: FaSeedling,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    }
  ];

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleProductClick = (productName) => {
    setSearchTerm(productName);
    setTimeout(() => {
      onClose();
      if (window.location.pathname === "/") {
        const productsSection = document.getElementById("products");
        if (productsSection) {
          productsSection.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        router.push("/#products");
      }
    }, 300);
  };

  const handleSearchClick = () => {
    if (searchTerm.trim()) {
      onClose();
      setTimeout(() => {
        if (window.location.pathname === "/") {
          const productsSection = document.getElementById("products");
          if (productsSection) {
            productsSection.scrollIntoView({ behavior: "smooth" });
          }
        } else {
          router.push("/#products");
        }
      }, 300);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[90] backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      
      <div className={`fixed top-0 left-0 right-0 z-[95] transition-all duration-300 ${
        isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
        <div className="bg-white shadow-2xl border-b-2 border-green-600">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-600 text-xl" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-12 py-4 text-lg border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white shadow-inner"
                  placeholder="Search Al Kissan products..."
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full"
                  >
                    <FiX size={20} />
                  </button>
                )}
              </div>
              
              <button
                onClick={handleSearchClick}
                disabled={!searchTerm.trim()}
                className="bg-gradient-to-r from-green-600 to-[rgba(23,47,132,0.89)] text-white p-4 rounded-xl hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <FiSearch size={24} />
              </button>
              
              <button
                onClick={onClose}
                className="p-4 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all active:scale-95"
              >
                <FiX size={24} />
              </button>
            </div>

            {!searchTerm && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <FiStar className="text-amber-500" />
                  <p className="text-gray-700 font-medium">Popular Al Kissan Products</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {alKissanProducts.map((product) => {
                    const Icon = product.icon;
                    return (
                      <button
                        key={product.name}
                        onClick={() => handleProductClick(product.name)}
                        className={`${product.bgColor} p-4 rounded-xl hover:shadow-md transition-all active:scale-95 border border-transparent hover:border-green-200 group`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${product.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <Icon className={`${product.color} text-xl`} />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium text-gray-900 group-hover:text-green-700 truncate">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Click to search</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {searchTerm && filteredProducts.length > 0 && (
              <div className="mt-4 bg-white rounded-xl shadow-lg border border-green-100 max-h-80 overflow-y-auto">
                <div className="p-3">
                  <p className="text-sm text-gray-500 px-3 py-2">
                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                  </p>
                  <div className="divide-y divide-gray-100">
                    {filteredProducts.map((product) => (
                      <button
                        key={product._id}
                        onClick={() => handleProductClick(product.name)}
                        className="w-full text-left p-3 hover:bg-green-50 flex items-center gap-3 transition-all active:scale-[0.98] group"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-r from-green-100 to-blue-100 flex-shrink-0">
                          <img
                            src={product.image || '/slide1.png'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/slide1.png';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate group-hover:text-green-700">
                            {product.name}
                          </div>
                          <div className="text-sm text-green-600 font-semibold">PKR {product.price}</div>
                        </div>
                        <FiChevronRight className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {searchTerm && filteredProducts.length === 0 && (
              <div className="mt-4 text-center p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                <FiSearch className="text-3xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No products found for "{searchTerm}"</p>
                <p className="text-sm text-gray-400 mt-2">Try searching for our popular products</p>
                <div className="flex justify-center gap-2 mt-3">
                  {alKissanProducts.map((product) => (
                    <button
                      key={product.name}
                      onClick={() => handleProductClick(product.name)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
                    >
                      {product.name.split(' ').pop()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Main Header Component
export default function MainHeader() {
  const router = useRouter();
  const pathname = usePathname();

  // ---------------- STATES ----------------
  const [showSearch, setShowSearch] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeSection, setActiveSection] = useState("Home");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(null);
  const [cartMessage, setCartMessage] = useState(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [isClosingCart, setIsClosingCart] = useState(false);
  const [navIndicatorPosition, setNavIndicatorPosition] = useState({ left: 0, width: 0 });
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ---------------- REFS ----------------
  const cartPanelRef = useRef(null);
  const navRefs = useRef({});
  const userDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const headerRef = useRef(null);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Products", hash: "products" },
    { label: "Dietician", hash: "dietician" },
    { label: "Blog & Recipes", hash: "blog-recipes" },
    { label: "About Us", hash: "about-us" },
    { label: "Contact Us", hash: "contact-us" },
    { label: "Stores", path: "/stores" },
  ];

  const socialLinks = [
    { icon: FaFacebook, href: "https://www.facebook.com/share/17jxBbhJre/?mibextid=wwXIfr", label: "Facebook" },
    { icon: FaInstagram, href: "https://www.instagram.com/alkissanfoods", label: "Instagram" },
    { icon: FaPinterest, href: "https://www.pinterest.com/alkissanfoods", label: "Pinterest" },
    { icon: FaSnapchat, href: "https://www.snapchat.com/@alkissanfoods?invite_id=ueoo-uX4&locale=en_PK", label: "Snapchat" },
    { icon: FaTiktok, href: "https://www.tiktok.com/@alkissanfoods", label: "TikTok" },
    { icon: FaYoutube, href: "https://youtube.com/@alkissafoods?si=1vakMX27yyUTOdwc", label: "YouTube" },
    { icon: SiGooglemaps, href: "https://share.google/chcGyQbec5ytFa7gh", label: "Google Maps" },
  ];

  // ---------------- FORMAT PRICE ----------------
  const formatPrice = (price) => {
    if (price === null || price === undefined) return '0.00';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return '0.00';
    return numPrice.toFixed(2);
  };

  // ---------------- CART FUNCTIONS ----------------
  const fetchCart = useCallback(async () => {
    try {
      setCartLoading(true);
      const res = await axios.get("/api/cart", { withCredentials: true });
      
      let items = [];
      if (res.data?.items) {
        items = res.data.items;
      } else if (Array.isArray(res.data)) {
        items = res.data;
      } else if (res.data?.cart?.items) {
        items = res.data.cart.items;
      }
      
      setCart(items);
      setCartCount(items.reduce((total, item) => total + (item.quantity || 1), 0));
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCart([]);
      setCartCount(0);
    } finally {
      setCartLoading(false);
    }
  }, []);

  // ---------------- USER FUNCTIONS ----------------
  const fetchUser = useCallback(async () => {
    try {
      const res = await axios.get("/api/auth/me", { withCredentials: true });
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setShowLoginModal(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setShowUserDropdown(false);
    
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      
      setUser(null);
      setCart([]);
      setCartCount(0);
      
      localStorage.clear();
      sessionStorage.clear();
      
      window.location.href = "/";
      
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/";
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserInitial = () => {
    if (!user?.name && !user?.email) return "U";
    const nameToUse = user.name || user.email;
    return nameToUse.charAt(0).toUpperCase();
  };

  const getUserDisplayName = () => {
    if (!user) return "";
    if (user.name) return user.name;
    if (user.email) return user.email.split('@')[0];
    return "User";
  };

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    fetchUser();
    fetchCart();
  }, [fetchUser, fetchCart]);

  useEffect(() => {
    const fetchSearch = async () => {
      if (!searchTerm.trim()) {
        setFilteredProducts([]);
        return;
      }
      try {
        const res = await axios.get(`/api/products?search=${encodeURIComponent(searchTerm)}`);
        setFilteredProducts(res.data.products || []);
      } catch {
        setFilteredProducts([]);
      }
    };
    const delay = setTimeout(fetchSearch, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  // Update nav indicator
  useEffect(() => {
    const updateNavIndicator = () => {
      const activeElement = navRefs.current[activeSection];
      if (activeElement) {
        const { offsetLeft, offsetWidth } = activeElement;
        setNavIndicatorPosition({
          left: offsetLeft,
          width: offsetWidth
        });
      }
    };

    updateNavIndicator();
    
    window.addEventListener('resize', updateNavIndicator);
    return () => window.removeEventListener('resize', updateNavIndicator);
  }, [activeSection]);

  // Scroll handling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      if (pathname === "/") {
        const scrollPosition = window.scrollY + 100;
        
        if (scrollPosition < 200) {
          setActiveSection("Home");
          return;
        }
        
        const sections = navItems.filter(item => item.hash).map(item => ({
          id: item.hash,
          label: item.label
        }));
        
        let currentSection = "Home";
        
        for (const section of sections) {
          const element = document.getElementById(section.id);
          if (element) {
            const { top, bottom } = element.getBoundingClientRect();
            const absoluteTop = top + window.scrollY;
            
            if (scrollPosition >= absoluteTop - 100) {
              currentSection = section.label;
            }
          }
        }
        
        setActiveSection(currentSection);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    if (pathname === "/" && window.location.hash) {
      const hash = window.location.hash.replace('#', '');
      const navItem = navItems.find(item => item.hash === hash);
      if (navItem) {
        setActiveSection(navItem.label);
      }
    } else {
      setActiveSection("Home");
    }
    
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCart && cartPanelRef.current && 
          !cartPanelRef.current.contains(event.target) && 
          !event.target.closest('.cart-icon-btn')) {
        closeCart();
      }
      
      if (showUserDropdown && userDropdownRef.current && 
          !userDropdownRef.current.contains(event.target) && 
          !event.target.closest('.user-icon-btn')) {
        setShowUserDropdown(false);
      }
      
      if (showMobileMenu && mobileMenuRef.current && 
          !mobileMenuRef.current.contains(event.target) && 
          !event.target.closest('.mobile-menu-btn')) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCart, showUserDropdown, showMobileMenu]);

  useEffect(() => {
    const handleCartItemAdded = (event) => {
      const productName = event.detail?.productName || "Item";
      setCartMessage({
        type: 'success',
        text: `${productName} added to cart!`,
        icon: '🛒'
      });
      setTimeout(() => setCartMessage(null), 3000);
      
      fetchCart();
      
      if (!showCart) {
        setShowCart(true);
      }
    };
    
    window.addEventListener('cartItemAdded', handleCartItemAdded);
    
    return () => {
      window.removeEventListener('cartItemAdded', handleCartItemAdded);
    };
  }, [fetchCart, showCart]);

  useEffect(() => {
    if (showMobileMenu || showLoginModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showMobileMenu, showLoginModal]);

  // ---------------- CALCULATIONS ----------------
  const subtotal = cart.reduce((total, item) => {
    const price = parseFloat(item.price || item.product?.price || 0);
    const quantity = parseInt(item.quantity || 1);
    return total + price * quantity;
  }, 0);
  
  const shippingCost = 0;
  const total = subtotal + shippingCost;

  // ---------------- HANDLERS ----------------
  const handleCartClick = async (e) => {
    e.stopPropagation();
    if (isClosingCart) return;
    
    if (!showCart) {
      await fetchCart();
      setShowCart(true);
    } else {
      closeCart();
    }
  };

  const closeCart = () => {
    setIsClosingCart(true);
    setTimeout(() => {
      setShowCart(false);
      setIsClosingCart(false);
    }, 300);
  };

  const handleRemoveFromCart = async (itemId) => {
    try {
      const itemToRemove = cart.find(item => item._id === itemId || item.id === itemId);
      
      if (itemToRemove) {
        const quantityToRemove = itemToRemove.quantity || 1;
        setCartCount(prev => Math.max(0, prev - quantityToRemove));
        setCart(prev => prev.filter(item => item._id !== itemId && item.id !== itemId));
      }
      
      await axios.delete(`/api/cart/${itemId}`, { withCredentials: true });
      
      setCartMessage({
        type: 'success',
        text: 'Item removed from cart!',
        icon: '🗑️'
      });
      
      const productId = itemToRemove?.product_id || itemToRemove?.product?.id;
      if (productId) {
        window.dispatchEvent(new CustomEvent('enableAddToCart', { 
          detail: { productId } 
        }));
      }
      
    } catch (error) {
      console.error("Failed to remove item:", error);
      setCartMessage({
        type: 'error',
        text: 'Failed to remove item. Please try again.',
        icon: '❌'
      });
      fetchCart();
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveFromCart(itemId);
      return;
    }
    
    try {
      setIsUpdatingQuantity(itemId);
      
      const updatedCart = cart.map(item => {
        if (item._id === itemId || item.id === itemId) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      setCart(updatedCart);
      
      setCartCount(updatedCart.reduce((total, item) => total + (item.quantity || 1), 0));
      
      await axios.put(`/api/cart/${itemId}`, 
        { quantity: newQuantity }, 
        { withCredentials: true }
      );
      
      setCartMessage({
        type: 'success',
        text: 'Quantity updated!',
        icon: '✅'
      });
    } catch (error) {
      console.error("Failed to update quantity:", error);
      setCartMessage({
        type: 'error',
        text: 'Failed to update quantity. Please try again.',
        icon: '❌'
      });
      fetchCart();
    } finally {
      setIsUpdatingQuantity(null);
    }
  };

  const getProductImageUrl = (product) => {
    if (!product) return '/placeholder.jpg';
    
    if (product.image) {
      if (product.image.startsWith('http')) return product.image;
      if (product.image.startsWith('/')) return product.image;
      return `/${product.image}`;
    }
    
    const name = (product.name || '').toLowerCase();
    if (name.includes('almond') || name.includes('nut')) return '/slide1.png';
    if (name.includes('date') || name.includes('fruit')) return '/slide2.png';
    if (name.includes('honey') || name.includes('sweet')) return '/slide3.png';
    if (name.includes('oil') || name.includes('olive')) return '/slide4.png';
    
    return '/slide1.png';
  };

  const getProductDetails = (item) => {
    const product = item.product || item;
    return {
      id: item._id || item.id || product._id || product.id,
      name: product.name || item.name || "Product",
      price: parseFloat(product.price || item.price || 0),
      image: product.image || item.image,
      quantity: parseInt(item.quantity || 1),
      productId: product._id || product.id || item.product_id
    };
  };

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  const handleContinueShopping = () => {
    closeCart();
    if (pathname === "/") {
      const productsSection = document.getElementById("products");
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push("/products");
    }
  };

  const handleNavClick = (item) => {
    setActiveSection(item.label);
    if (item.path) {
      router.push(item.path);
    } else if (item.hash) {
      if (pathname === "/") {
        const el = document.getElementById(item.hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(null, null, `#${item.hash}`);
        }
      } else {
        router.push(`/#${item.hash}`);
      }
    }
    setShowMobileMenu(false);
  };

  const handleSearchIconClick = () => {
    setShowSearch(true);
  };

  const handleUserIconClick = () => {
    if (user) {
      setShowUserDropdown(!showUserDropdown);
    } else {
      setShowLoginModal(true);
    }
  };

  const handleAdminDashboard = () => {
    if (user?.role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/user/dashboard");
    }
    setShowUserDropdown(false);
  };

  // ---------------- JSX ----------------
  return (
    <>
      {/* Notification Message */}
      {cartMessage && (
        <div className={`fixed top-20 right-4 z-[100] animate-fadeIn`}>
          <div className={`px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 ${
            cartMessage.type === 'success' 
              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" 
              : "bg-gradient-to-r from-red-500 to-rose-600 text-white"
          }`}>
            <span className="text-xl">{cartMessage.icon}</span>
            <span className="font-semibold">{cartMessage.text}</span>
            <button 
              onClick={() => setCartMessage(null)}
              className="ml-2 text-white/80 hover:text-white"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header 
        ref={headerRef}
        className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? "shadow-xl bg-white/95 backdrop-blur-sm" : "shadow-lg bg-white"}`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 md:py-4">
            {/* Left: Mobile Menu + Logo */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <button 
                className="mobile-menu-btn md:hidden text-2xl text-gray-800 hover:text-green-700 transition-all p-1 active:scale-95"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                aria-label="Toggle mobile menu"
              >
                {showMobileMenu ? <FiX /> : <FiMenu />}
              </button>
              <div 
                className="flex items-center gap-2 sm:gap-3 cursor-pointer min-w-0 ml-2 md:ml-0" 
                onClick={() => { 
                  router.push("/"); 
                  setActiveSection("Home");
                  setShowMobileMenu(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <Image 
                  src={logo} 
                  alt="Al Kissan Foods Logo" 
                  width={56} 
                  height={59} 
                  className="rounded-lg object-contain flex-shrink-0" 
                  priority 
                />
                <div className="hidden sm:block">
                  <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-[rgba(23,47,132,0.89)] whitespace-nowrap overflow-hidden text-ellipsis">
                    Al Kissan Foods
                  </h1>
                </div>
              </div>
            </div>

            {/* Desktop Nav with Indicator */}
            <nav className="hidden lg:flex items-center mx-4 relative">
              <ul className="flex items-center gap-1">
                {navItems.map((item) => (
                  <li key={item.label}>
                    <button
                      ref={el => navRefs.current[item.label] = el}
                      onClick={() => handleNavClick(item)}
                      className={`px-3 py-2.5 text-gray-800 font-bold hover:text-green-700 transition-all text-sm relative ${
                        activeSection === item.label ? 'text-green-700 font-extrabold' : ''
                      }`}
                    >
                      {item.label}
                      {item.label === "Home" && activeSection === "Home" && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600 rounded-full"></div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
              {/* Navigation Indicator for non-Home sections */}
              {activeSection !== "Home" && (
                <div 
                  className="absolute bottom-0 h-1 bg-green-600 rounded-full transition-all duration-300 ease-out"
                  style={{
                    left: `${navIndicatorPosition.left}px`,
                    width: `${navIndicatorPosition.width}px`,
                    opacity: navIndicatorPosition.width > 0 ? 1 : 0
                  }}
                />
              )}
            </nav>

            {/* Right: Icons */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Search */}
              <button 
                onClick={handleSearchIconClick}
                className="p-2 rounded-lg hover:bg-gray-100 transition-all active:scale-95"
                aria-label="Search products"
              >
                <FiSearch className="text-xl md:text-2xl text-gray-700 hover:text-green-700" />
              </button>

              {/* Cart Icon */}
              <div className="relative">
                <button 
                  onClick={handleCartClick}
                  className="cart-icon-btn p-2 rounded-lg hover:bg-gray-100 transition-all active:scale-95 relative"
                  aria-label={`Shopping cart with ${cartCount} items`}
                >
                  <FaShoppingCart className="text-xl md:text-2xl text-gray-700 hover:text-green-700" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-md animate-pulse">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>
              </div>

              {/* User/Login Icon */}
              <div className="relative" ref={userDropdownRef}>
                {user ? (
                  <>
                    <button 
                      onClick={handleUserIconClick}
                      className="user-icon-btn flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-all active:scale-95 relative group"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-600 to-[rgba(23,47,132,0.89)] flex items-center justify-center text-white font-bold">
                        {getUserInitial()}
                      </div>
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      {user.role === "admin" && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-[8px] font-bold text-white">A</span>
                        </div>
                      )}
                    </button>
                    
                    {showUserDropdown && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden">
                        {/* User Header */}
                        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-[rgba(23,47,132,0.89)] flex items-center justify-center text-white font-bold">
                              {getUserInitial()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-gray-900 truncate text-sm">{getUserDisplayName()}</div>
                              <div className="text-xs text-gray-600 truncate">{user.email}</div>
                              {user.role === "admin" && (
                                <div className="flex items-center gap-1 mt-1">
                                  <FiShield className="text-yellow-500 text-xs" />
                                  <span className="text-xs text-yellow-600 font-medium">Admin Account</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* User Menu */}
                        <div className="p-2">
                          <button
                            onClick={handleAdminDashboard}
                            className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded transition-all active:scale-95 group text-sm"
                          >
                            <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                              <FiUser className="text-green-600 text-sm" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {user.role === "admin" ? "Admin Dashboard" : "My Dashboard"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {user.role === "admin" ? "Manage store & orders" : "Orders & Profile"}
                              </div>
                            </div>
                          </button>
                          
                          <div className="border-t border-gray-100 my-2"></div>
                          
                          <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="w-full flex items-center gap-3 px-3 py-2 text-left rounded transition-all active:scale-95 group bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 text-sm"
                          >
                            <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                              {isLoggingOut ? (
                                <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <FiLogOut className="text-red-600 text-sm" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-red-600">
                                {isLoggingOut ? 'Logging out...' : 'Logout'}
                              </div>
                              <div className="text-xs text-red-500">Sign out from account</div>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <button 
                    onClick={handleUserIconClick}
                    className="user-icon-btn flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-all active:scale-95"
                  >
                    <FaUserCircle className="text-xl md:text-2xl text-gray-700 hover:text-green-700" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setShowMobileMenu(false)}
            />
            
            <div 
              ref={mobileMenuRef}
              className="fixed inset-y-0 left-0 w-full max-w-sm bg-white z-50 transform transition-transform duration-300 shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Image 
                    src={logo} 
                    alt="Al Kissan Foods Logo" 
                    width={40} 
                    height={40} 
                    className="rounded-lg object-contain" 
                  />
                  <h2 className="text-lg font-bold text-[rgba(23,47,132,0.89)]">
                    Al Kissan Foods
                  </h2>
                </div>
                <button 
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all active:scale-95"
                >
                  <FiX className="text-xl text-gray-600" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-2">
                  {navItems.map((item) => (
                    <li key={item.label}>
                      <button
                        onClick={() => handleNavClick(item)}
                        className={`w-full text-left px-4 py-3 font-medium transition-all rounded-lg active:scale-95 flex items-center justify-between ${
                          activeSection === item.label 
                            ? "bg-gradient-to-r from-green-50 to-blue-50 text-green-700 border-l-4 border-green-600" 
                            : "text-gray-800 hover:bg-gray-50"
                        }`}
                      >
                        <span className="text-base">{item.label}</span>
                        <FiChevronRight className={`transition-transform ${
                          activeSection === item.label ? "text-green-600" : "text-gray-400"
                        }`} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social Links Section */}
              <div className="border-t border-gray-200 bg-gradient-to-b bg-[rgba(23,47,132,0.89)] to-white p-4">
                <h3 className="text-center text-blue-800 font-medium text-sm mb-3">
                  Connect With Us
                </h3>
                <div className="flex justify-center gap-3 flex-wrap">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white border border-blue-200 text-blue-600 flex items-center justify-center transition-all hover:bg-blue-50 hover:scale-110 active:scale-95 shadow-sm"
                      aria-label={`Follow on ${social.label}`}
                    >
                      <social.icon className="text-sm" />
                    </a>
                  ))}
                </div>
                <p className="text-center text-blue-600 text-xs mt-3">
                  Stay updated with our latest products & offers
                </p>
              </div>
            </div>
          </>
        )}

        {/* Cart Side Panel */}
        {showCart && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-[70] transition-opacity duration-300"
              onClick={closeCart}
            />
            
            <div 
              ref={cartPanelRef}
              className="fixed inset-y-0 right-0 w-full md:w-[420px] bg-white z-[80] transform transition-transform duration-300 translate-x-0 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 md:p-5 border-b border-gray-200 bg-white flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-green-600 to-[rgba(23,47,132,0.89)] flex items-center justify-center">
                      <FiShoppingCart className="text-white text-base" />
                    </div>
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-gray-900">Shopping Cart</h2>
                      <p className="text-gray-600 text-xs">
                        {cartCount} item{cartCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={closeCart}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaTimes className="text-gray-500 text-base" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col">
                {cartLoading ? (
                  <div className="flex items-center justify-center h-full p-8">
                    <div className="w-10 h-10 border-3 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <div className="w-20 h-20 mb-4 rounded-full bg-gradient-to-r from-green-50 to-blue-50 flex items-center justify-center">
                      <FiShoppingCart className="text-gray-400 text-3xl" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Your cart is empty</h3>
                    <p className="text-gray-600 mb-6 text-sm">Add products to get started!</p>
                    <button
                      onClick={handleContinueShopping}
                      className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-[rgba(23,47,132,0.89)] text-white rounded-lg font-semibold hover:shadow-md transition-all active:scale-95 text-sm"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1 overflow-y-auto">
                      <div className="p-4 md:p-5">
                        <div className="space-y-3">
                          {cart.map((item) => {
                            const product = getProductDetails(item);
                            const imageUrl = getProductImageUrl(product);
                            
                            return (
                              <div key={product.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-green-200 transition-colors">
                                <div className="flex-shrink-0">
                                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden">
                                    <img
                                      src={imageUrl}
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/slide1.png';
                                      }}
                                    />
                                  </div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start gap-2">
                                    <div className="flex-1">
                                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                                        {product.name}
                                      </h3>
                                      <p className="text-green-600 font-bold text-xs md:text-sm mt-0.5">
                                        PKR {formatPrice(product.price)} each
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => handleRemoveFromCart(item._id || item.id)}
                                      className="p-1 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0 ml-2 active:scale-95"
                                    >
                                      <FaTrash className="text-xs" />
                                    </button>
                                  </div>
                                  
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-sm md:text-base font-bold text-green-700">
                                      PKR {formatPrice(product.price * product.quantity)}
                                      <span className="text-xs text-gray-500 ml-2">
                                        ({product.quantity} × PKR {formatPrice(product.price)})
                                      </span>
                                    </span>
                                    
                                    <div className="flex items-center">
                                      <div className="flex items-center bg-gray-100 rounded-md">
                                        <button
                                          onClick={() => handleUpdateQuantity(item._id || item.id, product.quantity - 1)}
                                          disabled={isUpdatingQuantity === (item._id || item.id) || product.quantity <= 1}
                                          className={`w-6 h-6 rounded-l flex items-center justify-center transition-all ${
                                            isUpdatingQuantity === (item._id || item.id) || product.quantity <= 1
                                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                              : 'bg-white hover:bg-gray-50 text-gray-700 active:scale-95'
                                          }`}
                                        >
                                          <FaMinus className="text-xs" />
                                        </button>
                                        
                                        <span className="w-6 text-center font-medium text-gray-800 text-xs">
                                          {isUpdatingQuantity === (item._id || item.id) ? (
                                            <div className="w-2.5 h-2.5 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                          ) : (
                                            product.quantity
                                          )}
                                        </span>
                                        
                                        <button
                                          onClick={() => handleUpdateQuantity(item._id || item.id, product.quantity + 1)}
                                          disabled={isUpdatingQuantity === (item._id || item.id)}
                                          className={`w-6 h-6 rounded-r flex items-center justify-center transition-all ${
                                            isUpdatingQuantity === (item._id || item.id)
                                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                              : 'bg-white hover:bg-gray-50 text-gray-700 active:scale-95'
                                          }`}
                                        >
                                          <FaPlus className="text-xs" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 md:p-5 border-t border-gray-200 bg-white flex-shrink-0">
                      <div className="space-y-2.5 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm">Subtotal</span>
                          <span className="font-medium text-gray-800">PKR {formatPrice(subtotal)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm">Shipping</span>
                          <span className="font-medium text-green-600">FREE</span>
                        </div>
                        
                        <div className="pt-2.5 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-900">Total Amount</span>
                            <div className="text-right">
                              <div className="text-lg font-bold text-[rgba(23,47,132,0.89)]">
                                PKR {formatPrice(total)}
                              </div>
                              <div className="text-xs text-gray-500">Inclusive of all taxes</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <button
                          onClick={handleCheckout}
                          className="w-full bg-gradient-to-r from-green-600 to-[rgba(23,47,132,0.89)] text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 text-sm md:text-base"
                        >
                          <IoBagCheckOutline className="text-base" />
                          <span>Proceed to Checkout</span>
                          <FiChevronRight />
                        </button>
                        
                        <button
                          onClick={handleContinueShopping}
                          className="w-full border border-[rgba(23,47,132,0.89)] text-[rgba(23,47,132,0.89)] py-2 rounded-lg font-semibold hover:bg-blue-50 transition-all active:scale-95 text-sm md:text-base"
                        >
                          Continue Shopping
                        </button>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                          <RiSecurePaymentLine className="text-green-600" />
                          <span>Secure Checkout • SSL Encrypted</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </header>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Search Bar */}
      <SearchBar
        isOpen={showSearch}
        onClose={() => {
          setShowSearch(false);
          setSearchTerm("");
        }}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredProducts={filteredProducts}
      />

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce { animation: bounce 0.5s ease-in-out 2; }
      `}</style>
    </>
  );
}