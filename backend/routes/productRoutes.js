import { Router } from "express";
import multer from "multer";
import { adminOnly, verifyJwt } from "../middleware/authMiddleware.js";
import {
  createProduct,
  deleteProduct,
  getProducts,
} from "../controllers/productController.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Public: products for website
router.get("/", getProducts);

// Admin: create/delete products
router.post("/", verifyJwt, adminOnly, (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) return next(err);
    next();
  });
}, createProduct);
router.delete("/:id", verifyJwt, adminOnly, deleteProduct);

export default router;

