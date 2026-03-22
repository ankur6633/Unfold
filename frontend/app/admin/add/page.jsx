"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createProduct } from "@/services/productApi";
import { getAdminToken } from "@/lib/auth";

export default function AddProductPage() {
  const router = useRouter();
  const token = useMemo(() => getAdminToken(), []);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Missing admin token. Please login again.");
      return;
    }
    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }
    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError("Valid price is required.");
      return;
    }
    if (!imageFile) {
      setError("Image file is required.");
      return;
    }

    setLoading(true);
    try {
      await createProduct({ token, name, price: parsedPrice, imageFile });
      router.push("/admin/list");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create product.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Add Product</h1>
      <p className="mt-2 text-sm text-zinc-600">Upload an image to Cloudinary.</p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <label className="block">
          <span className="text-sm font-medium">Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900"
            placeholder="e.g. Delicates Wash"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Price</span>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900"
            placeholder="e.g. 199.99"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="mt-1 w-full text-sm"
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="flex h-11 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Uploading..." : "Create Product"}
        </button>
      </form>
    </div>
  );
}

