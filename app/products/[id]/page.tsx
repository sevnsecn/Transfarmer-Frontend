'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Farm {
  _id: string;
  farm_name: string;
  farm_location: string;
  farm_image?: string;
}

interface Product {
  _id: string;
  product_name: string;
  price_per_kg: number;
  stock_kg: number;
  product_image?: string;
  farm_id?: Farm;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    setIsLoggedIn(!!token);
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      if (data.success) setProduct(data.data);
      else setError('Product not found');
    } catch {
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (val: number) => {
    if (!product) return;
    if (val < 1) return;
    if (val > product.stock_kg) return;
    setQuantity(val);
  };

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      router.push(`/auth/login?redirect=/products/${id}`);
      return;
    }

    if (!product) return;

    // Read existing cart
    const existing = localStorage.getItem('cart');
    const cart = existing ? JSON.parse(existing) : [];

    // Check if product already in cart
    const existingIndex = cart.findIndex((item: any) => item.product_id === product._id);
    if (existingIndex !== -1) {
      // Update quantity, cap at stock
      const newQty = Math.min(cart[existingIndex].quantity_kg + quantity, product.stock_kg);
      cart[existingIndex].quantity_kg = newQty;
    } else {
      cart.push({
        product_id: product._id,
        product_name: product.product_name,
        price_per_kg: product.price_per_kg,
        quantity_kg: quantity,
        product_image: product.product_image || '',
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error || 'Product not found'}
      </div>
    );
  }

  const totalPrice = product.price_per_kg * quantity;
  const outOfStock = product.stock_kg === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-gray-900">Transfarmers</Link>
          <div className="flex gap-3 items-center">
            <Link href="/products" className="text-sm text-gray-500 hover:text-gray-800 transition">
              ← Back to Catalogue
            </Link>
            {isLoggedIn ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition"
              >
                Dashboard
              </button>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition">
                  Login
                </Link>
                <Link href="/auth/signup" className="text-sm font-semibold bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left — Image */}
          <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
            {product.product_image ? (
              <img
                src={product.product_image}
                alt={product.product_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-8xl">
                🥬
              </div>
            )}
          </div>

          {/* Right — Info */}
          <div className="flex flex-col justify-center">
            {product.farm_id && (
              <Link
                href={`/farms/${product.farm_id._id}`}
                className="text-sm text-green-600 font-medium hover:underline mb-2"
              >
                {product.farm_id.farm_name}
              </Link>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.product_name}</h1>

            {product.farm_id && (
              <p className="text-sm text-gray-500 mb-4">📍 {product.farm_id.farm_location}</p>
            )}

            <div className="border-t border-gray-100 pt-4 mb-4">
              <p className="text-3xl font-bold text-green-600">
                Rp {product.price_per_kg.toLocaleString('id-ID')}
                <span className="text-base font-normal text-gray-400">/kg</span>
              </p>
              <p className={`text-sm mt-1 ${outOfStock ? 'text-red-500' : 'text-gray-500'}`}>
                {outOfStock ? 'Out of stock' : `${product.stock_kg} kg available`}
              </p>
            </div>

            {/* Quantity Selector */}
            {!outOfStock && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (kg)</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="w-9 h-9 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition flex items-center justify-center"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={e => handleQuantityChange(Number(e.target.value))}
                    className="w-16 text-center border border-gray-300 rounded-lg py-1.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    min={1}
                    max={product.stock_kg}
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-9 h-9 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition flex items-center justify-center"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-400">max {product.stock_kg} kg</span>
                </div>
              </div>
            )}

            {/* Total Price */}
            {!outOfStock && (
              <div className="bg-green-50 rounded-lg px-4 py-3 mb-6">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold text-green-700">
                  Rp {totalPrice.toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-gray-400">{quantity} kg × Rp {product.price_per_kg.toLocaleString('id-ID')}</p>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className={`w-full py-3 rounded-xl font-semibold text-white transition ${
                outOfStock
                  ? 'bg-gray-300 cursor-not-allowed'
                  : addedToCart
                  ? 'bg-green-500'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {outOfStock ? 'Out of Stock' : addedToCart ? '✓ Added to Cart!' : 'Add to Cart'}
            </button>

            {!isLoggedIn && !outOfStock && (
              <p className="text-xs text-gray-400 text-center mt-2">You'll be asked to log in before adding to cart</p>
            )}
          </div>
        </div>

        {/* Farm Card */}
        {product.farm_id && (
          <div className="mt-12 bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center gap-6">
            {product.farm_id.farm_image && (
              <img
                src={product.farm_id.farm_image}
                alt={product.farm_id.farm_name}
                className="w-20 h-20 object-cover rounded-xl"
              />
            )}
            <div className="flex-1">
              <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Source Farm</p>
              <p className="text-lg font-bold text-gray-900">{product.farm_id.farm_name}</p>
              <p className="text-sm text-gray-500">📍 {product.farm_id.farm_location}</p>
            </div>
            <Link
              href={`/farms/${product.farm_id._id}`}
              className="text-sm font-semibold text-green-600 border border-green-200 px-4 py-2 rounded-lg hover:bg-green-50 transition"
            >
              View Farm →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}