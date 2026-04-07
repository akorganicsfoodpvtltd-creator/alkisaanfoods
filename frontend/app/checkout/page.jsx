"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiCheck, FiLock, FiTruck, FiShield, FiLoader, FiX, FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [emailStatus, setEmailStatus] = useState({ sent: false, error: "", message: "" });
  const [orderError, setOrderError] = useState("");
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    paymentMethod: "cod",
    saveInfo: false,
  });

  // Fetch cart items
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/cart`, { credentials: "include" });
        const data = await res.json();
        const items = data?.items || data?.cart?.items || (Array.isArray(data) ? data : []);
        setCart(items);

        if (items.length === 0 && !orderPlaced) router.push("/");
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [router, orderPlaced]);

  // Load saved info from localStorage
  useEffect(() => {
    const savedInfo = localStorage.getItem("shippingInfo");
    if (savedInfo) {
      try {
        const parsed = JSON.parse(savedInfo);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Error parsing saved info:", e);
      }
    }
  }, []);

  // Update quantity in cart
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }

    try {
     const res = await fetch(`${API_BASE}/api/cart/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quantity: newQuantity }),
      });
      
      if (res.ok) {
        setCart((prev) =>
          prev.map((item) => {
            const product = item.product || item;
            if ((product._id === itemId) || (product.id === itemId)) {
              return { ...item, quantity: newQuantity };
            }
            return item;
          })
        );
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
    const res = await fetch(`${API_BASE}/api/cart/${itemId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setCart((prev) =>
          prev.filter((item) => {
            const product = item.product || item;
            return (product._id !== itemId) && (product.id !== itemId);
          })
        );
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // Calculate totals
  const subtotal = cart.reduce((total, item) => {
    const price = parseFloat(item.price || item.product?.price || 0);
    const quantity = parseInt(item.quantity || 1);
    return total + price * quantity;
  }, 0);
  const shipping = 0;
  const total = subtotal + shipping;

  // Form validation
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    else if (formData.firstName.trim().length < 2)
      errors.firstName = "First name must be at least 2 characters";

    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    else if (formData.lastName.trim().length < 2)
      errors.lastName = "Last name must be at least 2 characters";

    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!emailRegex.test(formData.email))
      errors.email = "Please enter a valid email address";

    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    else if (formData.phone.replace(/\D/g, "").length < 4)
      errors.phone = "Phone number must be at least 4 digits";

    if (!formData.address.trim()) errors.address = "Shipping address is required";
    else if (formData.address.trim().length < 5)
      errors.address = "Address is too short (minimum 5 characters)";

    if (!formData.city.trim()) errors.city = "City is required";
    else if (formData.city.trim().length < 2) errors.city = "Please enter a valid city name";

    if (!formData.postalCode.trim()) errors.postalCode = "Postal code is required";

    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));

    if (showErrors && formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Place order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    setOrderError("");
    setEmailStatus({ sent: false, error: "", message: "" });

    // Save shipping info if checkbox is checked
    if (formData.saveInfo) {
      const { saveInfo, ...shippingData } = formData;
      localStorage.setItem("shippingInfo", JSON.stringify(shippingData));
    }

    try {
      // Prepare order data
      const orderData = {
        items: cart.map((item) => {
          const product = item.product || item;
          return {
            productId: product._id || product.id || `prod-${Date.now()}`,
            name: product.name || "Product",
            price: parseFloat(product.price || 0),
            quantity: parseInt(item.quantity || 1),
            image: product.image || "/images/default-product.jpg",
          };
        }),
        shippingInfo: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          postalCode: formData.postalCode.trim(),
        },
        totalAmount: total,
        paymentMethod: formData.paymentMethod,
      };

      console.log("📤 Sending order to backend:", orderData);
      
      // Send order to backend
      const orderResponse = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(orderData),
      });

      const orderResult = await orderResponse.json();
      
      if (orderResult.success) {
        console.log("✅ Order saved to backend:", orderResult);
        setOrderId(orderResult.orderId);
        
        // Email is sent by backend, show success message
        setEmailStatus({ 
          sent: true, 
          error: "",
          message: `Order placed successfully! Confirmation email sent to ${formData.email}`
        });
        
        // Clear cart
        try {
          await fetch(`${API_BASE}/api/cart/clear`,{ 
            method: "DELETE", 
            credentials: "include" 
          });
          console.log("✅ Cart cleared");
          window.dispatchEvent(new Event("cartUpdated"));
        } catch (err) {
          console.log("⚠️ Cart clear error:", err);
        }
        
        // Show success page
        setOrderPlaced(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setOrderError(orderResult.message || "Failed to place order");
        setIsSubmitting(false);
      }
      
    } catch (error) {
      console.error("❌ Order error:", error);
      setOrderError(error.message);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white py-12 px-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-green-100 animate-fade-in">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm animate-bounce">
                <FiCheck className="text-white text-4xl" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Order Confirmed! 🎉</h1>
              <p className="text-white/90">Thank you for your purchase</p>
            </div>

            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 bg-green-50 text-green-700 px-6 py-3 rounded-full mb-4 border border-green-200">
                  <FiTruck className="text-lg" />
                  <span className="font-bold text-xl">{orderId}</span>
                </div>
                <p className="text-gray-600 text-lg">Your order has been placed successfully!</p>

                {emailStatus.sent ? (
                  <div className="mt-6 p-5 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-green-700 font-medium">
                      ✅ {emailStatus.message}
                    </p>
                    <p className="text-green-600 text-sm mt-2">
                      Please check your inbox (and spam folder) for the confirmation email.
                    </p>
                  </div>
                ) : emailStatus.error ? (
                  <div className="mt-6 p-5 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <p className="text-yellow-700 font-medium">⚠️ Email delivery pending</p>
                    <p className="text-yellow-600 text-sm mt-1">{emailStatus.error}</p>
                    <p className="text-gray-600 text-sm mt-2">
                      Don't worry! Your order #{orderId} is confirmed and being processed.
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 p-5 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-blue-700">📧 Sending confirmation email to {formData.email}...</p>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items ({cart.length})</span>
                    <span className="font-medium">PKR {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600 font-semibold">FREE</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-bold text-lg">Total</span>
                      <span className="font-bold text-lg text-[rgba(23,47,132,0.89)]">PKR {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-4">
                <button
                  onClick={() => router.push("/")}
                  className="w-full bg-gradient-to-r from-green-600 to-[rgba(23,47,132,0.89)] text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => router.push("/account/orders")}
                  className="w-full bg-white text-[rgba(23,47,132,0.89)] border-2 border-[rgba(23,47,132,0.89)] py-4 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  Track Your Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Checkout form
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[rgba(23,47,132,0.89)] hover:text-green-700 font-medium mb-6 transition-colors"
          >
            <FiArrowLeft className="text-xl" />
            Back to Cart
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2 text-lg">Complete your purchase with secure checkout</p>
        </div>

        {orderError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 flex items-center gap-2">
              <FiX className="text-xl" />
              {orderError}
            </p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Shipping Info Form */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-green-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Information</h2>
              <form onSubmit={handlePlaceOrder} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                        showErrors && formErrors.firstName ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="John"
                    />
                    {showErrors && formErrors.firstName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <FiX className="text-xs" /> {formErrors.firstName}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                        showErrors && formErrors.lastName ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="Doe"
                    />
                    {showErrors && formErrors.lastName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <FiX className="text-xs" /> {formErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                        showErrors && formErrors.email ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="your.email@example.com"
                    />
                    {showErrors && formErrors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <FiX className="text-xs" /> {formErrors.email}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Order confirmation will be sent to this address
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                        showErrors && formErrors.phone ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="03001234567"
                    />
                    {showErrors && formErrors.phone && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <FiX className="text-xs" /> {formErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                      showErrors && formErrors.address ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="House #, Street, Area, Landmark"
                  />
                  {showErrors && formErrors.address && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <FiX className="text-xs" /> {formErrors.address}
                    </p>
                  )}
                </div>

                {/* City & Postal Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                        showErrors && formErrors.city ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="Karachi"
                    />
                    {showErrors && formErrors.city && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <FiX className="text-xs" /> {formErrors.city}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                        showErrors && formErrors.postalCode ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="75000"
                    />
                    {showErrors && formErrors.postalCode && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <FiX className="text-xs" /> {formErrors.postalCode}
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h3>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border border-gray-300 rounded-xl hover:border-green-500 cursor-pointer transition-all bg-white">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === "cod"}
                        onChange={handleInputChange}
                        className="mr-3 text-green-600 focus:ring-green-500 w-5 h-5"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Cash on Delivery</div>
                        <div className="text-sm text-gray-500">Pay when you receive your order</div>
                      </div>
                      <div className="text-3xl">💵</div>
                    </label>
                  </div>
                </div>

                {/* Save Info Checkbox */}
                <div className="flex items-center pt-4">
                  <input
                    type="checkbox"
                    name="saveInfo"
                    checked={formData.saveInfo}
                    onChange={handleInputChange}
                    className="mr-3 text-green-600 rounded focus:ring-green-500 w-5 h-5"
                    id="saveInfo"
                  />
                  <label htmlFor="saveInfo" className="text-gray-700 font-medium">
                    Save this information for next time
                  </label>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-1/3">
            <div className="sticky top-8">
              <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-green-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                {/* Cart Items */}
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map((item, index) => {
                    const product = item.product || item;
                    const itemId = product._id || product.id || index;
                    const imageUrl = product.image || "/images/default-product.jpg";
                    const quantity = item.quantity || 1;
                    const price = parseFloat(product.price || 0);
                    const itemTotal = price * quantity;

                    return (
                      <div key={index} className="flex items-center gap-3 group relative bg-gray-50 p-2 rounded-xl">
                        {/* Product Image */}
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                          <img
                            src={imageUrl}
                            alt={product.name || "Product"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/images/default-product.jpg";
                            }}
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{product.name || "Product"}</p>
                          <p className="text-sm text-green-700 font-bold">PKR {itemTotal.toFixed(2)}</p>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() => updateQuantity(itemId, quantity - 1)}
                              className="w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                              title="Decrease quantity"
                            >
                              <FiMinus className="text-xs text-gray-600" />
                            </button>
                            
                            <span className="text-sm font-medium text-gray-700 w-6 text-center">
                              {quantity}
                            </span>
                            
                            <button
                              onClick={() => updateQuantity(itemId, quantity + 1)}
                              className="w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                              title="Increase quantity"
                            >
                              <FiPlus className="text-xs text-gray-600" />
                            </button>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(itemId)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <FiTrash2 className="text-lg" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Order Totals */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">PKR {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-full">FREE</span>
                  </div>
                  <div className="pt-4 border-t-2 border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[rgba(23,47,132,0.89)]">
                          PKR {total.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Inclusive of all taxes</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting || cart.length === 0}
                  className={`w-full bg-gradient-to-r from-green-600 to-[rgba(23,47,132,0.89)] text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg mb-4 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed ${
                    isSubmitting ? 'animate-pulse' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <FiLoader className="animate-spin text-xl" />
                      <span>Processing Your Order...</span>
                    </>
                  ) : (
                    <>
                      <FiLock className="text-xl" />
                      <span>Place Order</span>
                      <span className="text-white/80">• PKR {total.toFixed(2)}</span>
                    </>
                  )}
                </button>

                {/* Security Info */}
                <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-start gap-3">
                    <FiShield className="text-green-600 text-xl mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-800">🔒 100% Secure Checkout</p>
                      <p className="text-xs text-green-700 mt-1">
                        Your payment information is encrypted and secure. We never store your credit card details.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 text-center">
                  <div className="flex justify-center gap-4 text-gray-500">
                    <span className="text-xs">✅ Secure Payment</span>
                    <span className="text-xs">🚚 Free Shipping</span>
                    <span className="text-xs">↩️ Easy Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
