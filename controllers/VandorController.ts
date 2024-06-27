import { NextFunction, Request, Response } from "express";
import { EditVandorInput, VandorLoginInputs } from "../dto";
import { findVandor } from "./AdminController";
import { GenerateToken, VerifyPassword } from "../utility";
import { CreateFoodInput } from "../dto/Food.dto";
import { Food } from "../models/Food";

export const VandorLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(1);
  const { email, password } = <VandorLoginInputs>req.body;

  const existingVendor = await findVandor("", email);
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

export const GetVandorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const existingUser = await findVandor(user._id);
    return res.json(existingUser);
  }

  return res.json({
    message: "User Data Not Found",
  });
};

export const UpdateVandorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, address, phone, foodType } = <EditVandorInput>req.body;

  const user = req.user;

  if (user) {
    const existingUser = await findVandor(user._id);
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
    message: "Vandor Data Not Found.",
  });
};

export const UpdateVandorProfilePicture = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const user = req.user;

  if (user) {
    const vandor = await findVandor(user?._id);

    const files = req.files as [Express.Multer.File]

    const images = files.map((file: Express.Multer.File) => file.filename)

    if (vandor !== null) {
      vandor.coverImages.push(...images)
      const result = await vandor.save();
      return res.json(result);
    }
  }

  return res.json({
    message: "Something went wrong.",
  });
};

export const UpdateVandorService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const existingUser = await findVandor(user._id);
    if (existingUser !== null) {
      existingUser.serviceAvailable = !existingUser.serviceAvailable;
      const savedResult = await existingUser.save();
      return res.json(savedResult);
    }
  }

  return res.json({
    message: "Vandor Data Not Found.",
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
    const vandor = await findVandor(user?._id);

    const files = req.files as [Express.Multer.File]

    const images = files.map((file: Express.Multer.File) => file.filename)

    if (vandor !== null) {
      const createFood = await Food.create({
        name,
        description,
        readyTime,
        category,
        foodType,
        price,
        rating: 0,
        vandorId: vandor._id,
        image: images,
      });
      vandor.food.push(createFood);
      const result = await vandor.save();
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
    const food = await Food.find({ vandorId: user._id });
    if (food !== null) {
      return res.json(food);
    }
  }

  return res.json({
    message: "Fppd Data Not Found.",
  });
};
