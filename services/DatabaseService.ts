import mongoose, { mongo } from "mongoose";
import dotenv from 'dotenv'
dotenv.config();
export default async () => {
  mongoose
    .connect(process.env.mongo_url as string)
    .then(() => console.log("DB Connected"))
    .catch((e) => console.log(e.message));
};
