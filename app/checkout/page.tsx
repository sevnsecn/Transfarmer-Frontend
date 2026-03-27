"use client";

import { useEffect, useState } from "react";

interface CartItem {
  _id: string;
  quantity: number;
  product_id: {
    product_name: string;
    price_per_kg: number;
  };
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState<any>(null);
const [token, setToken] = useState<string | null>(null);
//   const token =
//     typeof window !== "undefined"
//       ? sessionStorage.getItem("token")
//       : null;

useEffect(() => {
  const storedToken = sessionStorage.getItem("token");
  setToken(storedToken);
}, []); 

useEffect(() => {
  if (!token) return;

  fetchCart();
  fetchAddress();
}, [token]);

  // LOAD CART
const fetchCart = async () => {
  const res = await fetch("http://localhost:5000/api/orderItems", {
  headers: { Authorization: `Bearer ${token}` },
});

  const data = await res.json();
  if (data.success) setCart(data.data);
};

  // LOAD ADDRESS
const fetchAddress = async () => {
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const res = await fetch(`http://localhost:5000/api/users/${user.id}/address`, {
  headers: { Authorization: `Bearer ${token}` },
});

  const data = await res.json();
  if (data.success) setAddress(data.data);
};

  // TOTAL
  const total = cart.reduce(
    (sum, item) =>
      sum + item.quantity * item.product_id.price_per_kg,
    0
  );

  // CONFIRM ORDER
const confirmOrder = async () => {
  try {
    const token = sessionStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/orders/checkout", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

    const data = await res.json();
    console.log("CHECKOUT RES:", data);

    if (!data.success) {
      alert(data.message);
      return;
    }

    alert("Order berhasil dibuat!");
    window.location.href = "/orders";

  } catch (err) {
    console.error(err);
  }
};


  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {/* ADDRESS */}
      <div className="mb-6 p-4 border rounded">
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
      <div className="mb-6">
        {cart.map(item => (
          <div key={item._id} className="flex justify-between mb-2">
            <span>{item.product_id.product_name} x {item.quantity}</span>
            <span>
              Rp {(item.quantity * item.product_id.price_per_kg).toLocaleString("id-ID")}
            </span>
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div className="flex justify-between font-bold text-xl mb-6">
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