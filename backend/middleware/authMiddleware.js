import jwt from "jsonwebtoken";

export function verifyJwt(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    // Accept either "Bearer <token>" or raw token.
    const token =
      authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ message: "Server misconfigured." });
    }

    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;

    return next();
  } catch (_err) {
    return res.status(401).json({ message: "Unauthorized." });
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Forbidden." });
  }
  return next();
}

