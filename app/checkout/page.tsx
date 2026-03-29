"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface CartItem {
  _id: string;
  quantity: number;
  product_id: {
    product_name: string;
    price_per_kg: number;
  };
}

interface Address {
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  postal_code: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState<Address | null>(null);
  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("token")
      : null;

  // LOAD CART
  const fetchCart = useCallback(async () => {
    if (!token) return;

    const res = await fetch("/api/orderItems", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (data.success) setCart(data.data);
  }, [token]);

  // LOAD ADDRESS
  const fetchAddress = useCallback(async () => {
    if (!token) return;

    const user = JSON.parse(sessionStorage.getItem("user") || "{}");

    const res = await fetch(`/api/users/${user.id}/address`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (data.success) setAddress(data.data);
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const timer = setTimeout(() => {
      void fetchCart();
      void fetchAddress();
    }, 0);

    return () => clearTimeout(timer);
  }, [token, fetchCart, fetchAddress]);

  // TOTAL
  const total = cart.reduce(
    (sum, item) =>
      sum + item.quantity * item.product_id.price_per_kg,
    0
  );

  // CONFIRM ORDER
  const confirmOrder = async () => {
    try {
      const authToken = sessionStorage.getItem("token");

      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await res.json();
      console.log("CHECKOUT RES:", data);

      if (!data.success) {
        alert(data.message);
        return;
      }

      alert("Order berhasil dibuat!");
      router.push("/orders");

    } catch (err) {
      console.error(err);
    }
  };


  return (
    <div className="page-shell max-w-4xl">
      <h1 className="mb-6 text-3xl font-extrabold text-slate-900">Checkout</h1>

      {/* ADDRESS */}
      <div className="app-card mb-6 p-5">
        <h2 className="font-bold mb-2">Shipping Address</h2>

        {address ? (
          <div className="text-sm">
            <p>{address.full_name}</p>
            <p>{address.phone}</p>
            <p>{address.address_line}</p>
            <p>{address.city}, {address.postal_code}</p>
          </div>
        ) : (
          <p className="text-red-500">No address found</p>
        )}
      </div>

      {/* ITEMS */}
      <div className="app-card mb-6 p-5">
        {cart.map(item => (
          <div key={item._id} className="mb-2 flex justify-between text-sm text-slate-700">
            <span>{item.product_id.product_name} x {item.quantity}</span>
            <span>
              Rp {(item.quantity * item.product_id.price_per_kg).toLocaleString("id-ID")}
            </span>
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div className="mb-6 flex justify-between text-xl font-bold">
        <span>Total</span>
        <span>Rp {total.toLocaleString("id-ID")}</span>
      </div>

      {/* BUTTON */}
      <button
        onClick={confirmOrder}
        className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700"
      >
        Confirm Order
      </button>
    </div>
  );
}