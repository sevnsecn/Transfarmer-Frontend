import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="page-shell pt-14 md:pt-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
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
                className="pill-btn bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Browse Products
              </Link>
              <Link
                href="/dashboard"
                className="pill-btn border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50"
              >
                Open Dashboard
              </Link>
            </div>
          </div>

          <div className="app-card p-6">
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
    </main>
  );
}
