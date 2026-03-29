"use client";

import { useEffect, useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    setToken(storedToken);
  }, []);

const fetchOrders = async () => {
  try {
    const res = await fetch(
      "/api/orders/my-orders",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
console.log("ORDERS RAW:", data);

if (data.success && Array.isArray(data.data)) {
  setOrders(data.data);
} else {
  console.error("DATA ERROR:", data);
}
  } catch (error) {
    console.error("Failed to fetch orders:", error);
  }
};

  useEffect(() => {
    if (!token) return;
    fetchOrders();
  }, [token]);

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div
              key={order._id}
              className="border p-4 rounded-lg shadow"
            >
              <p className="font-bold">Order ID: {order._id}</p>

              <p>
                Status:
                <span className="ml-2 text-blue-600">
                  {order.status}
                </span>
              </p>

              <p>
                Total: Rp {order.total_price.toLocaleString("id-ID")}
              </p>

              <div className="mt-2 text-sm">
                {order.items?.map((item: any, i: number) => (
                  <p key={i}>
                    {item.quantity}x - Rp{" "}
                    {item.price.toLocaleString("id-ID")}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}