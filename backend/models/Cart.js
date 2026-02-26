import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, default: 1, min: 1 },
  price: { type: Number, required: true } // price at time of adding to cart
});

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [cartItemSchema]
}, { timestamps: true });

export default mongoose.models.Cart || mongoose.model("Cart", cartSchema);
