"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";


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
  const [isEditing, setIsEditing] = useState(false);
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
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address }),
});
      const data = await res.json();
      console.log("CHECKOUT RES:", data);

      if (!data.success) {
        alert(data.message);
        return;
      }

      alert("Order berhasil dibuat!");
      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(new Event("ordersUpdated"));
      router.push("/orders");

    } catch (err) {
      console.error(err);
    }
  };

  //to store address in db
  const saveAddress = async () => {
  try {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    const token = sessionStorage.getItem("token");

    const res = await fetch(`/api/users/${user.id}/address`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(address),
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message);
      return;
    }

    setAddress(data.data); // update UI with DB data
    setIsEditing(false);

  } catch (err) {
    console.error(err);
  }
};

  return (
    <div className="page-shell max-w-4xl">
       <Link href="/cart">
        <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"> ← Back to Cart</button>
      </Link>
      <h1 className="mb-6 text-3xl font-extrabold text-slate-900">Checkout</h1>
     
  

      {/* ADDRESS */}
      <div className="app-card mb-6 p-5">
  <h2 className="font-bold mb-2">Shipping Address</h2>

  {!isEditing ? (
    <div className="border p-4 rounded-lg">
      <p className="font-semibold">{address?.full_name}</p>
      <p>{address?.phone}</p>
      <p>
        {address?.address_line}, {address?.city}, {address?.postal_code}
      </p>

      <button
        onClick={() => setIsEditing(true)}
        className="mt-2 text-blue-500"
      >
        Change Address
      </button>
    </div>
  ) : (
    <div className="border p-4 rounded-lg space-y-2">
      <input
        type="text"
        placeholder="Name"
        value={address?.full_name || ""}
        onChange={(e) =>
          setAddress({ ...address!, full_name: e.target.value })
        }
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        placeholder="Phone"
        value={address?.phone || ""}
        onChange={(e) =>
          setAddress({ ...address!, phone: e.target.value })
        }
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        placeholder="Street"
        value={address?.address_line || ""}
        onChange={(e) =>
          setAddress({ ...address!, address_line: e.target.value })
        }
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        placeholder="City"
        value={address?.city || ""}
        onChange={(e) =>
          setAddress({ ...address!, city: e.target.value })
        }
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        placeholder="Postal Code"
        value={address?.postal_code || ""}
        onChange={(e) =>
          setAddress({ ...address!, postal_code: e.target.value })
        }
        className="w-full border p-2 rounded"
      />

      <div className="flex gap-2">
        <button
  onClick={saveAddress}
  className="px-4 py-2 bg-green-500 text-white rounded"
>
  Save
</button>

        <button
          onClick={() => setIsEditing(false)}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
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