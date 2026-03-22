"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/services/api";
import Swal from "sweetalert2";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  async function loadCart() {
    console.log("Cart: Starting rehydration...");
    let localCart = [];
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          localCart = parsed.filter(group => Array.isArray(group.items));
          setCart(localCart);
        }
      } catch (e) {
        console.error("Cart: Parse error:", e);
      }
    }

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const apiUrl = API_BASE_URL;
        const res = await axios.get(`${apiUrl}/api/auth/cart`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.cart) {
          const backendCart = res.data.cart.filter(group => Array.isArray(group.items));
          
          // Merge strategy: if backend has items, prefer it. 
          // But if local has items and backend is empty, maybe sync local to backend.
          // For simplicity, if backend cart has anything, we trust it, otherwise we keep local.
          if (backendCart.length > 0) {
            console.log("Cart: Using backend data");
            setCart(backendCart);
            localStorage.setItem("cart", JSON.stringify(backendCart));
          } else if (localCart.length > 0) {
            console.log("Cart: Backend empty, keeping local data and syncing...");
            await syncCartWithBackend(localCart);
          }
        }
      } catch (err) {
        console.error("Cart: Backend fetch failed:", err);
      }
    }
    
    setLoading(false);
    setInitialLoad(false);
    console.log("Cart: Rehydration complete");
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function syncCartWithBackend(cartItems) {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const apiUrl = API_BASE_URL;
      await axios.post(`${apiUrl}/api/auth/cart`, { cart: cartItems }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Failed to sync cart:", err);
    }
  }

  useEffect(() => {
    if (initialLoad) return;
    localStorage.setItem("cart", JSON.stringify(cart));
    syncCartWithBackend(cart);
  }, [cart, initialLoad]);

  function calculateServiceTotal(service, items) {
    if (service.priceType === "kg") {
      // For kg, we sum quantities and multiply by base price
      // In a real app, this might be a weight input, but for now we'll sum item quantities
      const totalWeight = items.reduce((sum, item) => sum + item.quantity, 0);
      return service.basePrice * totalWeight;
    } else if (service.priceType === "piece" || service.priceType === "pair") {
      const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
      return service.basePrice * totalQty;
    } else if (service.priceType === "bundle") {
      return service.basePrice;
    }
    return 0;
  }

  function addToCart(service, itemsToUpdate) {
    setCart((prev) => {
      const existingGroupIndex = prev.findIndex((g) => g.serviceId === service._id);
      let newCart = [...prev];

      if (existingGroupIndex > -1) {
        // Update existing group
        const existingGroup = { ...newCart[existingGroupIndex] };
        const updatedItems = [...existingGroup.items];

        itemsToUpdate.forEach((item) => {
          const itemIndex = updatedItems.findIndex((i) => i.itemId === item.itemId);
          if (itemIndex > -1) {
            updatedItems[itemIndex].quantity += item.quantity;
            if (updatedItems[itemIndex].quantity <= 0) {
              updatedItems.splice(itemIndex, 1);
            }
          } else if (item.quantity > 0) {
            updatedItems.push(item);
          }
        });

        existingGroup.items = updatedItems;
        existingGroup.serviceTotal = calculateServiceTotal(service, updatedItems);
        newCart[existingGroupIndex] = existingGroup;
      } else {
        // Add new group (even if items array is empty)
        newCart.push({
          serviceId: service._id,
          serviceName: service.name,
          priceType: service.priceType,
          basePrice: service.basePrice,
          items: itemsToUpdate || [],
          serviceTotal: calculateServiceTotal(service, itemsToUpdate || []),
        });
      }
      return newCart;
    });
  }

  function removeFromCart(serviceId) {
    setCart((prev) => prev.filter((group) => group.serviceId !== serviceId));
  }

  function updateItemQuantity(serviceId, itemId, delta, itemDetails = {}) {
    setCart((prev) => {
      return prev.map((group) => {
        if (group.serviceId === serviceId) {
          let itemFound = false;
          const updatedItems = group.items.map((item) => {
            if (item.itemId === itemId) {
              itemFound = true;
              return { ...item, quantity: Math.max(0, item.quantity + delta) };
            }
            return item;
          }).filter(item => item.quantity > 0);

          if (!itemFound && delta > 0) {
            updatedItems.push({ 
              itemId, 
              name: itemDetails.name || "Item", 
              quantity: delta 
            });
          }

          if (updatedItems.length === 0) {
            // Keep the group even if empty so user can add items back in Cart Page
            return {
              ...group,
              items: [],
              serviceTotal: 0
            };
          }

          return {
            ...group,
            items: updatedItems,
            serviceTotal: calculateServiceTotal(
              { priceType: group.priceType, basePrice: group.basePrice },
              updatedItems
            ),
          };
        }
        return group;
      });
    });
  }

  function clearCart() {
    setCart([]);
    localStorage.removeItem("cart");
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateItemQuantity, clearCart, loading, refreshCart: loadCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
