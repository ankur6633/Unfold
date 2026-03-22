"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdminLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/auth/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Invalid credentials.");
      }

      const data = await res.json();
      const token = data?.token;
      if (!token) throw new Error("Invalid response from server.");

      // Required: store token in localStorage for client-side checks.
      localStorage.setItem("admin_token", token);

      // Also set a cookie so Next.js middleware can protect /admin.
      const isHttps = window.location.protocol === "https:";
      document.cookie = [
        `admin_token=${encodeURIComponent(token)}`,
        "path=/",
        `max-age=${60 * 60 * 24}`,
        "SameSite=Lax",
        ...(isHttps ? ["Secure"] : []),
      ].join("; ");

      router.push("/admin");
    } catch (err) {
      setError(err?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white px-4 py-12 text-zinc-900 dark:from-black dark:to-black dark:text-zinc-100">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-3xl font-bold tracking-tight">Login</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-300">
          Google login is for users. Admin access uses email + password.
        </p>

        {session?.user?.email ? (
          <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-4 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="font-semibold">Signed in as</div>
            <div className="mt-1 text-zinc-700 dark:text-zinc-200">
              {session.user.email}
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => signIn("google")}
            className="flex h-11 items-center justify-center rounded-full bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Continue with Google
          </button>

          <div className="my-2 h-px w-full bg-zinc-200 dark:bg-zinc-800" />

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Admin Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900"
                placeholder="admin@example.com"
                autoComplete="email"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Admin Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </label>

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Admin Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

