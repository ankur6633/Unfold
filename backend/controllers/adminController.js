import User from "../models/User.js";
import Order from "../models/Order.js";

export async function getAllUsers(req, res) {
  try {
    const users = await User.find({}, "-password").lean();
    
    // Enrich users with order counts
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const orderCount = await Order.countDocuments({ userEmail: user.email });
      return { ...user, orderCount };
    }));

    return res.status(200).json(usersWithStats);
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ message: "Failed to fetch users." });
  }
}

export async function getUserOrders(req, res) {
  try {
    const { email } = req.params;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const orders = await Order.find({ userEmail: email }).sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching user orders:", err);
    return res.status(500).json({ message: "Failed to fetch orders." });
  }
}
