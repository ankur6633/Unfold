import mongoose from "mongoose";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { sendOrderConfirmationEmail } from "./emailController.js";

const ALLOWED_STATUSES = new Set(["Booked", "Pickup", "Washing", "Washed", "Delivered"]);

function parseQuantity(value) {
  const q = Number(value);
  if (!Number.isFinite(q) || q < 1) return 1;
  return Math.floor(q);
}

export async function createOrder(req, res) {
  try {
    const { userEmail, items, totalPrice } = req.body ?? {};
    const userId = req.user?.userId;

    if (!userEmail || typeof userEmail !== "string") {
      return res.status(400).json({ message: "userEmail is required." });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "items must be a non-empty array." });
    }

    // items should now be an array of ServiceItemGroupSchema objects
    // The frontend sends the entire cart which matches the schema
    const order = await Order.create({
      userId,
      userEmail: userEmail.trim(),
      items: items, 
      totalPrice,
      status: "Booked",
    });

    // Email failures should not break order creation.
    try {
      await sendOrderConfirmationEmail({ to: order.userEmail, order });
    } catch (emailErr) {
      console.error("Order email failed:", emailErr?.message || emailErr);
    }

    return res.status(201).json(order);
  } catch (err) {
    return res.status(500).json({ message: err?.message || "Internal server error." });
  }
}

export async function getOrdersByUserEmail(req, res) {
  try {
    const { email } = req.params ?? {};
    if (!email) return res.status(400).json({ message: "Email is required." });

    const orders = await Order.find({ userEmail: email.trim() }).sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (err) {
    return res.status(500).json({ message: "Failed to load orders." });
  }
}

export async function getAllOrders(_req, res) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (err) {
    return res.status(500).json({ message: "Failed to load orders." });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params ?? {};
    const { status } = req.body ?? {};

    if (!id) return res.status(400).json({ message: "Order id is required." });
    if (!status || typeof status !== "string") {
      return res.status(400).json({ message: "status is required." });
    }
    if (!ALLOWED_STATUSES.has(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const updated = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Order not found." });

    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update order." });
  }
}

