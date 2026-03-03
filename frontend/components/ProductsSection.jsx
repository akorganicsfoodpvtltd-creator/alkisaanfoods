"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProductsSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [addingToCart, setAddingToCart] = useState(null);
  const [buyingNow, setBuyingNow] = useState(null);
  const router = useRouter();

  // Extract weight from product name or description for sorting
  const extractWeight = (product) => {
    // Look for weight patterns like "1 kg", "2.5kg", "5 kg", etc.
    const weightPattern = /(\d+(?:\.\d+)?)\s*(?:kg|KG|Kg|kgs|KGS)/i;
    const name = product.name || "";
    const description = product.description || "";
    
    const nameMatch = name.match(weightPattern);
    if (nameMatch) return parseFloat(nameMatch[1]);
    
    const descMatch = description.match(weightPattern);
    if (descMatch) return parseFloat(descMatch[1]);
    
    // Default weight for products without specified weight
    return 999; // Put at the end
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products");
        const data = await res.json();
        let productsList = data.products || [];
        
        // Sort products by weight: 1kg, 2kg, 2.5kg, 5kg, then others
        productsList.sort((a, b) => {
          const weightA = extractWeight(a);
          const weightB = extractWeight(b);
          return weightA - weightB;
        });
        
        setProducts(productsList);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Fetch cart from session
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/cart", { credentials: 'include' });
        const data = await res.json();
        if (data.success) setCartItems(data.items || []);
      } catch (err) {
        console.error("Failed to fetch cart:", err);
      }
    };
    fetchCart();
  }, []);

  // Listen for cart removal events to enable Add to Cart button
  useEffect(() => {
    const handleEnableAddToCart = (event) => {
      const productId = event.detail?.productId;
      if (productId) {
        setCartItems(prev => prev.filter(item => item.product_id !== productId));
      }
    };
    
    window.addEventListener('enableAddToCart', handleEnableAddToCart);
    
    return () => {
      window.removeEventListener('enableAddToCart', handleEnableAddToCart);
    };
  }, []);

  const isInCart = (productId) => cartItems.some(item => item.product_id === productId);

  const addToCart = async (product) => {
    setAddingToCart(product.id);
    try {
      const res = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      const data = await res.json();

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
        
        window.dispatchEvent(new CustomEvent('cartItemAdded', {
          detail: {
            productName: product.name,
            quantity: 1
          }
        }));
        
      } else {
        alert(data.message || "Failed to add to cart");
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  const handleBuyNow = async (product) => {
    setBuyingNow(product.id);
    try {
      // First add to cart
      const res = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      const data = await res.json();

      if (data.success) {
        // Update local cart state
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
        
        // Redirect to checkout page
      router.push("/checkout");

      } else {
        alert(data.message || "Failed to process order");
      }
    } catch (err) {
      console.error("Buy Now error:", err);
      alert("Failed to process order");
    } finally {
      setBuyingNow(null);
    }
  };

  if (loading) {
    return (
      <section className="py-20 px-4 bg-white" id="products">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="h-12 w-48 bg-gray-200 rounded-lg mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 w-72 bg-gray-200 rounded-lg mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-3xl p-6 h-96 animate-pulse shadow-lg">
                <div className="w-full h-48 bg-gray-200 rounded-2xl mb-4"></div>
                <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-1/2 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-green-50" id="products">
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
            Our <span className="text-green-700">Premium Products</span>
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
            const weight = extractWeight(product);

            return (
              <div
                key={product.id || index}
                className="group relative"
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div
                  className={`relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-green-100 ${
                    isHovered ? "scale-[1.02] ring-2 ring-green-200" : ""
                  }`}
                >
                  {/* Premium Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      PREMIUM
                    </div>
                  </div>

                  {/* Product Link */}
                  <a href={`/product/${product.name?.replace(/\s+/g, "-").toLowerCase() || "product"}`}>
                    <div className="relative w-full h-72 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
                      <img
                        src={product.image || "/default-product.jpg"}
                        alt={product.name || "Product"}
                        className={`w-full h-full object-contain p-8 transition-transform duration-700 ${
                          isHovered ? "scale-110" : "scale-100"
                        }`}
                        onError={(e) => {
                          e.target.src = "/default-product.jpg";
                        }}
                      />
                      {/* Overlay effect */}
                      <div className={`absolute inset-0 bg-gradient-to-t from-green-600/5 via-transparent to-transparent transition-opacity duration-500 ${
                        isHovered ? "opacity-100" : "opacity-0"
                      }`}></div>
                    </div>
                  </a>

                  {/* Product Details */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1">
                      <a 
                        href={`/product/${product.name?.replace(/\s+/g, "-").toLowerCase() || "product"}`}
                        className={`hover:text-green-700 transition-colors duration-300 ${
                          isHovered ? "text-green-700" : ""
                        }`}
                      >
                        {product.name || "Premium Organic Product"}
                      </a>
                    </h3>

                    {/* Price and Weight */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl md:text-3xl font-bold text-gray-900">
                          PKR {product.price?.toLocaleString() || "499"}
                        </span>
                        <span className="text-sm text-gray-500">/ pack</span>
                      </div>
                      <div className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                        {weight !== 999 ? `${weight} kg` : "Standard Pack"}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => addToCart(product)}
                        disabled={inCart || isAdding}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                          inCart
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200"
                            : isAdding
                            ? "bg-green-100 text-green-600 cursor-wait"
                            : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 hover:border-green-300 hover:shadow-md"
                        } ${isHovered && !inCart && !isAdding ? "scale-105" : ""}`}
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
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                            </svg>
                            Add to Cart
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleBuyNow(product)}
                        disabled={isBuying}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 text-white ${
                          isBuying
                            ? "bg-blue-400 cursor-wait"
                            : "bg-[#172f84] hover:bg-[#0f1f5c] hover:shadow-lg"
                        } ${isHovered && !isBuying ? "scale-105" : ""}`}
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

                    {/* Quality Assurance */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse animation-delay-200"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse animation-delay-400"></div>
                      </div>
                      <span className="text-xs text-gray-500">Premium Quality Assured</span>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className={`absolute -top-3 -right-3 w-6 h-6 bg-green-100 rounded-full transition-all duration-500 ${
                  isHovered ? "scale-150 opacity-100" : "opacity-0"
                }`}></div>
                <div className={`absolute -bottom-3 -left-3 w-4 h-4 bg-emerald-100 rounded-full transition-all duration-700 ${
                  isHovered ? "scale-150 opacity-100" : "opacity-0"
                }`}></div>
              </div>
            );
          })}
        </div>

        {/* View All Products Button */}
        {products.length > 0 && (
          <div className="text-center mt-16">
            <a
              href="/products"
              className="inline-flex items-center gap-3 bg-white text-green-700 border-2 border-green-200 px-8 py-4 rounded-xl font-semibold hover:bg-green-50 hover:border-green-300 hover:shadow-lg transition-all duration-300 group"
            >
              <span>View All Products</span>
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        )}
      </div>

      {/* Animation Keyframes */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}
