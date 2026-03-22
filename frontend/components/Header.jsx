"use client";

import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { logout } from "@/lib/auth";

import { useState, useEffect } from "react";

export default function Header() {
  const { data: session } = useSession();
  const { cart, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = cart.length;

  const isLoggedIn = session || (mounted && typeof window !== "undefined" && localStorage.getItem("token"));
  const userEmail = session?.user?.email || (mounted && typeof window !== "undefined" && JSON.parse(localStorage.getItem("user") || "{}").email);

  const handleLogout = async () => {
    const { showConfirm } = require("@/lib/alert");
    const result = await showConfirm(
      "Logout Confirmation",
      "Are you sure you want to log out?"
    );

    if (result.isConfirmed) {
      clearCart();
      if (session) {
        signOut();
      }
      logout();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tight text-blue-600">
            UNFOLD
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">Home</Link>
            <Link href="#about" className="hover:text-zinc-900 dark:hover:text-zinc-100">About</Link>
            <Link href="/pricing" className="hover:text-zinc-900 dark:hover:text-zinc-100">Pricing</Link>
            {isLoggedIn && (
               <>
                 <Link href="/orders" className="hover:text-zinc-900 dark:hover:text-zinc-100">Orders</Link>
                 <Link href="/profile" className="hover:text-zinc-900 dark:hover:text-zinc-100">Profile</Link>
               </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn && (
            <Link href="/cart" className="relative p-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {isLoggedIn ? (
            <div className="flex items-center gap-4">
               <span className="hidden sm:inline text-xs font-medium text-zinc-500">
                {userEmail}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-500"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
