"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSyncExternalStore } from "react";

function subscribeToAuth(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getAuthSnapshot() {
  if (typeof window === "undefined") return false;
  return !!sessionStorage.getItem("token");
}

export default function Navbar() {
  const router = useRouter();
  const isLoggedIn = useSyncExternalStore(
    subscribeToAuth,
    getAuthSnapshot,
    () => false
  );

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
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
    className="pill-btn bg-orange-500 text-white hover:bg-orange-600"
  >
    Cart
  </button>
  <Link
  href="/orders"
  className="pill-btn bg-slate-100 text-slate-700 hover:bg-slate-200"
>
  Orders
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