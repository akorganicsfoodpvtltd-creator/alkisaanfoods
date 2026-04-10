"use client";

import { useState, useEffect, useRef } from "react";
import { 
  FaShoppingCart, FaBox, FaStore, FaDollarSign,
  FaChartLine, FaClock, FaCheckCircle, 
  FaShippingFast, FaTimesCircle, FaSearch, FaFilter,
  FaPlus, FaEdit, FaTrash, FaEye, FaDownload,
  FaMapMarkerAlt, FaPhone, FaExternalLinkAlt,
  FaArrowUp, FaArrowDown, FaSpinner, FaTimes,
  FaRupeeSign, FaWarehouse, FaUsers, FaUpload,
  FaCoins, FaImage, FaLink, FaCloudUploadAlt,
  FaCreditCard, FaMoneyBillWave, FaUser, FaEnvelope, FaHome
} from "react-icons/fa";

// API Service - Fixed endpoints
const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'your-upload-preset';

// ✅ Auth fetch wrapper — sends token on every request
const authFetch = (url, options = {}) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
};

// Cloudinary Upload Function
const uploadToCloudinary = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    const data = await response.json();
    if (data.secure_url) {
      return data.secure_url;
    } else {
      throw new Error('Upload failed: ' + (data.error?.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary: ' + error.message);
  }
};

const getCloudinaryImageUrl = (imageValue) => {
  if (!imageValue || imageValue.trim() === '') return null;
  const cleanValue = imageValue.trim();
  if (cleanValue.startsWith('http://') || cleanValue.startsWith('https://')) return cleanValue;
  if (cleanValue.startsWith('//')) return `https:${cleanValue}`;
  if (cleanValue.includes('/') && !cleanValue.includes(' ')) {
    let publicId = cleanValue.replace(/^\/+/, '');
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`;
  }
  if (!cleanValue.includes('/') && cleanValue.length > 0) {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${cleanValue}`;
  }
  return cleanValue;
};

const getDisplayImageUrl = (imageValue, fallback = '/images/placeholder-product.jpg') => {
  const url = getCloudinaryImageUrl(imageValue);
  return url || fallback;
};

const isValidCloudinaryUrl = (url) => {
  if (!url) return false;
  const cloudinaryPatterns = [
    new RegExp(`res\\.cloudinary\\.com/${CLOUDINARY_CLOUD_NAME}/image/upload`),
    new RegExp(`cloudinary\\.com/${CLOUDINARY_CLOUD_NAME}/image/upload`),
    /^[a-zA-Z0-9_\-/\.]+$/,
    /^v\d+\/[a-zA-Z0-9_\-/\.]+$/
  ];
  return cloudinaryPatterns.some(pattern => pattern.test(url));
};

const api = {
  fetchDashboardStats: async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/dashboard/stats`);
      if (!res.ok) {
        return {
          success: true,
          totalRevenue: 0, totalOrders: 0, pendingOrders: 0,
          totalProducts: 0, totalStores: 0, todayRevenue: 0,
          todayOrders: 0, revenueTrend: 0, ordersTrend: 0
        };
      }
      return await res.json();
    } catch (error) {
      return {
        success: true,
        totalRevenue: 0, totalOrders: 0, pendingOrders: 0,
        totalProducts: 0, totalStores: 0, todayRevenue: 0,
        todayOrders: 0, revenueTrend: 0, ordersTrend: 0
      };
    }
  },

  fetchProducts: async () => {
    const res = await authFetch(`${API_BASE}/api/products`);
    if (!res.ok) throw new Error(`Failed to fetch products`);
    const data = await res.json();
    return data.products || [];
  },

  addProduct: async (productData) => {
    const payload = {
      name: productData.name,
      category: productData.category,
      price: productData.price,
      description: productData.description || '',
      image: productData.image || null
    };
    const res = await authFetch(`${API_BASE}/api/products`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const responseData = await res.json();
    if (!res.ok) throw new Error(responseData.message || 'Failed to add product');
    return responseData;
  },

  updateProduct: async (id, productData) => {
    const payload = {
      name: productData.name,
      category: productData.category,
      price: productData.price,
      description: productData.description || '',
      image: productData.image || null
    };
    const res = await authFetch(`${API_BASE}/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    const responseData = await res.json();
    if (!res.ok) throw new Error(responseData.message || 'Failed to update product');
    return responseData;
  },

  deleteProduct: async (id) => {
    const res = await authFetch(`${API_BASE}/api/products/${id}`, { method: 'DELETE' });
    const responseData = await res.json();
    if (!res.ok) throw new Error(responseData.message || 'Failed to delete product');
    return responseData;
  },

  fetchStores: async () => {
    const res = await authFetch(`${API_BASE}/api/stores`);
    if (!res.ok) throw new Error(`Failed to fetch stores`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  addStore: async (storeData) => {
    const payload = {
      store_name: storeData.storeName,
      city: storeData.city,
      branch_name: storeData.branch || 'Main',
      address: storeData.address,
      phone: storeData.phone,
      latitude: storeData.latitude,
      longitude: storeData.longitude,
      store_image: storeData.storeImage || null
    };
    const res = await authFetch(`${API_BASE}/api/stores`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const responseData = await res.json();
    if (!res.ok) throw new Error(responseData.message || 'Failed to add store');
    return responseData;
  },

  updateStore: async (id, storeData) => {
    const payload = {
      store_name: storeData.storeName,
      city: storeData.city,
      branch_name: storeData.branch || 'Main',
      address: storeData.address,
      phone: storeData.phone,
      latitude: storeData.latitude,
      longitude: storeData.longitude,
      store_image: storeData.storeImage || null
    };
    const res = await authFetch(`${API_BASE}/api/stores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    const responseData = await res.json();
    if (!res.ok) throw new Error(responseData.message || 'Failed to update store');
    return responseData;
  },

  deleteStore: async (id) => {
    const res = await authFetch(`${API_BASE}/api/stores/${id}`, { method: 'DELETE' });
    const responseData = await res.json();
    if (!res.ok) throw new Error(responseData.message || 'Failed to delete store');
    return responseData;
  },

  fetchOrders: async () => {
    const res = await authFetch(`${API_BASE}/api/orders`);
    if (!res.ok) throw new Error(`Failed to fetch orders`);
    const data = await res.json();
    return data.orders || [];
  },

  updateOrderStatus: async (orderId, status) => {
    const res = await authFetch(`${API_BASE}/api/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    const responseData = await res.json();
    if (!res.ok) throw new Error(responseData.message || 'Failed to update order status');
    return responseData;
  },

  exportOrders: async () => {
    try {
      const ordersResponse = await authFetch(`${API_BASE}/api/orders`);
      if (!ordersResponse.ok) throw new Error('Failed to fetch orders for export');
      const ordersData = await ordersResponse.json();
      const orders = ordersData.orders || [];

      const formattedOrders = orders.map(order => {
        let shippingInfo = {};
        if (order.shipping_info) {
          if (typeof order.shipping_info === 'string') {
            try { shippingInfo = JSON.parse(order.shipping_info); } catch (e) { shippingInfo = {}; }
          } else { shippingInfo = order.shipping_info; }
        }
        let items = [];
        if (order.items) {
          if (typeof order.items === 'string') {
            try { items = JSON.parse(order.items); } catch (e) { items = []; }
          } else if (Array.isArray(order.items)) { items = order.items; }
        }
        const itemsString = items.map(item =>
          `${item.name || 'Product'} (x${item.quantity || 1}) - ${formatPricePKR(item.price || 0)}`
        ).join('; ');
        return {
          'Order ID': order.order_id || `ORD-${order.id}`,
          'Customer Name': `${shippingInfo.firstName || shippingInfo.first_name || ''} ${shippingInfo.lastName || shippingInfo.last_name || ''}`.trim() || 'N/A',
          'Email': shippingInfo.email || 'N/A',
          'Phone': shippingInfo.phone || 'N/A',
          'Address': shippingInfo.address || 'N/A',
          'Items': itemsString || 'No items',
          'Total Amount': formatPricePKR(order.total_amount),
          'Payment Method': order.payment_method === 'cod' ? 'Cash on Delivery' : (order.payment_method || 'N/A'),
          'Status': order.status || 'pending',
          'Order Date': order.created_at ? new Date(order.created_at).toLocaleString('en-PK') : 'N/A',
          'Last Updated': order.updated_at ? new Date(order.updated_at).toLocaleString('en-PK') : 'N/A',
          'Notes': order.notes || ''
        };
      });

      const csvContent = convertToCSV(formattedOrders);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      throw new Error('Export failed: ' + error.message);
    }
  }
};

const convertToCSV = (data) => {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header] || '';
      const escaped = value.toString().replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  return csvRows.join('\n');
};

const formatPricePKR = (price) => {
  if (price === null || price === undefined || price === '') return 'Rs. 0';
  if (typeof price === 'string' && price.includes('Rs')) return price;
  const numericPrice = typeof price === 'string'
    ? parseFloat(price.replace(/[^0-9.-]+/g, ""))
    : Number(price);
  if (isNaN(numericPrice) || numericPrice < 0) return 'Rs. 0';
  return `Rs. ${numericPrice.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

const extractNumericPrice = (price) => {
  if (price === null || price === undefined || price === '') return 0;
  if (typeof price === 'number') return price < 0 ? 0 : price;
  if (typeof price === 'string') {
    const cleaned = price.replace('Rs.', '').replace('Rs', '').replace(/,/g, '').trim();
    const parsed = parseFloat(cleaned);
    return (isNaN(parsed) || parsed < 0) ? 0 : parsed;
  }
  return 0;
};

const safeJsonParse = (data, defaultValue = {}) => {
  if (!data) return defaultValue;
  if (typeof data === 'object') return data;
  try { return JSON.parse(data); } catch (e) { return defaultValue; }
};

// StatCard Component
const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-600 font-medium mb-2">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        {trend !== undefined && trend !== null && trend !== 0 && (
          <div className="flex items-center">
            {trend > 0 ? <FaArrowUp className="w-3 h-3 mr-1 text-green-500" /> : <FaArrowDown className="w-3 h-3 mr-1 text-red-500" />}
            <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% from yesterday
            </span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color} shadow-sm`}>
        {title.toLowerCase().includes('revenue')
          ? <FaCoins className="w-6 h-6 text-white" />
          : <Icon className="w-6 h-6 text-white" />
        }
      </div>
    </div>
  </div>
);

// Status Badge
const StatusBadge = ({ status }) => {
  const config = {
    pending: { color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', icon: FaClock },
    processing: { color: 'bg-blue-100 text-blue-800 border border-blue-200', icon: FaClock },
    shipped: { color: 'bg-purple-100 text-purple-800 border border-purple-200', icon: FaShippingFast },
    delivered: { color: 'bg-green-100 text-green-800 border border-green-200', icon: FaCheckCircle },
    cancelled: { color: 'bg-red-100 text-red-800 border border-red-200', icon: FaTimesCircle }
  };
  const { color, icon: Icon } = config[status] || { color: 'bg-gray-100 text-gray-800 border border-gray-200', icon: FaClock };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3 mr-1.5" />
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
    </span>
  );
};

// Payment Method Badge
const PaymentMethodBadge = ({ method }) => {
  const config = {
    cod: { color: 'bg-emerald-100 text-emerald-800 border border-emerald-200', icon: FaMoneyBillWave, label: 'Cash on Delivery' },
    card: { color: 'bg-blue-100 text-blue-800 border border-blue-200', icon: FaCreditCard, label: 'Credit Card' },
    credit_card: { color: 'bg-blue-100 text-blue-800 border border-blue-200', icon: FaCreditCard, label: 'Credit Card' }
  };
  const normalizedMethod = method?.toLowerCase() || 'cod';
  const { color, icon: Icon, label } = config[normalizedMethod] || { color: 'bg-gray-100 text-gray-800 border border-gray-200', icon: FaCreditCard, label: method || 'Unknown' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3 mr-1" />{label}
    </span>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  const modalRef = useRef(null);
  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  const sizeClasses = { sm: 'max-w-lg', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-5xl' };
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <div ref={modalRef} className={`relative transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all w-full ${sizeClasses[size]} z-10`}>
          <div className="sticky top-0 z-10 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};

// Order Details Modal
const OrderDetailsModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;
  const shippingInfo = safeJsonParse(order.shipping_info, {});
  const items = safeJsonParse(order.items, []);
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Order Details - ${order.order_id}`} size="lg">
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div><p className="text-sm text-gray-600 mb-1">Order Status</p><StatusBadge status={order.status} /></div>
          <div><p className="text-sm text-gray-600 mb-1">Payment Method</p><PaymentMethodBadge method={order.payment_method} /></div>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center"><FaUser className="w-4 h-4 mr-2 text-blue-600" />Customer Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div><p className="text-sm text-gray-600">Name</p><p className="font-medium">{shippingInfo.firstName || shippingInfo.first_name} {shippingInfo.lastName || shippingInfo.last_name}</p></div>
            <div><p className="text-sm text-gray-600">Email</p><p className="font-medium">{shippingInfo.email || 'N/A'}</p></div>
            <div><p className="text-sm text-gray-600">Phone</p><p className="font-medium">{shippingInfo.phone || 'N/A'}</p></div>
            <div className="md:col-span-2"><p className="text-sm text-gray-600">Shipping Address</p><p className="font-medium">{shippingInfo.address || 'N/A'}</p></div>
          </div>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center"><FaBox className="w-4 h-4 mr-2 text-blue-600" />Order Items</h4>
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Product</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Quantity</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Price</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.length > 0 ? items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm">{item.name || 'Product'}</td>
                    <td className="px-4 py-2 text-sm">{item.quantity || 1}</td>
                    <td className="px-4 py-2 text-sm">{formatPricePKR(item.price || 0)}</td>
                    <td className="px-4 py-2 text-sm font-medium">{formatPricePKR((item.price || 0) * (item.quantity || 1))}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="px-4 py-4 text-center text-sm text-gray-500">No items found</td></tr>
                )}
              </tbody>
              <tfoot className="bg-gray-100">
                <tr>
                  <td colSpan="3" className="px-4 py-2 text-right font-medium">Total:</td>
                  <td className="px-4 py-2 font-bold text-blue-600">{order.total_amount}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center"><FaClock className="w-4 h-4 mr-2 text-blue-600" />Order Timeline</h4>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Order Created:</span>
              <span className="text-sm font-medium">{order.created_at ? new Date(order.created_at).toLocaleString('en-PK') : 'N/A'}</span>
            </div>
            {order.updated_at && order.updated_at !== order.created_at && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Updated:</span>
                <span className="text-sm font-medium">{new Date(order.updated_at).toLocaleString('en-PK')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Image Upload Component
const ImageUploadSection = ({ title, required, previewUrl, imageFile, imageUrl, onFileChange, onUrlChange, onClear, onUploadModeChange, uploadMode }) => {
  const getDisplayUrl = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) return previewUrl;
    if (imageUrl) return getCloudinaryImageUrl(imageUrl);
    return null;
  };
  const displayUrl = getDisplayUrl();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">{title} {required && '*'}</label>
        <div className="flex gap-2">
          <button type="button" onClick={() => onUploadModeChange('upload')} className={`px-3 py-1 text-sm rounded-lg ${uploadMode === 'upload' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <FaCloudUploadAlt className="inline w-3 h-3 mr-1" />Upload
          </button>
          <button type="button" onClick={() => onUploadModeChange('url')} className={`px-3 py-1 text-sm rounded-lg ${uploadMode === 'url' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <FaLink className="inline w-3 h-3 mr-1" />Paste URL
          </button>
        </div>
      </div>
      {uploadMode === 'upload' ? (
        <>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors relative">
            <div className="flex flex-col items-center justify-center">
              <FaCloudUploadAlt className="w-10 h-10 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              <input type="file" accept="image/*" onChange={onFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required={required && !imageUrl && !imageFile} />
            </div>
          </div>
          {imageFile && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <FaImage className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm text-blue-700 truncate">{imageFile.name}</span>
                <span className="text-xs text-blue-500 ml-2">({(imageFile.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
              <button type="button" onClick={onClear} className="text-red-500 hover:text-red-700"><FaTimes className="w-4 h-4" /></button>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <FaLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input type="text" value={imageUrl || ''} onChange={onUrlChange} placeholder="Enter Cloudinary URL or public ID" className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" required={required && !imageFile} />
          </div>
          {imageUrl && !isValidCloudinaryUrl(imageUrl) && (
            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
              Warning: This doesn't look like a valid Cloudinary URL.
            </div>
          )}
        </div>
      )}
      {displayUrl && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
          <div className="relative w-full max-w-xs h-48 border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50">
            <img src={displayUrl} alt="Preview" className="w-full h-full object-contain" onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.jpg'; }} />
            <button type="button" onClick={onClear} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"><FaTimes className="w-3 h-3" /></button>
          </div>
        </div>
      )}
    </div>
  );
};

// Add Store Form
const AddStoreForm = ({ isOpen, onClose, editingStore, storeForm, setStoreForm, handleSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadMode, setUploadMode] = useState('upload');

  useEffect(() => {
    if (editingStore) {
      setStoreForm({
        storeName: editingStore['Store Name'] || editingStore.store_name || '',
        city: editingStore.City || editingStore.city || '',
        branch: editingStore['Branch Name'] || editingStore.branch_name || '',
        address: editingStore.Address || editingStore.address || '',
        phone: editingStore['Phone Number'] || editingStore.phone || '',
        latitude: editingStore.Latitude || editingStore.latitude || '',
        longitude: editingStore.Longitude || editingStore.longitude || '',
        storeImage: editingStore['Store Image'] || editingStore.store_image || ''
      });
      const imageUrl = editingStore['Store Image'] || editingStore.store_image;
      if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('//') || imageUrl.includes('/'))) {
        setUploadMode('url');
        setPreviewUrl(getCloudinaryImageUrl(imageUrl) || imageUrl);
      }
    }
  }, [editingStore, setStoreForm]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setPreviewUrl(URL.createObjectURL(file)); setStoreForm(prev => ({ ...prev, storeImage: '' })); }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setStoreForm(prev => ({ ...prev, storeImage: url }));
    if (url && url.trim() !== '') { setPreviewUrl(getCloudinaryImageUrl(url) || url); setImageFile(null); }
    else setPreviewUrl("");
  };

  const clearImage = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setImageFile(null); setPreviewUrl(""); setStoreForm(prev => ({ ...prev, storeImage: '' }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalImageUrl = storeForm.storeImage;
      if (imageFile) {
        try { finalImageUrl = await uploadToCloudinary(imageFile); }
        catch (uploadError) { alert('Failed to upload image: ' + uploadError.message); setLoading(false); return; }
      }
      await handleSubmit(e, { ...storeForm, branch: storeForm.branch || 'Main', storeImage: finalImageUrl || null });
    } catch (error) { alert('Error: ' + error.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { return () => { if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl); }; }, [previewUrl]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingStore ? "Edit Store Branch" : "Add New Store"} size="lg">
      <form onSubmit={handleFormSubmit}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store Name *</label>
              <input type="text" required value={storeForm.storeName} onChange={(e) => setStoreForm({...storeForm, storeName: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" placeholder="e.g., Al Kissan Foods" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
              <input type="text" required value={storeForm.city} onChange={(e) => setStoreForm({...storeForm, city: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" placeholder="e.g., Karachi" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
              <input type="text" value={storeForm.branch} onChange={(e) => setStoreForm({...storeForm, branch: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" placeholder="e.g., Main Branch (optional)" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input type="tel" required value={storeForm.phone} onChange={(e) => setStoreForm({...storeForm, phone: e.target.value})} className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" placeholder="e.g., +92 300 1234567" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
              <textarea required value={storeForm.address} onChange={(e) => setStoreForm({...storeForm, address: e.target.value})} rows="3" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" placeholder="Full store address" />
            </div>
            <div className="md:col-span-2">
              <ImageUploadSection title="Store Image" required={!editingStore} previewUrl={previewUrl} imageFile={imageFile} imageUrl={storeForm.storeImage} onFileChange={handleImageChange} onUrlChange={handleImageUrlChange} onClear={clearImage} onUploadModeChange={setUploadMode} uploadMode={uploadMode} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Latitude *</label>
              <input type="number" step="any" required value={storeForm.latitude} onChange={(e) => setStoreForm({...storeForm, latitude: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" placeholder="e.g., 24.8607" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Longitude *</label>
              <input type="number" step="any" required value={storeForm.longitude} onChange={(e) => setStoreForm({...storeForm, longitude: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" placeholder="e.g., 67.0011" />
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button type="button" onClick={onClose} disabled={loading} className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={loading} className={`px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:shadow-lg font-medium transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {loading ? <span className="flex items-center"><FaSpinner className="w-4 h-4 mr-2 animate-spin" />{editingStore ? "Updating..." : "Adding..."}</span> : editingStore ? "Update Store" : "Add Store"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

// Add Product Form
const AddProductForm = ({ isOpen, onClose, editingProduct, productForm, setProductForm, handleSubmit }) => {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState('upload');

  useEffect(() => {
    if (editingProduct && editingProduct.image) {
      const imageUrl = editingProduct.image;
      setProductForm(prev => ({ ...prev, image: imageUrl }));
      if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('//') || imageUrl.includes('/'))) {
        setUploadMode('url');
        setPreviewUrl(getCloudinaryImageUrl(imageUrl) || imageUrl);
      }
    }
  }, [editingProduct, setProductForm]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setPreviewUrl(URL.createObjectURL(file)); setProductForm(prev => ({ ...prev, image: '' })); }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setProductForm(prev => ({ ...prev, image: url }));
    if (url && url.trim() !== '') { setPreviewUrl(getCloudinaryImageUrl(url) || url); setImageFile(null); }
    else setPreviewUrl("");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let finalImageUrl = productForm.image;
      if (imageFile) {
        try { finalImageUrl = await uploadToCloudinary(imageFile); }
        catch (uploadError) { alert('Failed to upload image: ' + uploadError.message); setUploading(false); return; }
      }
      await handleSubmit(e, { name: productForm.name, category: productForm.category, price: parseFloat(productForm.price) || 0, description: productForm.description || '', image: finalImageUrl || null });
    } catch (error) { alert('Error: ' + error.message); }
    finally { setUploading(false); }
  };

  const clearImage = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setImageFile(null); setPreviewUrl(""); setProductForm(prev => ({ ...prev, image: '' }));
  };

  useEffect(() => { return () => { if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl); }; }, [previewUrl]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingProduct ? "Edit Product" : "Add New Product"} size="lg">
      <form onSubmit={handleFormSubmit}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
              <input type="text" required value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" placeholder="e.g., Organic Basmati Rice 5kg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <input type="text" required value={productForm.category} onChange={(e) => setProductForm({...productForm, category: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" placeholder="e.g., Rice & Grains" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (Rs.) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">Rs.</span>
                <input type="number" required min="0" step="any" value={productForm.price} onChange={(e) => setProductForm({...productForm, price: e.target.value})} className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" placeholder="e.g., 499" />
              </div>
            </div>
            <div className="md:col-span-2">
              <ImageUploadSection title="Product Image" required={!editingProduct} previewUrl={previewUrl} imageFile={imageFile} imageUrl={productForm.image} onFileChange={handleImageChange} onUrlChange={handleImageUrlChange} onClear={clearImage} onUploadModeChange={setUploadMode} uploadMode={uploadMode} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
              <textarea value={productForm.description || ''} onChange={(e) => setProductForm({...productForm, description: e.target.value})} rows="3" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" placeholder="Product description..." />
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button type="button" onClick={onClose} disabled={uploading} className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={uploading} className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg font-medium transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {uploading ? <span className="flex items-center"><FaSpinner className="w-4 h-4 mr-2 animate-spin" />{editingProduct ? "Updating..." : "Adding..."}</span> : editingProduct ? "Update Product" : "Add Product"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

// Order Items Row
const OrderItemsRow = ({ items }) => {
  const parsedItems = safeJsonParse(items, []);
  if (parsedItems.length === 0) return <span className="text-gray-400 text-sm">No items</span>;
  return (
    <div className="space-y-1 max-w-xs">
      {parsedItems.slice(0, 2).map((item, index) => (
        <div key={index} className="text-sm flex justify-between items-center">
          <span className="truncate max-w-[150px]">{item.name || 'Product'}</span>
          <span className="text-gray-600 ml-2 whitespace-nowrap">x{item.quantity || 1}</span>
        </div>
      ))}
      {parsedItems.length > 2 && <div className="text-xs text-gray-500 mt-1">+{parsedItems.length - 2} more items</div>}
    </div>
  );
};

// ✅ Main Admin Dashboard Component
export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddStore, setShowAddStore] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingStore, setEditingStore] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0, totalOrders: 0, pendingOrders: 0,
    totalProducts: 0, totalStores: 0, todayRevenue: 0,
    todayOrders: 0, revenueTrend: 0, ordersTrend: 0
  });

  const [storeForm, setStoreForm] = useState({ storeName: "", city: "", branch: "", address: "", phone: "", latitude: "", longitude: "", storeImage: "" });
  const [productForm, setProductForm] = useState({ name: "", category: "", price: "", description: "", image: "" });

  // ✅ AUTH CHECK — runs first before anything else
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');

    if (tokenFromUrl) {
      // Token came from Google OAuth redirect
      localStorage.setItem('authToken', tokenFromUrl);
      window.history.replaceState({}, document.title, '/admin/dashboard');

      try {
        const payload = JSON.parse(atob(tokenFromUrl.split('.')[1]));
        if (payload.role !== 'admin') {
          window.location.href = '/';
          return;
        }
        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem('authToken');
          window.location.href = '/';
          return;
        }
        // Valid admin token from URL — proceed
        setAuthChecking(false);
        fetchData();
        return;
      } catch (e) {
        console.error('Token decode error:', e);
        window.location.href = '/';
        return;
      }
    }

    // No token in URL — check localStorage
    const savedToken = localStorage.getItem('authToken');
    if (!savedToken) {
      window.location.href = '/';
      return;
    }

    try {
      const payload = JSON.parse(atob(savedToken.split('.')[1]));
      if (payload.role !== 'admin') {
        localStorage.removeItem('authToken');
        window.location.href = '/';
        return;
      }
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('authToken');
        window.location.href = '/';
        return;
      }
      // Valid admin token in localStorage — proceed
      setAuthChecking(false);
      fetchData();
    } catch (e) {
      console.error('Saved token invalid:', e);
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsData, statsData, storesData, ordersData] = await Promise.allSettled([
        api.fetchProducts(),
        api.fetchDashboardStats(),
        api.fetchStores(),
        api.fetchOrders()
      ]);

      if (productsData.status === 'fulfilled') {
        setProducts(productsData.value.map(product => ({
          id: product.id,
          name: product.name,
          category: product.category,
          price: formatPricePKR(product.price),
          originalPrice: product.price,
          image: product.image,
          displayImage: getDisplayImageUrl(product.image, '/images/placeholder-product.jpg'),
          description: product.description || ''
        })));
      }

      if (statsData.status === 'fulfilled') {
        const statsValue = statsData.value;
        const pendingOrdersCount = ordersData.status === 'fulfilled' ? (Array.isArray(ordersData.value) ? ordersData.value.filter(o => o.status === 'pending').length : 0) : 0;
        const totalStoresCount = storesData.status === 'fulfilled' ? (Array.isArray(storesData.value) ? storesData.value.length : 0) : 0;
        const totalRevenue = ordersData.status === 'fulfilled' && Array.isArray(ordersData.value)
          ? ordersData.value.filter(o => o.status === 'delivered').reduce((sum, order) => sum + extractNumericPrice(order.total_amount), 0) : 0;
        setStats({
          totalRevenue: statsValue.totalRevenue || totalRevenue,
          totalOrders: statsValue.totalOrders || (ordersData.status === 'fulfilled' ? ordersData.value.length : 0),
          pendingOrders: statsValue.pendingOrders || pendingOrdersCount,
          totalProducts: statsValue.totalProducts || 0,
          totalStores: statsValue.totalStores || totalStoresCount,
          todayRevenue: statsValue.todayRevenue || 0,
          todayOrders: statsValue.todayOrders || 0,
          revenueTrend: statsValue.revenueTrend || 0,
          ordersTrend: statsValue.ordersTrend || 0
        });
      }

      if (storesData.status === 'fulfilled') {
        setStores(storesData.value.map(store => ({
          id: store.id,
          'Store Name': store.store_name || store['Store Name'],
          City: store.city || store.City,
          'Branch Name': store.branch_name || store.Branch || 'Main',
          Address: store.address || store.Address,
          'Phone Number': store.phone || store['Phone Number'],
          Latitude: store.latitude || store.Latitude,
          Longitude: store.longitude || store.Longitude,
          store_image: store.store_image,
          'Store Image': store.store_image
        })));
      }

      if (ordersData.status === 'fulfilled') {
        setOrders(ordersData.value.map(order => {
          let shippingInfo = {};
          if (order.shipping_info) {
            if (typeof order.shipping_info === 'string') {
              try { shippingInfo = JSON.parse(order.shipping_info); } catch (e) { shippingInfo = {}; }
            } else { shippingInfo = order.shipping_info; }
          }
          let items = [];
          if (order.items) {
            if (typeof order.items === 'string') {
              try { items = JSON.parse(order.items); } catch (e) { items = []; }
            } else if (Array.isArray(order.items)) { items = order.items; }
          }
          return {
            id: order.id,
            order_id: order.order_id || `ORD-${order.id}`,
            items, items_raw: order.items,
            total_amount: formatPricePKR(order.total_amount),
            shipping_info: shippingInfo,
            status: order.status || 'pending',
            payment_method: order.payment_method || 'cod',
            created_at: order.created_at || new Date().toISOString(),
            updated_at: order.updated_at,
            notes: order.notes
          };
        }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStore = async (e, storeData) => {
    e.preventDefault();
    try {
      if (editingStore) {
        const result = await api.updateStore(editingStore.id, storeData);
        alert(result.message || "Store updated successfully!");
        setEditingStore(null);
      } else {
        const result = await api.addStore(storeData);
        alert(result.message || "Store added successfully!");
      }
      setShowAddStore(false);
      setStoreForm({ storeName: "", city: "", branch: "", address: "", phone: "", latitude: "", longitude: "", storeImage: "" });
      fetchData();
    } catch (error) { alert(`Error: ${error.message}`); }
  };

  const handleAddProduct = async (e, productData) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const result = await api.updateProduct(editingProduct.id, productData);
        alert(result.message || "Product updated successfully!");
        setEditingProduct(null);
      } else {
        const result = await api.addProduct(productData);
        alert(result.message || "Product added successfully!");
      }
      setShowAddProduct(false);
      setProductForm({ name: "", category: "", price: "", description: "", image: "" });
      fetchData();
    } catch (error) { alert(`Error: ${error.message}`); }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({ name: product.name, category: product.category, price: extractNumericPrice(product.price), description: product.description || "", image: product.image });
    setShowAddProduct(true);
  };

  const handleDeleteProduct = async (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try { const result = await api.deleteProduct(id); alert(result.message || "Deleted!"); fetchData(); }
      catch (error) { alert(error.message || "Failed to delete product"); }
    }
  };

  const handleEditStore = (store) => { setEditingStore(store); setShowAddStore(true); };

  const handleDeleteStore = async (id) => {
    if (confirm("Are you sure you want to delete this store?")) {
      try { const result = await api.deleteStore(id); alert(result.message || "Deleted!"); fetchData(); }
      catch (error) { alert(error.message || "Failed to delete store"); }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try { const result = await api.updateOrderStatus(orderId, newStatus); alert(result.message || "Status updated!"); fetchData(); }
    catch (error) { alert(error.message || "Failed to update order status"); }
  };

  const handleExportOrders = async () => {
    try { await api.exportOrders(); alert("Orders exported successfully!"); }
    catch (error) { alert("Error exporting orders: " + error.message); }
  };

  const filteredOrders = selectedStatus === "all" ? orders : orders.filter(order => order.status === selectedStatus);
  const filteredProducts = searchTerm ? products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase())) : products;
  const filteredStores = searchTerm ? stores.filter(s => (s['Store Name'] || '').toLowerCase().includes(searchTerm.toLowerCase()) || (s.City || '').toLowerCase().includes(searchTerm.toLowerCase())) : stores;

  // Show auth checking spinner
  if (authChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FaShoppingCart className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-lg font-semibold text-gray-700">Loading Dashboard</p>
          <p className="mt-2 text-sm text-gray-500">Fetching your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="px-8 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your e-commerce platform</p>
            </div>
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search products, orders, stores..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-80 pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setEditingProduct(null); setProductForm({ name: "", category: "", price: "", description: "", image: "" }); setShowAddProduct(true); }} className="flex items-center px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 font-medium shadow-sm hover:shadow-blue-200">
                  <FaPlus className="w-4 h-4 mr-2" />Add Product
                </button>
                <button onClick={() => { setEditingStore(null); setStoreForm({ storeName: "", city: "", branch: "", address: "", phone: "", latitude: "", longitude: "", storeImage: "" }); setShowAddStore(true); }} className="flex items-center px-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 font-medium shadow-sm hover:shadow-emerald-200">
                  <FaPlus className="w-4 h-4 mr-2" />Add Store
                </button>
                <button onClick={() => { localStorage.removeItem('authToken'); window.location.href = '/'; }} className="flex items-center px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all font-medium">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-8">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Revenue" value={formatPricePKR(stats.totalRevenue)} trend={stats.revenueTrend} color="bg-gradient-to-r from-emerald-500 to-emerald-600" />
            <StatCard title="Total Orders" value={stats.totalOrders} icon={FaShoppingCart} trend={stats.ordersTrend} color="bg-gradient-to-r from-blue-500 to-blue-600" />
            <StatCard title="Pending Orders" value={stats.pendingOrders} icon={FaClock} color="bg-gradient-to-r from-amber-500 to-amber-600" />
            <StatCard title="Total Products" value={products.length} icon={FaBox} color="bg-gradient-to-r from-purple-500 to-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {['overview', 'orders', 'products', 'stores'].map((tab) => (
                <button key={tab} className={`px-8 py-4 font-medium text-sm whitespace-nowrap transition-all ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600 bg-gradient-to-t from-blue-50 to-transparent' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`} onClick={() => setActiveTab(tab)}>
                  <span className="flex items-center">
                    {tab === 'overview' && <FaChartLine className="w-4 h-4 mr-2" />}
                    {tab === 'orders' && <FaShoppingCart className="w-4 h-4 mr-2" />}
                    {tab === 'products' && <FaBox className="w-4 h-4 mr-2" />}
                    {tab === 'stores' && <FaStore className="w-4 h-4 mr-2" />}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Order Management</h3>
                  <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <div className="flex items-center gap-2">
                      <FaFilter className="text-gray-400" />
                      <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none transition">
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <button onClick={handleExportOrders} className="flex items-center px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:shadow-lg transition-all shadow-sm">
                      <FaDownload className="w-4 h-4 mr-2" />Export Excel
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        {['Order ID', 'Customer', 'Items', 'Amount', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                          <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredOrders.length > 0 ? filteredOrders.map((order) => {
                        const shippingInfo = order.shipping_info || {};
                        const customerName = `${shippingInfo.firstName || shippingInfo.first_name || ''} ${shippingInfo.lastName || shippingInfo.last_name || ''}`.trim() || 'N/A';
                        return (
                          <tr key={order.id} className="hover:bg-blue-50/50 transition-colors">
                            <td className="px-6 py-4"><span className="font-bold text-blue-600">{order.order_id}</span></td>
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900 flex items-center"><FaUser className="w-3 h-3 mr-1 text-gray-400" />{customerName}</div>
                              <div className="text-sm text-gray-600 flex items-center mt-1"><FaEnvelope className="w-3 h-3 mr-1 text-gray-400" />{shippingInfo.email || 'N/A'}</div>
                              <div className="text-sm text-gray-600 flex items-center mt-1"><FaPhone className="w-3 h-3 mr-1 text-gray-400" />{shippingInfo.phone || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4"><OrderItemsRow items={order.items_raw} /></td>
                            <td className="px-6 py-4"><div className="font-bold text-gray-900">{order.total_amount}</div></td>
                            <td className="px-6 py-4"><PaymentMethodBadge method={order.payment_method} /></td>
                            <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{order.created_at ? new Date(order.created_at).toLocaleDateString('en-PK') : 'N/A'}</div>
                              <div className="text-xs text-gray-500">{order.created_at ? new Date(order.created_at).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <select value={order.status || 'pending'} onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)} className="text-sm border-2 border-gray-200 rounded-lg px-3 py-1.5 focus:border-blue-500 outline-none transition">
                                  <option value="pending">Pending</option>
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                                <button onClick={() => { setSelectedOrder(order); setShowOrderDetails(true); }} className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><FaEye /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr><td colSpan="8" className="px-6 py-8 text-center text-gray-500">No orders found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Product Inventory</h3>
                  <div className="text-sm text-gray-600">{filteredProducts.length} products found</div>
                </div>
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => {
                      const displayImage = getDisplayImageUrl(product.image, '/images/placeholder-product.jpg');
                      return (
                        <div key={product.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                          <div className="relative">
                            <div className="h-48 overflow-hidden rounded-t-xl">
                              <img src={displayImage} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-product.jpg'; }} />
                            </div>
                            <div className="absolute top-3 right-3 flex gap-2">
                              <button onClick={() => handleEditProduct(product)} className="p-2 bg-white/90 backdrop-blur-sm text-gray-700 hover:text-blue-600 hover:bg-white rounded-lg transition-colors shadow-sm"><FaEdit /></button>
                              <button onClick={() => handleDeleteProduct(product.id)} className="p-2 bg-white/90 backdrop-blur-sm text-gray-700 hover:text-red-600 hover:bg-white rounded-lg transition-colors shadow-sm"><FaTrash /></button>
                            </div>
                          </div>
                          <div className="p-5">
                            <h4 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">{product.name}</h4>
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">{product.category}</span>
                            <p className="text-2xl font-bold text-gray-900 mt-3">{product.price}</p>
                            {product.description && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaBox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-700 mb-2">No Products Found</h4>
                    <button onClick={() => { setEditingProduct(null); setProductForm({ name: "", category: "", price: "", description: "", image: "" }); setShowAddProduct(true); }} className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium mt-4">
                      <FaPlus className="w-4 h-4 mr-2" />Add Product
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Stores Tab */}
            {activeTab === 'stores' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Store Locations</h3>
                  <div className="text-sm text-gray-600">{filteredStores.length} stores found</div>
                </div>
                {filteredStores.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStores.map((store, index) => {
                      const displayImage = getDisplayImageUrl(store['Store Image'], '/images/placeholder-store.jpg');
                      return (
                        <div key={store.id || index} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                          <div className="relative">
                            <div className="h-40 overflow-hidden rounded-t-xl">
                              <img src={displayImage} alt={store['Store Name']} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-store.jpg'; }} />
                            </div>
                            <div className="absolute top-3 right-3 flex gap-2">
                              <button onClick={() => handleEditStore(store)} className="p-2 bg-white/90 backdrop-blur-sm text-gray-700 hover:text-blue-600 hover:bg-white rounded-lg transition-colors shadow-sm"><FaEdit /></button>
                              <button onClick={() => handleDeleteStore(store.id)} className="p-2 bg-white/90 backdrop-blur-sm text-gray-700 hover:text-red-600 hover:bg-white rounded-lg transition-colors shadow-sm"><FaTrash /></button>
                            </div>
                          </div>
                          <div className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                              <div className={`p-2 rounded-lg ${(store['Branch Name'] === 'Main' || !store['Branch Name']) ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}><FaStore className="w-5 h-5" /></div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-lg">{store['Store Name']}</h4>
                                <div className="flex items-center text-gray-600 mt-1"><FaMapMarkerAlt className="w-4 h-4 mr-2" /><span>{store.City}</span></div>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center text-gray-600"><FaPhone className="w-4 h-4 mr-2 flex-shrink-0" /><span className="truncate">{store['Phone Number']}</span></div>
                              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg"><FaHome className="w-4 h-4 inline mr-2 text-gray-400" />{store.Address}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaStore className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-700 mb-2">No Stores Found</h4>
                    <button onClick={() => { setEditingStore(null); setStoreForm({ storeName: "", city: "", branch: "", address: "", phone: "", latitude: "", longitude: "", storeImage: "" }); setShowAddStore(true); }} className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-medium mt-4">
                      <FaPlus className="w-4 h-4 mr-2" />Add Store
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
                      <button onClick={() => setActiveTab('orders')} className="text-sm text-blue-600 hover:text-blue-800 font-medium">View all →</button>
                    </div>
                    <div className="space-y-4">
                      {orders.slice(0, 5).length > 0 ? orders.slice(0, 5).map((order) => {
                        const shippingInfo = order.shipping_info || {};
                        const customerName = `${shippingInfo.firstName || shippingInfo.first_name || ''} ${shippingInfo.lastName || shippingInfo.last_name || ''}`.trim() || 'N/A';
                        return (
                          <div key={order.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                            <div>
                              <div className="font-medium text-gray-900">{order.order_id}</div>
                              <div className="text-sm text-gray-600 flex items-center mt-1"><FaUser className="w-3 h-3 mr-1 text-gray-400" />{customerName}</div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <StatusBadge status={order.status} />
                              <span className="font-medium text-gray-900">{order.total_amount}</span>
                            </div>
                          </div>
                        );
                      }) : <div className="text-center py-8 text-gray-500">No recent orders</div>}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900">Recent Products</h3>
                      <button onClick={() => setActiveTab('products')} className="text-sm text-blue-600 hover:text-blue-800 font-medium">View all →</button>
                    </div>
                    <div className="space-y-4">
                      {products.slice(0, 4).length > 0 ? products.slice(0, 4).map((product) => {
                        const displayImage = getDisplayImageUrl(product.image, '/images/placeholder-product.jpg');
                        return (
                          <div key={product.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center">
                              <div className="w-12 h-12 rounded-lg overflow-hidden mr-3">
                                <img src={displayImage} alt={product.name} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-product.jpg'; }} />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 line-clamp-1">{product.name}</div>
                                <div className="text-sm text-gray-600">{product.category}</div>
                              </div>
                            </div>
                            <div className="font-bold text-gray-900">{product.price}</div>
                          </div>
                        );
                      }) : <div className="text-center py-8 text-gray-500">No products available</div>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <AddStoreForm isOpen={showAddStore} onClose={() => { setShowAddStore(false); setEditingStore(null); setStoreForm({ storeName: "", city: "", branch: "", address: "", phone: "", latitude: "", longitude: "", storeImage: "" }); }} editingStore={editingStore} storeForm={storeForm} setStoreForm={setStoreForm} handleSubmit={handleAddStore} />
      <AddProductForm isOpen={showAddProduct} onClose={() => { setShowAddProduct(false); setEditingProduct(null); setProductForm({ name: "", category: "", price: "", description: "", image: "" }); }} editingProduct={editingProduct} productForm={productForm} setProductForm={setProductForm} handleSubmit={handleAddProduct} />
      <OrderDetailsModal isOpen={showOrderDetails} onClose={() => { setShowOrderDetails(false); setSelectedOrder(null); }} order={selectedOrder} />
    </div>
  );
}
