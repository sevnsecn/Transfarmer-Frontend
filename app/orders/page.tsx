"use client";

import { useCallback, useEffect, useState } from "react";

interface OrderItem {
  _id?: string;
  product_id?: string;
  quantity: number;
  price: number;
  item_status?: 'pending' | 'confirmed' | 'delivered';
}

interface Order {
  _id: string;
  status: string;
  total_price: number;
  items?: OrderItem[];
}

function statusPill(status: string) {
  if (status === "delivered") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "confirmed") return "bg-sky-50 text-sky-700 border-sky-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("token")
      : null;

  const fetchOrders = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch("/api/orders/my-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const timer = setTimeout(() => {
      void fetchOrders();
    }, 0);

    return () => clearTimeout(timer);
  }, [token, fetchOrders]);

  return (
    <div className="page-shell max-w-5xl">
      <h1 className="mb-6 text-3xl font-extrabold text-slate-900">My Orders</h1>

      {orders.length === 0 ? (
        <p className="text-slate-500">No orders yet</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="app-card p-5"
            >
              <p className="font-bold text-slate-900">Order ID: {order._id}</p>

              <p className="mt-1 text-sm text-slate-700">
                Status:
                <span className={`ml-2 rounded-full border px-2 py-0.5 text-xs font-bold ${statusPill(order.status)}`}>
                  {order.status}
                </span>
              </p>

              <p className="mt-1 text-sm text-slate-700">
                Total: Rp {order.total_price.toLocaleString("id-ID")}
              </p>

              <div className="mt-3 text-sm text-slate-600">
                {order.items?.map((item, i) => (
                  <p key={item._id || i}>
                    {item.quantity}x - Rp{" "}
                    {item.price.toLocaleString("id-ID")} · status:{" "}
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${statusPill(item.item_status || "pending")}`}>
                      {item.item_status || "pending"}
                    </span>
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