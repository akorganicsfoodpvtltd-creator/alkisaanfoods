"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export default function DashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.email) {
      router.push("/login");
      return;
    }
    fetchOrders(user.email);
  }, []);

  const fetchOrders = async (email) => {
    try {
      const res = await fetch(`${API_URL}/orders/by-email?email=${email}`);
      const data = await res.json();
      if (res.ok) setOrders(data.orders);
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
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 && (
        <p className="text-gray-600">No orders found for your account.</p>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border rounded p-4 bg-white">
            <p className="font-semibold">Order ID: {order.order_id}</p>
            <p>Status: {order.status}</p>
            <p>Total: ₹{order.total_amount}</p>
            <div className="mt-2">
              <p className="font-medium">Items:</p>
              {order.items.map((item, i) => (
                <p key={i}>
                  {item.name} × {item.quantity}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
