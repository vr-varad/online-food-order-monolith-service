import mongoose, { Schema, Document, model } from "mongoose";

export interface FoodDoc extends Document {
  vandorId: string;
  name: string;
  description: string;
  foodType: string;
  price: number;
  category: string;
  readyTime: number;
  rating: number;
  image: [string];
}

const FoodSchema = new Schema(
  {
    vandorId: { type: String },
    name: { type: String, required: true },
    description: { type: String, required: true },
    foodType: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String },
    readyTime: { type: Number },
    rating: { type: Number },
    image: { type: [String] },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
  }
);

const Food = mongoose.model<FoodDoc>("food", FoodSchema);

export { Food };
