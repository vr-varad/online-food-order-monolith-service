import mongoose, { Schema, Document, model } from "mongoose";

export interface OfferDoc extends Document {
  offerType: string;
  vendors: [any];
  title: string;
  description: string;
  minValue: number;
  offerAmount: number;
  startValidity: Date;
  endValidity: Date;
  promocode: string;
  bank: [any];
  bins: [any];
  pincode: string;
  isActive: boolean;
}

const OfferSchema = new Schema(
  {
    offerType: { type: String, required: true },
    vendors: [{
      type: Schema.Types.ObjectId,
      ref: "vendor",
    }],
    title: { type: String, required: true },
    description: String,
    minValue: { type: Number, required: true },
    offerAmount: { type: Number, required: true },
    startValidity: Date,
    endValidity: Date,
    promocode: { type: String, required: true },
    bank: [{ type: String }],
    bins: [{ type: Number }],
    pincode: { type: String },
    isActive: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
      },
    },
  }
);

const Offer = mongoose.model<OfferDoc>("offer", OfferSchema);

export { Offer };
