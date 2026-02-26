const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
  city: String,
  storeName: String,
  address: String
});

module.exports = mongoose.model("Store", storeSchema);
