'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  user_name: string;
  user_email: string;
  is_admin: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState('');
  const [showForm, setShowForm] = useState(false);
  

  const [address, setAddress] = useState({//buat alamat
  full_name: "",
  phone: "",
  address_line: "",
  city: "",
  postal_code: "",
});

const token =
  typeof window !== "undefined"
    ? sessionStorage.getItem("token")
    : null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;

  setAddress((prev) => ({
    ...prev,
    [name as keyof typeof prev]: value,
  }));
};
//fetching address
const fetchAddress = useCallback(async (userId: string) => {
  try {
    const res = await fetch(`/api/users/${userId}/address`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (data.success && data.data) {
      setAddress(data.data);
    }
  } catch (err) {
    console.error("Address error:", err);
  }
}, [token]);

  useEffect(() => {
  const fetchUser = async () => {
    const token = sessionStorage.getItem('token');
    const storedUser = sessionStorage.getItem('user');

    if (!token || !storedUser) {
      router.push('/auth/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchAddress(parsedUser.id); //
    setLoading(false);
  };

    fetchUser();
  }, [router, fetchAddress]);

  //saving addres
const saveAddress = async () => {
  if (!user || !token) return;

  console.log("SENDING:", address);

  const res = await fetch(`/api/users/${user.id}/address`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(address),
  });

  const data = await res.json();
  console.log("SAVE ADDRESS:", data);

  if (data.success) {
    setShowForm(false);
    fetchAddress(user.id); // 🔥 refresh
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="page-shell max-w-5xl">
        <div className="app-card p-8">
          <h2 className="mb-6 text-3xl font-extrabold text-slate-900">Welcome back, {user?.user_name}!</h2>

          <div className="space-y-4">
            <div>
              <p className="text-gray-600">User ID</p>
              <p className="text-lg font-semibold text-gray-900">{user?.id}</p>
            </div>

      {/* addres section */}
        <div className="app-card mt-8 p-8">
      <h2 className="mb-4 text-2xl font-bold text-slate-900">Shipping Address</h2>

  {/* ✅ SHOW ADDRESS */}
  {address.address_line && !showForm && (
    <div className="flex items-start justify-between rounded-lg border bg-gray-50 p-4 text-slate-800">
      
      <div>
        <p className="font-semibold">{address.full_name}</p>
        <p className="text-sm">{address.phone}</p>
        <p className="text-sm">{address.address_line}</p>
        <p className="text-sm">
          {address.city}, {address.postal_code}
        </p>
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="text-blue-600 text-sm hover:underline"
      >
        Edit
      </button>
    </div>
  )}

  {/* ➕ ADD BUTTON */}
  {!address.address_line && !showForm && (
    <button
      onClick={() => setShowForm(true)}
      className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
    >
      Add Address
    </button>
  )}

  {/* 📝 FORM */}
  {showForm && (
    <div className="mt-4 rounded-lg border bg-white p-4 text-slate-800">

      <div className="grid grid-cols-2 gap-4">

        <input
          name="full_name"
          value={address.full_name}
          onChange={handleChange}
          placeholder="Full Name"
          className="rounded border p-2 text-slate-900"
        />

        <input
          name="phone"
          value={address.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="rounded border p-2 text-slate-900"
        />

        <input
          name="city"
          value={address.city}
          onChange={handleChange}
          placeholder="City"
          className="rounded border p-2 text-slate-900"
        />

        <input
          name="postal_code"
          value={address.postal_code}
          onChange={handleChange}
          placeholder="Postal Code"
          className="rounded border p-2 text-slate-900"
        />

        <input
          name="address_line"
          value={address.address_line}
          onChange={handleChange}
          placeholder="Full Address"
          className="col-span-2 rounded border p-2 text-slate-900"
        />

      </div>

      <div className="flex gap-2 mt-4">

        <button
          onClick={saveAddress}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Save
        </button>

        <button
          onClick={() => setShowForm(false)}
          className="rounded bg-gray-300 px-4 py-2 text-slate-700 hover:bg-gray-400"
        >
          Cancel
        </button>

      </div>

    </div>
  )}
</div>
            {user?.is_admin && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <p className="text-blue-800 font-semibold">✓ Admin Access</p>
              </div>
            )}
          </div>
            
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/products"
                className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 transition hover:bg-emerald-100"
              >
                <p className="font-semibold text-emerald-700">Browse Products</p>
                <p className="text-sm text-gray-600">View all available products</p>
              </Link>

              <Link
                href="/orders"
                className="rounded-lg border border-sky-200 bg-sky-50 p-4 transition hover:bg-sky-100"
              >
                <p className="font-semibold text-sky-700">My Orders</p>
                <p className="text-sm text-gray-600">Check your order history and status</p>
              </Link>

              {user?.is_admin && (
                <Link
                  href="/admin"
                  className="rounded-lg border border-amber-200 bg-amber-50 p-4 transition hover:bg-amber-100"
                >
                  <p className="font-semibold text-amber-700">Admin Panel</p>
                  <p className="text-sm text-gray-600">Manage products and farms</p>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}