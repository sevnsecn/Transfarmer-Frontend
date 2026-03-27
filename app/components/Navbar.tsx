"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

        <Link href="/" className="text-xl font-bold text-gray-900">
          Transfarmers
        </Link>

       <div className="flex gap-3">

  {/* Products Button */}
<button
  onClick={() => router.push("/products")}
  className="text-sm font-semibold bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellos-700 transition"
>
  Products
</button>

  {/* Cart Button */}
  <button
    onClick={() => router.push("/cart")}
    className="text-sm font-semibold bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
  >
    Cart
  </button>
  <Link
  href="/orders"
  className="px-3 py-1 rounded-lg hover:bg-gray-100 transition"
>
  📦 Orders
</Link>

  {isLoggedIn ? (
    <button
      onClick={() => router.push("/dashboard")}
      className="text-sm font-semibold bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellos-700 transition"
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
  );
}