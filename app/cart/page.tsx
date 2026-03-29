"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  const fetchCart = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setError("");
      const res = await fetch("/api/orderItems", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch cart");
      }

      const data = await res.json();

      if (data.success) {
        setCart(data.data);
      } else {
        setError(data.message || "Failed to load cart");
      }
    } catch (err) {
      setError("Failed to load cart");
      console.error("Cart error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const increaseQty = async (item: CartItem) => {
    if (!token) return;
    if (item.quantity >= item.product_id.stock_kg) return;

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
      setError("Failed to update quantity");
      return;
    }

    fetchCart();
  };

  const decreaseQty = async (item: CartItem) => {
    if (!token || item.quantity <= 1) return;

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
      setError("Failed to update quantity");
      return;
    }

    fetchCart();
  };

  const removeItem = async (item: CartItem) => {
    if (!token) return;

    const res = await fetch(`/api/orderItems/${item._id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      setError("Failed to remove item");
      return;
    }

    fetchCart();
  };

  const total = cart.reduce(
    (sum, item) =>
      sum + item.quantity * item.product_id.price_per_kg,
    0
  );

  if (!token && !loading) {
    return (
      <div className="page-shell max-w-3xl">
        <h1 className="mb-3 text-2xl font-bold text-gray-900">Your Cart</h1>
        <p className="text-gray-600">Please login first to view your cart.</p>
        <button
          onClick={() => router.push("/auth/login")}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="page-shell">Loading cart...</div>;
  }

  return (
    <div className="page-shell max-w-5xl">

      <h1 className="mb-6 text-3xl font-extrabold text-slate-900">
        🛒 Your Cart
      </h1>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {cart.length === 0 ? (
        <p className="text-gray-500">Your cart is empty</p>
      ) : (
        <>
          <div className="space-y-4">

            {cart.map(item => (
              <div
                key={item._id}
                className="app-card flex items-center justify-between p-4"
              >
                {/* LEFT */}
                <div className="flex items-center gap-4">

                  <Image
                    src={
                      item.product_id.product_image ||
                      "/no-image.png"
                    }
                    alt={item.product_id.product_name}
                    width={160}
                    height={160}
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
                    disabled={item.quantity >= item.product_id.stock_kg}
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