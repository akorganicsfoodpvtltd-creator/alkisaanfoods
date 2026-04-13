"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://alkisaanfoods-production-34db.up.railway.app";

// ✅ sessionId localStorage mein store karo (cross-domain ke liye)
const getOrCreateSessionId = () => {
  if (typeof window === "undefined") return null;
  let sessionId = localStorage.getItem("cartSessionId");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("cartSessionId", sessionId);
  }
  return sessionId;
};

export default function ProductsSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [addingToCart, setAddingToCart] = useState(null);
  const [buyingNow, setBuyingNow] = useState(null);
  const router = useRouter();

  // ✅ Har request mein token + sessionId bhejo
  const getAuthHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    const sessionId = getOrCreateSessionId();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(sessionId ? { "x-session-id": sessionId } : {}),
    };
  };

  const extractWeight = (product) => {
    const weightPattern = /(\d+(?:\.\d+)?)\s*(?:kg|KG|Kg|kgs|KGS)/i;
    const name = product.name || "";
    const description = product.description || "";
    const nameMatch = name.match(weightPattern);
    if (nameMatch) return parseFloat(nameMatch[1]);
    const descMatch = description.match(weightPattern);
    if (descMatch) return parseFloat(descMatch[1]);
    return 999;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products`);
        const data = await res.json();
        let productsList = data.products || [];
        productsList.sort((a, b) => extractWeight(a) - extractWeight(b));
        setProducts(productsList);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch(`${API_URL}/api/cart`, {
          method: "GET",
          credentials: "include",
          headers: getAuthHeaders(),
        });
        if (!res.ok) return;
        const data = await res.json();
        // ✅ Server se aaya sessionId save karo
        if (data.sessionId) localStorage.setItem("cartSessionId", data.sessionId);
        if (data.success) setCartItems(data.items || []);
      } catch (err) {
        console.error("Failed to fetch cart:", err);
      }
    };
    fetchCart();
  }, []);

  useEffect(() => {
    const handleEnableAddToCart = (event) => {
      const productId = event.detail?.productId;
      if (productId) {
        setCartItems(prev => prev.filter(item => item.product_id !== productId));
      }
    };
    window.addEventListener("enableAddToCart", handleEnableAddToCart);
    return () => window.removeEventListener("enableAddToCart", handleEnableAddToCart);
  }, []);

  const isInCart = (productId) => cartItems.some(item => item.product_id === productId);

  const addToCart = async (product) => {
    console.warn('Adding product:', product.id, product.name);
    setAddingToCart(product.id);
    try {
      const res = await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      const data = await res.json();

      // ✅ Server se aaya sessionId save karo
      if (data.sessionId) localStorage.setItem("cartSessionId", data.sessionId);

      if (data.success) {
        setCartItems((prev) => {
          const exists = prev.find((item) => item.product_id === product.id);
          if (exists) {
            return prev.map((item) =>
              item.product_id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          } else {
            return [
              ...prev,
              {
                product_id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1,
              },
            ];
          }
        });

        window.dispatchEvent(new CustomEvent("cartItemAdded", {
          detail: { productName: product.name, quantity: 1 },
        }));

      } else {
        if (res.status === 401) {
          window.dispatchEvent(new CustomEvent("openLoginModal"));
          alert("Please login first to add items to cart");
        } else {
          alert(data.message || "Failed to add to cart");
        }
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("Failed to add to cart. Please try again.");
    } finally {
      setAddingToCart(null);
    }
  };

  const handleBuyNow = async (product) => {
    setBuyingNow(product.id);
    try {
      const res = await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      const data = await res.json();

      if (data.sessionId) localStorage.setItem("cartSessionId", data.sessionId);

      if (data.success) {
        setCartItems((prev) => {
          const exists = prev.find((item) => item.product_id === product.id);
          if (exists) {
            return prev.map((item) =>
              item.product_id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          } else {
            return [
              ...prev,
              {
                product_id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1,
              },
            ];
          }
        });
        router.push("/checkout");

      } else {
        if (res.status === 401) {
          window.dispatchEvent(new CustomEvent("openLoginModal"));
          alert("Please login first to purchase");
        } else {
          alert(data.message || "Failed to process order");
        }
      }
    } catch (err) {
      console.error("Buy Now error:", err);
      alert("Failed to process order. Please try again.");
    } finally {
      setBuyingNow(null);
    }
  };

  if (loading) {
    return (
      <section className="py-20 px-4 bg-gray-50" id="products">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="h-12 w-48 bg-gray-200 rounded-lg mx-auto mb-4"></div>
            <div className="h-4 w-72 bg-gray-200 rounded-lg mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 h-96 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-green-50/30" id="products">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <div className="h-1 w-20 bg-green-500 rounded-full"></div>
            <span className="text-green-600 font-semibold text-sm uppercase tracking-widest">
              AL KISSAN Selection
            </span>
            <div className="h-1 w-20 bg-green-500 rounded-full"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our <span className="text-green-700">Products</span>
          </h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto font-medium">
            Shop Our Natural Products for a Healthier Lifestyle
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => {
            const isHovered = hoveredCard === index;
            const inCart = isInCart(product.id);
            const isAdding = addingToCart === product.id;
            const isBuying = buyingNow === product.id;

            return (
              <div
                key={index}
                className="group relative"
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className={`relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-green-100 ${isHovered ? "scale-[1.02] ring-2 ring-green-100" : ""}`}>
                  <div className="absolute top-4 left-4 z-20">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                      NATURAL
                    </div>
                  </div>

                  <a href={`/product/${product.name?.replace(/\s+/g, "-").toLowerCase() || "product"}`}>
                    <div className="relative w-full h-72 overflow-hidden bg-white">
                      <img
                        src={product.image || "/default-product.jpg"}
                        alt={product.name || "Product"}
                        className={`w-full h-full object-contain p-8 transition-transform duration-700 ${isHovered ? "scale-110" : "scale-100"}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  </a>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1 group-hover:text-green-700 transition-colors">
                      <a href={`/product/${product.name?.replace(/\s+/g, "-").toLowerCase() || "product"}`}>
                        {product.name || "Premium Organic Product"}
                      </a>
                    </h3>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl md:text-3xl font-bold text-green-700">
                          PKR {product.price || "499"}
                        </span>
                        <span className="text-sm text-gray-500">/ pack</span>
                      </div>
                      <div className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">
                        {extractWeight(product) !== 999 ? `${extractWeight(product)} kg` : "Standard"}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => addToCart(product)}
                        disabled={inCart || isAdding}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 transform ${
                          inCart
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                            : isAdding
                            ? "bg-green-100 text-green-600 cursor-wait"
                            : isHovered
                            ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg scale-105"
                            : "bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer"
                        }`}
                      >
                        {isAdding ? (
                          <>
                            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                            Adding...
                          </>
                        ) : inCart ? (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                            Added
                          </>
                        ) : (
                          <>
                            <svg className={`w-4 h-4 ${isHovered ? "animate-pulse" : ""}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                            </svg>
                            Add to Cart
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleBuyNow(product)}
                        disabled={isBuying}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 transform ${
                          isBuying
                            ? "bg-blue-100 text-blue-600 cursor-wait"
                            : "text-white hover:shadow-lg hover:scale-105 cursor-pointer"
                        }`}
                        style={{ backgroundColor: isBuying ? undefined : "rgba(23, 47, 132, 0.89)" }}
                        onMouseEnter={(e) => { if (!isBuying) e.currentTarget.style.backgroundColor = "rgba(23, 47, 132, 1)"; }}
                        onMouseLeave={(e) => { if (!isBuying) e.currentTarget.style.backgroundColor = "rgba(23, 47, 132, 0.89)"; }}
                      >
                        {isBuying ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Buy Now
                          </>
                        )}
                      </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-xs text-gray-500">Premium Quality Assured</span>
                    </div>
                  </div>
                </div>

                <div className={`absolute -top-3 -right-3 w-6 h-6 bg-green-100 rounded-full transition-all duration-500 ${isHovered ? "scale-150 opacity-100" : "opacity-0"}`}></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
