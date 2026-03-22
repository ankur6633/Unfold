"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import { deleteProduct, fetchProducts } from "@/services/productApi";
import { getAdminToken } from "@/lib/auth";

export default function ManageListPage() {
  const token = useMemo(() => getAdminToken(), []);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await fetchProducts();
        if (mounted) setProducts(data);
      } catch (err) {
        console.error(err);
        if (mounted) setError("Failed to load products.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleDelete(id) {
    setError("");
    if (!token) {
      setError("Missing admin token. Please login again.");
      return;
    }

    setDeletingId(id);
    try {
      await deleteProduct({ token, id });
      setProducts((prev) => prev.filter((p) => String(p._id) !== String(id)));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="mt-2 text-sm text-zinc-600">Create, view, and delete products.</p>
        </div>
        <a
          href="/admin/add"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500"
        >
          Add Product
        </a>
      </div>

      {error ? (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-8 text-sm text-zinc-600 dark:text-zinc-300">Loading...</div>
      ) : products.length === 0 ? (
        <div className="mt-8 text-sm text-zinc-600 dark:text-zinc-300">
          No products yet.
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product._id}
              className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              {product.image ? (
                <div className="relative h-44 w-full">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <div className="p-4">
                <div className="text-base font-semibold">{product.name}</div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  ${product.price}
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(product._id)}
                  disabled={deletingId === product._id}
                  className="mt-4 flex h-10 w-full items-center justify-center rounded-lg bg-red-600 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingId === product._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

