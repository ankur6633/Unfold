import { Router } from "express";
import { adminLogin } from "../controllers/authController.js";

const router = Router();

router.post("/admin-login", adminLogin);

// User Auth
router.post("/send-otp", (req, res, next) => import("../controllers/authController.js").then(m => m.sendOtp(req, res, next)));
router.post("/verify-otp", (req, res, next) => import("../controllers/authController.js").then(m => m.verifyOtp(req, res, next)));
router.post("/google-login", (req, res, next) => import("../controllers/authController.js").then(m => m.googleLogin(req, res, next)));

// Cart & Profile (Protected)
const { verifyJwt } = await import("../middleware/authMiddleware.js");
router.get("/profile", verifyJwt, (req, res, next) => import("../controllers/authController.js").then(m => m.getProfile(req, res, next)));
router.post("/cart", verifyJwt, (req, res, next) => import("../controllers/authController.js").then(m => m.updateCart(req, res, next)));
router.get("/cart", verifyJwt, (req, res, next) => import("../controllers/authController.js").then(m => m.getCart(req, res, next)));

export default router;

