"use client";

import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      {product.image ? (
        <div className="relative h-56 w-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-56 items-center justify-center bg-zinc-100 dark:bg-zinc-800">
          <span className="text-zinc-400">No Image</span>
        </div>
      )}
      
      <div className="p-5">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{product.name}</h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Professional cleaning</p>
        
        <div className="mt-6 flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">${product.price}</span>
          <button
            onClick={() => addToCart(product)}
            className="rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
