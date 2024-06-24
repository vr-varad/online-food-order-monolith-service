import { AdminRouter, VandorRouter } from "./routes";
import mongoose from "mongoose";

import express from 'express';
import { mongo_url } from "./config";

const app = express();

app.use(express.json())
app.use(express.urlencoded({extended: true}));

app.use("/admin",AdminRouter)
app.use("/vandor",VandorRouter)

mongoose.connect(mongo_url).then(()=>console.log("DB Connected")).catch((e)=>console.log(e.message))

app.listen(8080,()=>{
    console.log("Server Running At port 8080")
})