import mongoose, { Schema, Document, model } from "mongoose";

interface TransactionDoc extends Document {
    customer: string,
    vendor: string,
    order: string,
    orderAmount: number,
    offerUsed: string,
    status: string,
    paymentMode: string,
    paymentMethod: string
}

const TransactionSchema = new Schema(
  {
    customer: {type: String, required: true},
    vendor: {type: String},
    order: {type: String},
    orderAmount: {type: Number, required: true},
    offerUsed: {type: String, required: true},
    status: {type: String, required: true},
    paymentMode: {type: String, required: true},
    paymentMethod: {type: String, required: true}
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, rel) {
        delete rel.__v;
      },
    },
  }
);

const Transaction = mongoose.model<TransactionDoc>("transaction", TransactionSchema);

export { Transaction };
