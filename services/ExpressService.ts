import { AdminRouter, VendorRouter, ShoppingRouter, CustomerRouter, DeliveryUserRouter } from "../routes";
import path from "path";
import express, { Application } from "express";

export default async (app: Application) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/images", express.static(path.join(__dirname, "../images")));

  app.use("/admin", AdminRouter);
  app.use("/vandor", VendorRouter);
  app.use("/customer",CustomerRouter)
  app.use("/delivery-user",DeliveryUserRouter)
  app.use(ShoppingRouter)
};
