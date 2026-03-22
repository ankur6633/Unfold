"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-12 dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-xl font-bold tracking-tight text-blue-600">
              UNFOLD
            </Link>
            <p className="mt-4 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
              Enterprise-grade laundry and dry cleaning services delivered to your doorstep. Experience the ultimate in garment care.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              <li><Link href="/" className="hover:text-blue-600 transition-colors">Home</Link></li>
              <li><Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link></li>
              <li><Link href="/orders" className="hover:text-blue-600 transition-colors">My Orders</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Support</h3>
            <ul className="mt-4 space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-zinc-100 pt-8 dark:border-zinc-800">
          <p className="text-center text-xs text-zinc-400">
            &copy; {new Date().getFullYear()} Unfold Laundry Services. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
