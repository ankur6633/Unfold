"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import axios from "axios";
import Header from "@/components/Header";
import Footer from "@/components/Footer"; // Assuming Footer exists or I'll create one if missing

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { refreshCart } = useCart();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (session?.user?.email) {
      handleGoogleLoginSuccess(session.user);
    }
  }, [session]);

  const handleGoogleLoginSuccess = async (user) => {
    try {
      const res = await axios.post(`${apiUrl}/api/auth/google-login`, {
        email: user.email,
        name: user.name,
      });
      const { token, user: userData } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      if (userData.cart) {
        localStorage.setItem("cart", JSON.stringify(userData.cart));
      }
      await refreshCart();
      router.push("/");
    } catch (err) {
      const { showError } = require("@/lib/alert");
      showError("Login Failed", "Google login failed. Please try OTP.");
    }
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${apiUrl}/api/auth/send-otp`, { email });
      const { showToast } = require("@/lib/alert");
      showToast("OTP Sent!");
      setStep(2);
      setTimer(30); // 30 seconds cooldown
    } catch (err) {
      const { showError } = require("@/lib/alert");
      showError("OTP Failed", err?.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      const { showError } = require("@/lib/alert");
      showError("Invalid OTP", "Please enter a 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${apiUrl}/api/auth/verify-otp`, { email, otp });
      const { token, user: userData } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      if (userData.cart) {
        localStorage.setItem("cart", JSON.stringify(userData.cart));
      }
      await refreshCart();
      router.push("/");
    } catch (err) {
      const { showError } = require("@/lib/alert");
      showError("Verification Failed", err?.response?.data?.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="text-center">
          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Welcome Back</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Login to your account</p>
        </div>


        <div className="mt-8 space-y-6">
          <button
            onClick={() => signIn("google")}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="h-5 w-5" />
            Continue with Google
          </button>

          <div className="relative flex items-center py-5">
            <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
            <span className="mx-4 flex-shrink text-xs font-medium uppercase text-zinc-500">Or continue with OTP</span>
            <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">OTP Code</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                    className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 text-center text-lg font-black tracking-[0.5em] outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
                    placeholder="000000"
                  />
                </div>
                <p className="mt-2 text-[10px] text-center text-zinc-400 uppercase tracking-widest font-bold">Expires in 5 minutes</p>
              </div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-black uppercase tracking-widest text-white transition hover:bg-blue-500 disabled:opacity-50 shadow-lg shadow-blue-500/20"
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </button>
              
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  disabled={timer > 0 || loading}
                  onClick={() => handleSendOtp()}
                  className="w-full text-xs font-bold text-blue-600 hover:text-blue-700 disabled:text-zinc-400 flex items-center justify-center gap-2"
                >
                  {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-[10px] uppercase font-black tracking-widest text-zinc-400 hover:text-zinc-600"
                >
                  Change Email
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
      <Footer />
    </div>
  );
}
