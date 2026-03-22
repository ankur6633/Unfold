import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: String,
  price: Number,
  image: String,
  quantity: { type: Number, default: 1 }
});

const addressSchema = new mongoose.Schema({
  label: { type: String, required: true }, // e.g., 'Home', 'Office'
  line1: { type: String, required: true },
  line2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  fullName: { type: String },
  mobile: { type: String },
  altMobile: { type: String },
  role: { type: String, default: "user" },
  cart: [cartItemSchema],
  addresses: [addressSchema],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
export default User;
