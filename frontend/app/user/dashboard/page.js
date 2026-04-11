"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export default function DashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // ✅ FIX: localStorage se authToken paro, "user" nahi
    const token = localStorage.getItem("authToken");

    if (!token) {
      router.push("/");
      return;
    }

    // ✅ Token decode karo user info lene ke liye
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      // ✅ Token expire check
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem("authToken");
        router.push("/");
        return;
      }

      // ✅ Admin ko user dashboard pe aane nahi dena
      if (payload.role === "admin") {
        router.push("/admin/dashboard");
        return;
      }

      setUser(payload);
      fetchOrders(payload.email, token);
    } catch (e) {
      console.error("Token decode error:", e);
      localStorage.removeItem("authToken");
      router.push("/");
    }
  }, []);

  const fetchOrders = async (email, token) => {
    try {
      const res = await fetch(`${API_URL}/orders/by-email?email=${email}`, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) setOrders(data.orders || []);
      else alert(data.message || "Failed to load orders");
    } catch (err) {
      console.error(err);
      alert("Error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="p-6 text-center">Loading orders...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* ✅ User ka naam dikhao */}
      {user && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="font-semibold text-green-800">
            Welcome, {user.name || user.email}!
          </p>
          <p className="text-sm text-green-600">{user.email}</p>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 && (
        <p className="text-gray-600">No orders found for your account.</p>
      )}

      <div className="space-y-4">
        {orders.map((order) => {
          // ✅ items safely parse karo
          let items = [];
          if (order.items) {
            if (typeof order.items === "string") {
              try { items = JSON.parse(order.items); } catch { items = []; }
            } else if (Array.isArray(order.items)) {
              items = order.items;
            }
          }

          return (
            <div key={order.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <p className="font-semibold text-blue-700">
                Order ID: {order.order_id || `ORD-${order.id}`}
              </p>
              <p className="text-sm mt-1">
                Status:{" "}
                <span className={`font-medium ${
                  order.status === "delivered" ? "text-green-600" :
                  order.status === "pending" ? "text-yellow-600" :
                  order.status === "cancelled" ? "text-red-600" :
                  "text-blue-600"
                }`}>
                  {order.status}
                </span>
              </p>
              <p className="text-sm mt-1">
                Total: <span className="font-bold">PKR {order.total_amount}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {order.created_at
                  ? new Date(order.created_at).toLocaleDateString("en-PK")
                  : ""}
              </p>
              {items.length > 0 && (
                <div className="mt-3 border-t pt-2">
                  <p className="font-medium text-sm mb-1">Items:</p>
                  {items.map((item, i) => (
                    <p key={i} className="text-sm text-gray-700">
                      {item.name} × {item.quantity} —{" "}
                      <span className="text-green-600">PKR {item.price}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
