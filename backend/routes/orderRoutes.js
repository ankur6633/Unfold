import { Router } from "express";
import { adminOnly, verifyJwt } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getAllOrders,
  getOrdersByUserEmail,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = Router();

// User-facing
router.post("/", verifyJwt, createOrder);
router.get("/user/:email", getOrdersByUserEmail);

// Admin
router.get("/", verifyJwt, adminOnly, getAllOrders);
router.put("/:id", verifyJwt, adminOnly, updateOrderStatus);

export default router;

