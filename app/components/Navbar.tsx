"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);

  const fetchNavbarCounts = async () => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      setCartCount(0);
      setOrdersCount(0);
      return;
    }

    try {
      const [cartRes, ordersRes] = await Promise.all([
        fetch("/api/orderItems", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/orders/my-orders", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const cartData = await cartRes.json();
      if (cartData.success && Array.isArray(cartData.data)) {
        const totalItems = cartData.data.reduce(
          (sum: number, item: { quantity?: number }) => sum + (item.quantity ?? 0),
          0
        );
        setCartCount(totalItems);
      } else {
        setCartCount(0);
      }

      const ordersData = await ordersRes.json();
      if (ordersData.success && Array.isArray(ordersData.data)) {
        setOrdersCount(ordersData.data.length);
      } else {
        setOrdersCount(0);
      }
    } catch {
      setCartCount(0);
      setOrdersCount(0);
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = sessionStorage.getItem("token");
      setIsLoggedIn(!!token);
      void fetchNavbarCounts();
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);

    //biar langsung update tanpa refresh yak
    window.addEventListener("authChange", checkAuth);
    window.addEventListener("cartUpdated", fetchNavbarCounts);
    window.addEventListener("ordersUpdated", fetchNavbarCounts);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("authChange", checkAuth);
      window.removeEventListener("cartUpdated", fetchNavbarCounts);
      window.removeEventListener("ordersUpdated", fetchNavbarCounts);
    };
  }, []);

  useEffect(() => {
    void fetchNavbarCounts();
  }, [pathname]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    //update to the navbar ya
    window.dispatchEvent(new Event("authChange"));

    router.push("/auth/login");
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-emerald-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">

        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-gray-900 md:text-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5 text-emerald-600 md:h-6 md:w-6"
            aria-hidden="true"
          >
            <path d="M3 10.5L12 3l9 7.5" />
            <path d="M5.5 9.5V21h13V9.5" />
          </svg>
          <span>Transfarmers</span>
        </Link>

       <div className="flex flex-wrap items-center gap-2 md:gap-3">

  {/* Products Button */}
<button
  onClick={() => router.push("/products")}
  className="pill-btn bg-emerald-600 text-white hover:bg-emerald-700"
>
  Products
</button>

  {/* Cart Button */}
  <button
    onClick={() => router.push("/cart")}
    className="pill-btn relative inline-flex items-center bg-orange-500 text-white hover:bg-orange-600"
  >
    Cart
    {isLoggedIn && cartCount > 0 && (
      <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-white px-1.5 py-0.5 text-[11px] font-extrabold leading-none text-orange-600">
        {cartCount > 99 ? "99+" : cartCount}
      </span>
    )}
  </button>
  <Link
  href="/orders"
  className="pill-btn inline-flex items-center bg-slate-100 text-slate-700 hover:bg-slate-200"
>
  Orders
  {isLoggedIn && ordersCount > 0 && (
    <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-slate-700 px-1.5 py-0.5 text-[11px] font-extrabold leading-none text-white">
      {ordersCount > 99 ? "99+" : ordersCount}
    </span>
  )}
</Link>

  {isLoggedIn ? (
    <>
      <button
        onClick={() => router.push("/dashboard")}
        className="pill-btn bg-lime-600 text-white hover:bg-lime-700"
      >
        Dashboard
      </button>
      <button
        onClick={handleLogout}
        className="pill-btn bg-slate-900 text-white hover:bg-black"
      >
        Logout
      </button>
    </>
  ) : (
    <>
      <Link
        href="/auth/login"
        className="pill-btn bg-sky-600 text-white hover:bg-sky-700"
      >
        Login
      </Link>

      <Link
        href="/auth/signup"
        className="pill-btn bg-green-600 text-white hover:bg-green-700"
      >
        Sign Up
      </Link>
    </>
  )}

</div>

      </div>
    </nav>
  );
}