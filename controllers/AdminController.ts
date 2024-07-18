import { Request, Response, NextFunction } from "express";
import { CreateVendorInputs } from "../dto";
import { Vendor } from "../models/Vendor";
import { GenPassword, GenSalt } from "../utility";
import { Transaction } from "../models/Transaction";

export const findVendor = async (id: string | undefined, email?: string) => {
  if (email) {
    return await Vendor.findOne({ email: email });
  } else {
    return await Vendor.findById(id);
  }
};

export const CreateVendor = async (
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
  } = <CreateVendorInputs>req.body;

  const existingVendor = await findVendor("", email);
  if (existingVendor) {
    return res.json({
      message: "Vendor Already Existed",
    });
  }
  const salt = await GenSalt();
  const hashedPassword = await GenPassword(salt, password);
  const newVendor = await Vendor.create({
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

  return res.json(newVendor);
};

export const GetVendors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const vendors = await Vendor.find();

  if (vendors !== null) {
    return res.json(vendors);
  }

  return res.json({
    message: "No Vendors Availbale",
  });
};

export const GetVendorById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const vendorId = req.params.id;

  const vendor = await findVendor(vendorId);

  if (vendor !== null) {
    return res.json(vendor);
  }

  return res.json({
    message: "No Vendor Found",
  });
};

export const GetAllTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const transactions = await Transaction.find();
  if (transactions) {
    return res.status(200).json(transactions);
  }
  return res.status(404).json({
    message: "Error Fetching the transactions",
  });
};

export const GetTransactionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const txnId = req.params.id;
  if (txnId) {
    const transaction = await Transaction.findById(txnId);
    if (transaction) {
      return res.status(200).json(transaction);
    }
  }
  return res.status(404).json({
    message: "Error Fetching the transaction",
  });
};
