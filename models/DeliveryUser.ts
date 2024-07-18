import mongoose, { Schema, Document, model } from "mongoose";

interface DeliveryUserDoc extends Document {
  email: string;
  password: string;
  salt: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  verified: boolean;
  lat: number;
  lan: number;
  cart: [any];
  isAvailable: boolean;
  pincode: string
}

const DeliveryUserSchema = new Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    address: { type: String },
    phone: { type: String, required: true },
    verified: { type: Boolean, required: true },
    lat: { type: Number },
    lan: { type: Number },
    isAvailable: {type: Boolean},
    pincode: {type: String}
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, rel) {
        delete rel.password;
        delete rel.salt;
        delete rel.__v;
        delete rel.createdAt;
        delete rel.updatedAt;
      },
    },
  }
);

const DeliveryUser = mongoose.model<DeliveryUserDoc>("deliveryUser", DeliveryUserSchema);

export { DeliveryUser };
