'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import Image from 'next/image';

export default function Home() {
  const [farmCount, setFarmCount] = useState<number>(0);
  const [orderCount, setOrderCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [productCount, setProductCount] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);
  const [farms, setFarms] = useState<{ _id: string; farm_name: string; farm_location: string; farm_image?: string }[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<{ _id: string; product_name: string; price_per_kg: number; stock_kg: number; product_image?: string; farm_id?: { farm_name: string } }[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch farms count
        const farmsRes = await fetch('/api/farms');
        if (farmsRes.ok) {
          const farms = await farmsRes.json();
          setFarmCount(Array.isArray(farms) ? farms.length : farms.data?.length || 0);
        }

        // Fetch orders count
        const ordersRes = await fetch('/api/orders');
        if (ordersRes.ok) {
          const orders = await ordersRes.json();
          setOrderCount(Array.isArray(orders) ? orders.length : orders.data?.length || 0);
        }

        // Fetch products count
        const productsRes = await fetch('/api/products');
        if (productsRes.ok) {
          const products = await productsRes.json();
          setProductCount(Array.isArray(products) ? products.length : products.data?.length || 0);
        }

        // Fetch users count (excluding admins where is_admin = 1)
        const usersRes = await fetch('/api/users');
        if (usersRes.ok) {
          const users = await usersRes.json();
          const userList = Array.isArray(users) ? users : users.data || [];
          const nonAdminUsers = userList.filter((user: any) => !user.is_admin);          setUserCount(nonAdminUsers.length);
        }

        // Fetch farms with full data for display
        const farmsFullRes = await fetch('/api/farms');
        if (farmsFullRes.ok) {
          const farmsData = await farmsFullRes.json();
          setFarms(farmsData.data || []);
        }

        // Fetch products for carousel
        const featuredRes = await fetch('/api/products');
        if (featuredRes.ok) {
          const featuredData = await featuredRes.json();
          const available = (featuredData.data || []).filter((p: any) => p.stock_kg > 0);
          setFeaturedProducts(available);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    if (featuredProducts.length === 0) return;
    const interval = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % featuredProducts.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [featuredProducts]);

  return (
    <main className="flex min-h-screen flex-col pb-28">
      <section className="page-shell pt-14 md:pt-20 home-reveal home-reveal-1">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="home-reveal home-reveal-2">
            <p className="mb-3 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-700">
              Fresh from local farms
            </p>
            <h1 className="text-4xl font-extrabold leading-tight text-gray-900 md:text-6xl">
              Transfarmers Marketplace
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              Buy trusted produce directly from partner farms, manage your cart, and track your orders in one place.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="pill-btn motion-btn bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Browse Products
              </Link>
              <Link
                href="/dashboard"
                className="pill-btn motion-btn border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50"
              >
                Open Dashboard
              </Link>
            </div>
          </div>

          <div className="app-card motion-card home-reveal home-reveal-3 p-6">
            <h2 className="text-xl font-bold text-slate-900">What you can do</h2>
            <ul className="mt-4 space-y-3 text-sm text-gray-700">
              <li className="rounded-lg bg-emerald-50 p-3">Search and filter products by farm and price.</li>
              <li className="rounded-lg bg-lime-50 p-3">Add items to cart and checkout with saved address.</li>
              <li className="rounded-lg bg-amber-50 p-3">Track order status from your orders page.</li>
              <li className="rounded-lg bg-blue-50 p-3">Admins can manage farms, products, and order statuses.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="page-shell pt-2 md:pt-4 home-reveal home-reveal-2">
        <div className="app-card p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-600">Why Choose Us</p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900 md:text-3xl">Built for Freshness, Trust, and Speed</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
                Transfarmers helps you buy confidently from local farms with verified sellers, transparent pricing, and a smooth order flow.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <article className="motion-card rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 home-reveal home-reveal-3">
              <p className="text-sm font-extrabold text-emerald-800">Fresh from Local Farms</p>
              <p className="mt-1 text-xs leading-relaxed text-emerald-900/80">Direct sourcing means produce arrives fresher and supports nearby growers.</p>
            </article>

            <article className="motion-card rounded-2xl border border-lime-100 bg-lime-50/80 p-4 home-reveal home-reveal-4">
              <p className="text-sm font-extrabold text-lime-800">Transparent Pricing</p>
              <p className="mt-1 text-xs leading-relaxed text-lime-900/80">Clear per-kg pricing helps you compare products and buy smarter.</p>
            </article>

            <article className="motion-card rounded-2xl border border-sky-100 bg-sky-50/80 p-4 home-reveal home-reveal-5">
              <p className="text-sm font-extrabold text-sky-800">Easy Order Flow</p>
              <p className="mt-1 text-xs leading-relaxed text-sky-900/80">Browse, add to cart, checkout, and track orders without friction.</p>
            </article>

            <article className="motion-card rounded-2xl border border-amber-100 bg-amber-50/80 p-4 home-reveal home-reveal-6">
              <p className="text-sm font-extrabold text-amber-800">Verified Sellers</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-900/80">Trusted farm partners with clearer product details and order confidence.</p>
            </article>
          </div>

          {/* stats grid */}
          <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-emerald-100 bg-white/80 p-4 text-center sm:grid-cols-4">
            <div>
              <p className="text-xl font-extrabold text-emerald-700 md:text-2xl">{loading ? '-' : farmCount}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-900/70 md:text-xs">Partner Farms</p>
            </div>
            <div>
              <p className="text-xl font-extrabold text-emerald-700 md:text-2xl">{loading ? '-' : productCount}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-900/70 md:text-xs">Products Listed</p>
            </div>
            <div>
              <p className="text-xl font-extrabold text-emerald-700 md:text-2xl">{loading ? '-' : orderCount}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-900/70 md:text-xs">Orders Completed</p>
            </div>
            <div>
              <p className="text-xl font-extrabold text-emerald-700 md:text-2xl">{loading ? '-' : userCount}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-900/70 md:text-xs">Users Signed Up</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FARMS GRID ── */}
      {farms.length > 0 && (
        <section className="page-shell pt-2 md:pt-4 home-reveal home-reveal-3">
          <div className="app-card p-6 md:p-8">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-600">Our Partners</p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900 md:text-3xl">Meet the Farms</h2>
              <p className="mt-1 text-sm text-slate-500">Fresh produce sourced directly from these trusted local farms</p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {farms.map(farm => (
                <Link
                  key={farm._id}
                  href={`/products?farm_id=${farm._id}`}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50"
                >
                  <div className="h-16 w-16 overflow-hidden rounded-xl bg-white shadow-sm">
                    {farm.farm_image ? (
                      <Image
                        src={farm.farm_image}
                        alt={farm.farm_name}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl">🌾</div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition">{farm.farm_name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{farm.farm_location}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── PRODUCT CAROUSEL ── */}
      {featuredProducts.length > 0 && (
        <section className="page-shell pt-2 md:pt-4 home-reveal home-reveal-4">
          <div className="app-card p-6 md:p-8">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-600">Available Now</p>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-900 md:text-3xl">Fresh Picks</h2>
              </div>
              <Link href="/products" className="text-sm font-semibold text-emerald-700 hover:underline">
                View all →
              </Link>
            </div>

            {/* Carousel */}
            <div className="relative overflow-hidden rounded-2xl">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
              >
                {featuredProducts.map(product => (
                  <Link
                    key={product._id}
                    href={`/products/${product._id}`}
                    className="relative min-w-full"
                  >
                    <div className="aspect-[16/7] w-full overflow-hidden bg-gray-100">
                      {product.product_image ? (
                        <Image
                          src={product.product_image}
                          alt={product.product_name}
                          width={1200}
                          height={525}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-6xl">🥬</div>
                      )}
                    </div>
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-5 md:p-8">
                      {product.farm_id && (
                        <p className="mb-1 text-xs font-semibold text-emerald-300">{product.farm_id.farm_name}</p>
                      )}
                      <p className="text-xl font-extrabold text-white md:text-3xl">{product.product_name}</p>
                      <p className="mt-1 text-sm font-semibold text-white/80">
                        Rp {product.price_per_kg.toLocaleString('id-ID')}<span className="font-normal text-white/60">/kg</span>
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Prev / Next buttons */}
              <button
                onClick={() => setCarouselIndex(prev => (prev - 1 + featuredProducts.length) % featuredProducts.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white transition"
                aria-label="Previous"
              >
                ‹
              </button>
              <button
                onClick={() => setCarouselIndex(prev => (prev + 1) % featuredProducts.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white transition"
                aria-label="Next"
              >
                ›
              </button>

              {/* Dots */}
              <div className="absolute bottom-3 right-4 flex gap-1.5">
                {featuredProducts.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCarouselIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === carouselIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* footer */}
      <footer className="fixed inset-x-0 bottom-0 z-50 border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/95 via-lime-50/95 to-emerald-100/95 px-4 py-3 text-emerald-900 shadow-[0_-8px_30px_rgba(21,37,24,0.12)] backdrop-blur-sm home-reveal home-reveal-4">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-2 flex flex-wrap items-center justify-center gap-2 text-center sm:justify-between sm:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/75 px-3 py-1 text-xs font-extrabold tracking-wide text-emerald-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4 text-emerald-600"
                aria-hidden="true"
              >
                <path d="M3 10.5L12 3l9 7.5" />
                <path d="M5.5 9.5V21h13V9.5" />
              </svg>
              TRANSFARMERS
            </div>

            <p className="text-xs font-bold tracking-[0.1em] text-emerald-900 sm:text-sm">
              <span>LOCAL FARMS</span>
              <span className="mx-2 text-emerald-500">•</span>
              <span>FRESH PRODUCTS</span>
              <span className="mx-2 text-emerald-500">•</span>
              <span>EASY ORDERING</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 border-t border-emerald-200/70 pt-2 text-xs font-semibold text-emerald-800 sm:justify-between">
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=muhammad.thedy@student.sgu.ac.id&su=Transfarmers%20Inquiry"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-emerald-950 hover:underline"
              aria-label="Send email to muhammad.thedy@student.sgu.ac.id"
            >
              Contact Us: office@transfarmers.com
            </a>

            <a
              href="https://www.instagram.com/sgu.orbit?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 transition hover:text-emerald-950 hover:underline"
              aria-label="Visit our Instagram"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5Zm8.95 1.35a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z" />
              </svg>
              <span>Our Instagram</span>
            </a>

            <p className="text-emerald-700">© 2026 Transfarmers. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
