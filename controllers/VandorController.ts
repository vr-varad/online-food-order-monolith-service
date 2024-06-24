import { Request, Response, NextFunction } from "express";
import { CreateVandorInputs } from "../dto";
import { Vandor } from "../models/Vandor";
import { GenPassword, GenSalt } from "../utility";

export const CreateVandor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, ownerName,email, foodType, pincode, address, phone, password } = <CreateVandorInputs>req.body;

  const existingVandor = await Vandor.findOne({email})
  if(existingVandor){
    return res.json({
        message: "Vandor Already Existed"
    })
  }
  const salt = await GenSalt();
  const hashedPassword = await GenPassword(salt, password)
  const newVandor = await Vandor.create({
    name,ownerName, foodType, email, pincode, address, phone, password: hashedPassword, rating : 0, salt: salt, serviceAvailable: false, coverImages: []
  })


  return res.json(newVandor);
};

export const GetVendors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

export const GetVendorById = (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
