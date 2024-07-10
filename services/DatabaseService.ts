import mongoose, { mongo } from "mongoose";
const mongo_url = "mongodb://localhost:27017"
export default async () => {
  mongoose
    .connect(mongo_url)
    .then(() => console.log("DB Connected"))
    .catch((e) => console.log(e.message));
};
