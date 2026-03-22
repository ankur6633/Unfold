import express from "express";
import { 
  getServices, 
  createService, 
  updateService,
  deleteService,
  createItem, 
  mapServiceItem,
  getItems,
  getMappings
} from "../controllers/serviceController.js";
import { verifyJwt, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getServices);

// Admin routes (requires auth and admin role)
router.get("/admin/items", verifyJwt, adminOnly, getItems);
router.get("/admin/mappings", verifyJwt, adminOnly, getMappings);
router.post("/admin/services", verifyJwt, adminOnly, createService);
router.put("/admin/services/:id", verifyJwt, adminOnly, updateService);
router.delete("/admin/services/:id", verifyJwt, adminOnly, deleteService);
router.post("/admin/items", verifyJwt, adminOnly, createItem);
router.post("/admin/service-items", verifyJwt, adminOnly, mapServiceItem);

export default router;
