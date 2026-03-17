'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Types
interface Farm {
  _id: string;
  farm_name: string;
  farm_location: string;
  farm_image?: string;
}

interface Product {
  _id: string;
  farm_id: Farm;
  product_name: string;
  price_per_kg: number;
  stock_kg: number;
  product_image?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'products' | 'farms'>('farms');
  const [token, setToken] = useState<string | null>(null);

  // Farms state
  const [farms, setFarms] = useState<Farm[]>([]);
  const [farmLoading, setFarmLoading] = useState(true);
  const [farmError, setFarmError] = useState('');
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [farmForm, setFarmForm] = useState({ farm_name: '', farm_location: '', farm_image: '' });
  const [farmImageFile, setFarmImageFile] = useState<File | null>(null);
  const [farmSubmitting, setFarmSubmitting] = useState(false);
  const [farmImageKey, setFarmImageKey] = useState(0);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [productLoading, setProductLoading] = useState(true);
  const [productError, setProductError] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({ farm_id: '', product_name: '', price_per_kg: '', stock_kg: '', product_image: '' });
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productSubmitting, setProductSubmitting] = useState(false);
  const [productImageKey, setProductImageKey] = useState(0);

  // Auth check
  useEffect(() => {
    const storedToken = sessionStorage.getItem('token');
    const storedUser = sessionStorage.getItem('user');
    if (!storedToken || !storedUser) {
      router.push('/auth/login');
      return;
    }
    const user = JSON.parse(storedUser);
    if (!user.is_admin) {
      router.push('/dashboard');
      return;
    }
    setToken(storedToken);
  }, [router]);

  // Fetch farms
  useEffect(() => {
    if (!token) return;
    fetchFarms();
    fetchProducts();
  }, [token]);

  const fetchFarms = async () => {
    try {
      setFarmLoading(true);
      const res = await fetch('/api/farms');
      const data = await res.json();
      if (data.success) setFarms(data.data);
      else setFarmError('Failed to load farms');
    } catch {
      setFarmError('Failed to load farms');
    } finally {
      setFarmLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setProductLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) setProducts(data.data);
      else setProductError('Failed to load products');
    } catch {
      setProductError('Failed to load products');
    } finally {
      setProductLoading(false);
    }
  };

  // Upload image helper
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch('/api/upload/image', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Image upload failed');
    return data.url;
  };

  // ── FARM HANDLERS ──────────────────────────────────────────

  const handleFarmSubmit = async () => {
    if (!farmForm.farm_name || !farmForm.farm_location) {
      setFarmError('Farm name and location are required');
      return;
    }
    try {
      setFarmSubmitting(true);
      setFarmError('');
      let imageUrl = farmForm.farm_image;
      if (farmImageFile) imageUrl = await uploadImage(farmImageFile);

      const payload = { ...farmForm, farm_image: imageUrl };
      const url = editingFarm ? `/api/farms/${editingFarm._id}` : '/api/farms';
      const method = editingFarm ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      await fetchFarms();
      resetFarmForm();
    } catch (err: any) {
      setFarmError(err.message || 'Failed to save farm');
    } finally {
      setFarmSubmitting(false);
    }
  };

  const handleDeleteFarm = async (id: string) => {
    if (!confirm('Delete this farm? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/farms/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      await fetchFarms();
    } catch (err: any) {
      setFarmError(err.message || 'Failed to delete farm');
    }
  };

  const handleEditFarm = (farm: Farm) => {
    setEditingFarm(farm);
    setFarmForm({ farm_name: farm.farm_name, farm_location: farm.farm_location, farm_image: farm.farm_image || '' });
    setFarmImageFile(null);
  };

  const resetFarmForm = () => {
    setEditingFarm(null);
    setFarmForm({ farm_name: '', farm_location: '', farm_image: '' });
    setFarmImageFile(null);
    setFarmImageKey(prev => prev + 1);
  };

  // ── PRODUCT HANDLERS ───────────────────────────────────────

  const handleProductSubmit = async () => {
    if (!productForm.farm_id || !productForm.product_name || !productForm.price_per_kg || !productForm.stock_kg) {
      setProductError('All fields except image are required');
      return;
    }
    try {
      setProductSubmitting(true);
      setProductError('');
      let imageUrl = productForm.product_image;
      if (productImageFile) imageUrl = await uploadImage(productImageFile);

      const payload = {
        farm_id: productForm.farm_id,
        product_name: productForm.product_name,
        price_per_kg: Number(productForm.price_per_kg),
        stock_kg: Number(productForm.stock_kg),
        product_image: imageUrl,
      };

      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      await fetchProducts();
      resetProductForm();
    } catch (err: any) {
      setProductError(err.message || 'Failed to save product');
    } finally {
      setProductSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      await fetchProducts();
    } catch (err: any) {
      setProductError(err.message || 'Failed to delete product');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      farm_id: product.farm_id._id,
      product_name: product.product_name,
      price_per_kg: String(product.price_per_kg),
      stock_kg: String(product.stock_kg),
      product_image: product.product_image || '',
    });
    setProductImageFile(null);
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProductForm({ farm_id: '', product_name: '', price_per_kg: '', stock_kg: '', product_image: '' });
    setProductImageFile(null);
    setProductImageKey(prev => prev + 1);
  };

  // ── RENDER ─────────────────────────────────────────────────

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Transfarmers Admin</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-500 hover:text-gray-800 transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('farms')}
            className={`px-6 py-3 text-sm font-semibold transition border-b-2 -mb-px ${
              activeTab === 'farms'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Farms
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 text-sm font-semibold transition border-b-2 -mb-px ${
              activeTab === 'products'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Products
          </button>
        </div>

        {/* ── FARMS TAB ── */}
        {activeTab === 'farms' && (
          <div className="space-y-8">
            {/* Farm Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {editingFarm ? 'Edit Farm' : 'Add New Farm'}
              </h2>
              {farmError && <p className="text-red-600 text-sm mb-4">{farmError}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name *</label>
                  <input
                    type="text"
                    value={farmForm.farm_name}
                    onChange={e => setFarmForm({ ...farmForm, farm_name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. Sunrise Farm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    value={farmForm.farm_location}
                    onChange={e => setFarmForm({ ...farmForm, farm_location: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. Bandung, West Java"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Farm Image</label>
                  <input
                    key={farmImageKey}
                    type="file"
                    accept="image/*"
                    onChange={e => setFarmImageFile(e.target.files?.[0] || null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {editingFarm?.farm_image && !farmImageFile && (
                    <p className="text-xs text-gray-500 mt-1">Current image will be kept if no new file is selected</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleFarmSubmit}
                  disabled={farmSubmitting}
                  className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50"
                >
                  {farmSubmitting ? 'Saving...' : editingFarm ? 'Update Farm' : 'Add Farm'}
                </button>
                {editingFarm && (
                  <button
                    onClick={resetFarmForm}
                    className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Farms List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">All Farms</h2>
              {farmLoading ? (
                <p className="text-gray-500 text-sm">Loading...</p>
              ) : farms.length === 0 ? (
                <p className="text-gray-500 text-sm">No farms yet.</p>
              ) : (
                <div className="space-y-3">
                  {farms.map(farm => (
                    <div key={farm._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                      <div className="flex items-center gap-4">
                        {farm.farm_image && (
                          <img src={farm.farm_image} alt={farm.farm_name} className="w-12 h-12 object-cover rounded-lg" />
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{farm.farm_name}</p>
                          <p className="text-gray-500 text-xs">{farm.farm_location}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditFarm(farm)}
                          className="text-xs px-3 py-1.5 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-100 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteFarm(farm._id)}
                          className="text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PRODUCTS TAB ── */}
        {activeTab === 'products' && (
          <div className="space-y-8">
            {/* Product Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              {productError && <p className="text-red-600 text-sm mb-4">{productError}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={productForm.product_name}
                    onChange={e => setProductForm({ ...productForm, product_name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. Fresh Tomatoes"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Farm *</label>
                  <select
                    value={productForm.farm_id}
                    onChange={e => setProductForm({ ...productForm, farm_id: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select a farm</option>
                    {farms.map(farm => (
                      <option key={farm._id} value={farm._id}>{farm.farm_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price per kg (Rp) *</label>
                  <input
                    type="number"
                    value={productForm.price_per_kg}
                    onChange={e => setProductForm({ ...productForm, price_per_kg: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. 15000"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock (kg) *</label>
                  <input
                    type="number"
                    value={productForm.stock_kg}
                    onChange={e => setProductForm({ ...productForm, stock_kg: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. 100"
                    min="0"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                  <input
                    key={productImageKey}
                    type="file"
                    accept="image/*"
                    onChange={e => setProductImageFile(e.target.files?.[0] || null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {editingProduct?.product_image && !productImageFile && (
                    <p className="text-xs text-gray-500 mt-1">Current image will be kept if no new file is selected</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleProductSubmit}
                  disabled={productSubmitting}
                  className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50"
                >
                  {productSubmitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                </button>
                {editingProduct && (
                  <button
                    onClick={resetProductForm}
                    className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Products List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">All Products</h2>
              {productLoading ? (
                <p className="text-gray-500 text-sm">Loading...</p>
              ) : products.length === 0 ? (
                <p className="text-gray-500 text-sm">No products yet.</p>
              ) : (
                <div className="space-y-3">
                  {products.map(product => (
                    <div key={product._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                      <div className="flex items-center gap-4">
                        {product.product_image && (
                          <img src={product.product_image} alt={product.product_name} className="w-12 h-12 object-cover rounded-lg" />
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{product.product_name}</p>
                          <p className="text-gray-500 text-xs">
                            Rp {product.price_per_kg.toLocaleString('id-ID')}/kg · {product.stock_kg} kg stock
                            {product.farm_id && ` · ${product.farm_id.farm_name}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-xs px-3 py-1.5 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-100 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}