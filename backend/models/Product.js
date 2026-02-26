import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  weight: String,
  image: String,
});

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
