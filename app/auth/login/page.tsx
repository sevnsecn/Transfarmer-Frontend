'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react'; // Suspense is required because useSearchParams() can only run on the client, not during server-side rendering 
// [ALWAYS USE SUSPENSE WHEN USING useSearchParams()]

function LoginPage() {
  const router = useRouter();  // what actually redirects the user
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect'); //allows paramaters used to set where to redirect after login, works together with router
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // If the user already has a token, validate it before redirecting.
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      router.push(redirect ||'/dashboard'); // if the user is already logged in, redirect to a page set in the params or dashboard by default
    }
  }, [router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('submitting', email, password)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_email: email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      
      sessionStorage.setItem('token', data.token); // Save JWT token in sessionStorage
      sessionStorage.setItem('user', JSON.stringify(data.user)); // store the user object that contains id, user_name, user_email, is_admin

      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="app-card p-8">
          <h1 className="mb-2 text-center text-3xl font-extrabold text-slate-900">Welcome Back</h1>
          <p className="mb-8 text-center text-slate-600">Sign in to your Transfarmers account</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
              onBlur={(e) => {
                if (!e.target.value) setEmailError('Email is required');
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) setEmailError('Please enter a valid email');
              }}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
            {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
              onBlur={(e) => {
                if (!e.target.value) setPasswordError('Password is required');
              }}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-600 py-2 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="font-semibold text-emerald-700 hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  );
}