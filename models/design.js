import mongoose from "mongoose";

const designSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  imageUrl: { type: String, required: true },
  originalImage: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  config: {
    zoom: { type: Number, default: 1 },
    offset: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
    cropBox: {
      x: { type: Number, default: 50 },
      y: { type: Number, default: 50 },
      size: { type: Number, default: 64 },
    },
    borderRadius: { type: Number, default: 0 },
    saturate: { type: Number, default: 1 },
    blur: { type: Number, default: 0 },
    invert: { type: Number, default: 0 },
    brightness: { type: Number, default: 1 },
  }
});

const Design = mongoose.model("Design", designSchema);
export default Design;
