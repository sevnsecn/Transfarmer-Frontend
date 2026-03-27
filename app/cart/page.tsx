"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CartItem {
  _id: string;
  quantity: number;
  product_id: {
    product_name: string;
    price_per_kg: number;
    product_image?: string;
    stock_kg: number;
  };
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("token")
      : null;

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  
  // 🔥 LOAD CART
  const fetchCart = async () => {
    try {
      const res = await fetch("/api/orderItems", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setCart(data.data);
      }
    } catch (err) {
      console.error("REAL ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  if (token) {
    fetchCart();

    const interval = setInterval(fetchCart, 2000); // auto refresh
    return () => clearInterval(interval);
  }
}, [token]);

  // 🔼 INCREASE
  const increaseQty = async (item: CartItem) => {
  const res = await fetch(`/api/orderItems/${item._id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      quantity: item.quantity + 1,
    }),
  });

  if (!res.ok) {
    console.error("Update failed");
    return;
  }

  fetchCart();
};


  // 🔽 DECREASE
const decreaseQty = async (item: CartItem) => {
  if (item.quantity <= 1) return;

  const res = await fetch(`/api/orderItems/${item._id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      quantity: item.quantity - 1,
    }),
  });

  if (!res.ok) {
    console.error("Decrease failed");
    return;
  }

  fetchCart();
};

  // ❌ REMOVE
const removeItem = async (item: CartItem) => {
  const res = await fetch(`/api/orderItems/${item._id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    console.error("Delete failed");
    return;
  }

  fetchCart();
};
  // 💰 TOTAL
  const total = cart.reduce(
    (sum, item) =>
      sum + item.quantity * item.product_id.price_per_kg,
    0
  );

  if (loading) {
    return <div className="p-10">Loading cart...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-6">
        🛒 Your Cart
      </h1>

      {cart.length === 0 ? (
        <p className="text-gray-500">Your cart is empty</p>
      ) : (
        <>
          <div className="space-y-4">

            {cart.map(item => (
              <div
                key={item._id}
                className="flex items-center justify-between bg-white border rounded-xl p-4 shadow-sm"
              >
                {/* LEFT */}
                <div className="flex items-center gap-4">

                  <img
                    src={
                      item.product_id.product_image ||
                      "/no-image.png"
                    }
                    className="w-20 h-20 object-cover rounded-lg"
                  />

                  <div>
                    <h2 className="font-semibold">
                      {item.product_id.product_name}
                    </h2>

                    <p className="text-sm text-gray-500">
                      Rp{" "}
                      {item.product_id.price_per_kg.toLocaleString(
                        "id-ID"
                      )}
                      /kg
                    </p>
                  </div>
                </div>

                {/* MIDDLE (QTY) */}
                <div className="flex items-center gap-3">

                  <button
                    onClick={() => decreaseQty(item)}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    -
                  </button>

                  <span className="font-semibold">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => increaseQty(item)}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    +
                  </button>

                </div>

                {/* RIGHT */}
                <div className="text-right">

                  <p className="font-bold text-green-600">
                    Rp{" "}
                    {(item.quantity *
                      item.product_id.price_per_kg).toLocaleString(
                      "id-ID"
                    )}
                  </p>

                  <button
                    onClick={() => removeItem(item)} 
                    className="text-red-500 text-sm mt-2"
                  >
                    Remove
                  </button>

                </div>
              </div>
            ))}

          </div>

          {/* TOTAL */}
          <div className="mt-8 flex justify-between items-center border-t pt-4">

            <h2 className="text-xl font-bold">
              Total:
            </h2>

            <p className="text-2xl font-bold text-green-600">
              Rp {total.toLocaleString("id-ID")}
            </p>

          </div>

          {/* CHECKOUT BUTTON */}
<button
  onClick={() => router.push("/checkout")}
  className="mt-6 w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700"
>
  Checkout
</button>

        </>
      )}
    </div>
  );
}