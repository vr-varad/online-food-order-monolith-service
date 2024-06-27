import mongoose from "mongoose";
import { mongo_url } from "../config";

export default async () => {
  mongoose
    .connect(mongo_url)
    .then(() => console.log("DB Connected"))
    .catch((e) => console.log(e.message));
};
