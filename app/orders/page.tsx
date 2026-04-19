"use client";

import { useCallback, useEffect, useState } from "react";

interface OrderItem {
  _id?: string;
  product_id?: string;
  product_name?: string;
  quantity: number;
  price: number;
}

interface Address {
  full_name?: string;
  phone?: string;
  address_line?: string;
  city?: string;
  postal_code?: string;
}

interface Order {
  _id: string;
  status: string;
  total_price: number;
  user_name?: string;
  address?: Address;
  items?: OrderItem[];
}

function statusPill(status: string) {
  if (status === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "delivered") return "bg-sky-50 text-sky-700 border-sky-200";
  if (status === "confirmed") return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("token")
      : null;

  const fetchOrders = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch("/api/orders/my-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const timer = setTimeout(() => { void fetchOrders(); }, 0);
    return () => clearTimeout(timer);
  }, [token, fetchOrders]);

  const handleComplete = async (orderId: string) => {
    if (!token) return;
    if (!confirm("Confirm that you have received your order?")) return;

    try {
      setCompletingId(orderId);
      const res = await fetch(`/api/orders/${orderId}/complete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        await fetchOrders();
        window.dispatchEvent(new Event("ordersUpdated"));
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Failed to complete order:", err);
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="page-shell max-w-5xl">
      <h1 className="mb-6 text-3xl font-extrabold text-slate-900">My Orders</h1>

      {orders.length === 0 ? (
        <p className="text-slate-500">No orders yet</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="app-card p-5">
              <p className="font-bold text-slate-900">Order ID: {order._id}</p>

              {order.address && (
                <div className="mt-2 text-sm text-slate-600">
                  <p className="font-semibold">Shipping Address</p>
                  <p>{order.address.full_name}</p>
                  <p>{order.address.phone}</p>
                  <p>
                    {order.address.address_line}, {order.address.city}{" "}
                    {order.address.postal_code}
                  </p>
                </div>
              )}

              <p className="mt-2 text-sm text-slate-700">
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
                    {item.quantity}x {item.product_name} — Rp{" "}
                    {item.price.toLocaleString("id-ID")}
                  </p>
                ))}
              </div>

              {order.status === "delivered" && (
                <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50 p-3 flex items-center justify-between gap-4">
                  <p className="text-sm text-sky-800">
                    Your order has been delivered! Please confirm once you've received it.
                    It will be auto-completed in 3 days if not confirmed.
                  </p>
                  <button
                    onClick={() => handleComplete(order._id)}
                    disabled={completingId === order._id}
                    className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
                  >
                    {completingId === order._id ? "Confirming..." : "Complete Order"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}