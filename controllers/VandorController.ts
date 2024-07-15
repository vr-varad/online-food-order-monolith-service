import { NextFunction, Request, Response } from "express";
import { EditVendorInput, VendorLoginInputs } from "../dto";
import { findVendor } from "./AdminController";
import { GenerateToken, VerifyPassword } from "../utility";
import { CreateFoodInput } from "../dto/Food.dto";
import { Food } from "../models/Food";
import { Order } from "../models/Order";

export const VendorLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(1);
  const { email, password } = <VendorLoginInputs>req.body;

  const existingVendor = await findVendor("", email);
  console.log(existingVendor);

  if (existingVendor !== null) {
    const validation = await VerifyPassword(
      password,
      existingVendor.password,
      existingVendor.salt
    );

    if (validation) {
      const token = GenerateToken({
        _id: existingVendor.id,
        email: existingVendor.email,
        name: existingVendor.name,
      });
      return res.json({
        token,
      });
    } else {
      return res.json({
        message: "Entered Password is wrong.",
      });
    }
  }

  return res.json({
    message: "Login credentials not valid.",
  });
};

export const GetVendorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const existingUser = await findVendor(user._id);
    return res.json(existingUser);
  }

  return res.json({
    message: "User Data Not Found",
  });
};

export const UpdateVendorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, address, phone, foodType } = <EditVendorInput>req.body;

  const user = req.user;

  if (user) {
    const existingUser = await findVendor(user._id);
    if (existingUser !== null) {
      existingUser.name = name;
      existingUser.address = address;
      existingUser.phone = phone;
      existingUser.foodType = foodType;
      const savedUser = await existingUser.save();
      return res.json(savedUser);
    }
  }

  return res.json({
    message: "Vendor Data Not Found.",
  });
};

export const UpdateVendorProfilePicture = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const vendor = await findVendor(user?._id);

    const files = req.files as [Express.Multer.File];

    const images = files.map((file: Express.Multer.File) => file.filename);

    if (vendor !== null) {
      vendor.coverImages.push(...images);
      const result = await vendor.save();
      return res.json(result);
    }
  }

  return res.json({
    message: "Something went wrong.",
  });
};

export const UpdateVendorService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const existingUser = await findVendor(user._id);
    if (existingUser !== null) {
      existingUser.serviceAvailable = !existingUser.serviceAvailable;
      const savedResult = await existingUser.save();
      return res.json(savedResult);
    }
  }

  return res.json({
    message: "Vendor Data Not Found.",
  });
};

export const AddFood = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const { name, description, readyTime, category, foodType, price } = <
      CreateFoodInput
    >req.body;
    const vendor = await findVendor(user?._id);

    const files = req.files as [Express.Multer.File];

    const images = files.map((file: Express.Multer.File) => file.filename);

    if (vendor !== null) {
      const createFood = await Food.create({
        name,
        description,
        readyTime,
        category,
        foodType,
        price,
        rating: 0,
        vendorId: vendor._id,
        image: images,
      });
      vendor.food.push(createFood);
      const result = await vendor.save();
      return res.json(result);
    }
  }

  return res.json({
    message: "Something went wrong.",
  });
};

export const GetFood = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const food = await Food.find({ vendorId: user._id });
    if (food !== null) {
      return res.json(food);
    }
  }

  return res.json({
    message: "Fppd Data Not Found.",
  });
};

export const GetCurrentOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const orders = await Order.find({ vendorId: user._id }).populate(
      "items.food"
    );
    if (orders != null) {
      return res.status(200).json(orders);
    }
  }
  return res.status(400).json({
    message: "Order Data not available",
  });
};

export const GetOrderDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orderId = req.params.id;

  if (orderId) {
    const order = await Order.findById(orderId).populate("items.food");
    if (order != null) {
      return res.status(200).json(order);
    }
  }
  return res.status(400).json({
    message: "Order Data not available",
  });
};

export const ProcessOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orderId = req.params.id;

  const { status, remarks, time } = req.body;

  if (orderId) {
    const order = await Order.findById(orderId).populate("items.food");
    if (order) {
      order.orderStatus = status as string;
      order.remarks = remarks;
      if (time) {
        order.readyTime = time;
      }
      await order.save();
      return res.status(200).json(order);
    }
  }
  return res.status(400).json({
    message: "Unable to Process Order",
  });
};
