import { Request, Response, NextFunction } from "express";
import { CreateVandorInputs } from "../dto";
import { Vandor } from "../models/Vandor";
import { GenPassword, GenSalt } from "../utility";

export const findVandor = async (id: string | undefined, email?: string) => {
  if (email) {
    return await Vandor.findOne({ email: email });
  } else {
    return await Vandor.findById(id);
  }
};

export const CreateVandor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    name,
    ownerName,
    email,
    foodType,
    pincode,
    address,
    phone,
    password,
  } = <CreateVandorInputs>req.body;

  const existingVandor = await findVandor("", email);
  if (existingVandor) {
    return res.json({
      message: "Vandor Already Existed",
    });
  }
  const salt = await GenSalt();
  const hashedPassword = await GenPassword(salt, password);
  const newVandor = await Vandor.create({
    name,
    ownerName,
    foodType,
    email,
    pincode,
    address,
    phone,
    password: hashedPassword,
    rating: 0,
    salt: salt,
    serviceAvailable: false,
    coverImages: [],
  });

  return res.json(newVandor);
};

export const GetVendors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const vandors = await Vandor.find();

  if (vandors !== null) {
    return res.json(vandors);
  }

  return res.json({
    message: "No Vandors Availbale",
  });
};

export const GetVendorById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const vandorId = req.params.id;

  const vandor = await findVandor(vandorId);

  if (vandor !== null) {
    return res.json(vandor);
  }

  return res.json({
    message: "No Vandor Found",
  });
};
