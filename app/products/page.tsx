'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Farm {
  _id: string;
  farm_name: string;
}

interface Product {
  _id: string;
  product_name: string;
  price_per_kg: number;
  stock_kg: number;
  product_image?: string;
  farm_id?: Farm;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedFarm, setSelectedFarm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('');

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    setIsLoggedIn(!!token);
    fetchFarms();
    fetchProducts();
  }, []);

  const fetchFarms = async () => {
    try {
      const res = await fetch('/api/farms');
      const data = await res.json();
      if (data.success) setFarms(data.data);
    } catch {
      // silently fail, farms filter just won't populate
    }
  };

  const fetchProducts = async (filters?: {
    search?: string;
    farm_id?: string;
    minPrice?: string;
    maxPrice?: string;
  }) => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.farm_id) params.append('farm_id', filters.farm_id);
      if (filters?.minPrice) params.append('minPrice', filters.minPrice);
      if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) setProducts(data.data);
      else setError('Failed to load products');
    } catch {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchProducts({
      search,
      farm_id: selectedFarm,
      minPrice,
      maxPrice,
    });
  };

  const handleReset = () => {
    setSearch('');
    setSelectedFarm('');
    setMinPrice('');
    setMaxPrice('');
    setSortOrder('');
    fetchProducts();
  };

  // Sort is done client-side since the backend doesn't have a sort param
  const sortedProducts = [...products].sort((a, b) => {
    if (sortOrder === 'asc') return a.price_per_kg - b.price_per_kg;
    if (sortOrder === 'desc') return b.price_per_kg - a.price_per_kg;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Transfarmers
          </Link>
          <div className="flex gap-3">
            {isLoggedIn ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition"
              >
                Dashboard
              </button>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-sm font-semibold bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Our Products</h1>
          <p className="text-gray-500 mt-1">Fresh produce sourced directly from our partner farms</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <select
              value={selectedFarm}
              onChange={e => setSelectedFarm(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Farms</option>
              {farms.map(farm => (
                <option key={farm._id} value={farm._id}>{farm.farm_name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min price"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                min="0"
              />
              <input
                type="number"
                placeholder="Max price"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                min="0"
              />
            </div>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as 'asc' | 'desc' | '')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Sort by price</option>
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSearch}
              className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
            >
              Apply Filters
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading products...</div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">{error}</div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No products found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map(product => (
              <Link
                key={product._id}
                href={`/products/${product._id}`}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden group"
              >
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  {product.product_image ? (
                    <img
                      src={product.product_image}
                      alt={product.product_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
                      Image not found
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-semibold text-gray-900 text-sm">{product.product_name}</p>
                  {product.farm_id && (
                    <p className="text-xs text-gray-500 mt-0.5">{product.farm_id.farm_name}</p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-green-600 font-bold text-sm">
                      Rp {product.price_per_kg.toLocaleString('id-ID')}<span className="font-normal text-gray-400">/kg</span>
                    </p>
                    <p className={`text-xs font-medium ${product.stock_kg > 0 ? 'text-gray-500' : 'text-red-500'}`}>
                      {product.stock_kg > 0 ? `${product.stock_kg} kg left` : 'Out of stock'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}