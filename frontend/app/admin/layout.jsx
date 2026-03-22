"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

export default function ManageLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // 1. Allow the admin login page to render without a token check.
    if (pathname === "/admin/login") {
      setTimeout(() => setIsAuthorized(true), 0);
      return;
    }

    const localToken = localStorage.getItem("admin_token");
    const cookieToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("admin_token="))
      ?.split("=")[1];
    const decodedCookieToken = cookieToken
      ? decodeURIComponent(cookieToken)
      : null;

    // 2. If no token, redirect to ADMIN login (not user login)
    if (!localToken && !decodedCookieToken) {
      router.replace("/admin/login");
      return;
    }
    // Defer the state update to avoid React render cascading warnings.
    setTimeout(() => setIsAuthorized(true), 0);
  }, [router, pathname]);

  if (!isAuthorized) return null;

  // If we are on the login page, don't show the sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex bg-zinc-50 dark:bg-zinc-950">
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
      />
      
      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 lg:hidden dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-lg font-bold">Unfold Admin</span>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

