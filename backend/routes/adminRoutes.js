import express from "express";
import { getAllUsers, getUserOrders } from "../controllers/adminController.js";
import { verifyJwt, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyJwt, adminOnly);

router.get("/users", getAllUsers);
router.get("/users/:email/orders", getUserOrders);

export default router;
