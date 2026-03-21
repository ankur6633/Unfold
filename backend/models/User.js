import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: String,
  price: Number,
  image: String,
  quantity: { type: Number, default: 1 }
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  role: { type: String, default: "user" },
  cart: [cartItemSchema],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
export default User;
