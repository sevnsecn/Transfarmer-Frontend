'use client';

import { useEffect, useState } from 'react';
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
  const [error, setError] = useState('');
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
const fetchAddress = async (userId: string) => {
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
};

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
  }, [router]);

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

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    router.push('/auth/login');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Transfarmers</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Welcome back, {user?.user_name}!</h2>

          <div className="space-y-4">
            <div>
              <p className="text-gray-600">User ID</p>
              <p className="text-lg font-semibold text-gray-900">{user?.id}</p>
            </div>

      {/* addres section */}
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mt-8">
  <h2 className="text-2xl font-bold mb-4 text-black">📍 Shipping Address</h2>

  {/* ✅ SHOW ADDRESS */}
  {address.address_line && !showForm && (
    <div className="p-4 border rounded bg-gray-50 flex justify-between items-start text-black">
      
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
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-black"
    >
      Add Address
    </button>
  )}

  {/* 📝 FORM */}
  {showForm && (
    <div className="mt-4 border p-4 rounded bg-black-50 text-black">

      <div className="grid grid-cols-2 gap-4">

        <input
          name="full_name"
          value={address.full_name}
          onChange={handleChange}
          placeholder="Full Name"
          className="border p-2 rounded text-black"
        />

        <input
          name="phone"
          value={address.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="border p-2 rounded text-black"
        />

        <input
          name="city"
          value={address.city}
          onChange={handleChange}
          placeholder="City"
          className="border p-2 rounded text-black"
        />

        <input
          name="postal_code"
          value={address.postal_code}
          onChange={handleChange}
          placeholder="Postal Code"
          className="border p-2 rounded text-black"
        />

        <input
          name="address_line"
          value={address.address_line}
          onChange={handleChange}
          placeholder="Full Address"
          className="border p-2 rounded col-span-2 text-black"
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
          className="bg-gray-300 text-black-700 px-4 py-2 rounded hover:bg-gray-400"
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
                className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
              >
                <p className="font-semibold text-blue-600">Browse Products</p>
                <p className="text-sm text-gray-600">View all available products</p>
              </Link>

              {user?.is_admin && (
                <Link
                  href="/admin"
                  className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition"
                >
                  <p className="font-semibold text-purple-600">Admin Panel</p>
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