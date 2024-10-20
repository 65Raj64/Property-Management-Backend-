const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    propertyType: { type: String, enum: ["residential", "commercial"] },
    images: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", PropertySchema);
