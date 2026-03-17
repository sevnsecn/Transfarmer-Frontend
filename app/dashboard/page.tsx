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

  useEffect(() => {
  const fetchUser = async () => {
    const token = sessionStorage.getItem('token');
    const storedUser = sessionStorage.getItem('user');

    if (!token || !storedUser) {
      router.push('/auth/login');
      return;
    }

    setUser(JSON.parse(storedUser));
    setLoading(false);
  };

    fetchUser();
  }, [router]);

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
                  href="/admin/products"
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