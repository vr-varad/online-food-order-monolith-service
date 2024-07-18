import { NextFunction, Request, Response } from "express";
import { CreateOfferInput, EditVendorInput, VendorLoginInputs } from "../dto";
import { findVendor } from "./AdminController";
import { GenerateToken, VerifyPassword } from "../utility";
import { CreateFoodInput } from "../dto/Food.dto";
import { Food } from "../models/Food";
import { Order } from "../models/Order";
import { Vendor } from "../models/Vendor";
import { Offer } from "../models/Offer";

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
  const {lat,lan} = req.body;

  if (user) {
    const existingUser = await findVendor(user._id);
    if (existingUser !== null) {
      existingUser.serviceAvailable = !existingUser.serviceAvailable;
      if(lan && lat){
        existingUser.lan = lan
        existingUser.lat = lat
      }
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

export const GetOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const offers = await Offer.find().populate("vendors");
    let currentOffers = [] as any;
    if (offers) {
      offers.map((item) => {
        if (item.vendors) {
          item.vendors.map((vendor) => {
            if (vendor._id.toString() === user._id) {
              currentOffers.push(item);
            }
          });
        }
        if (item.offerType === "GENERIC") {
          currentOffers.push(item);
        }
      });
    }
    return res.status(200).json(currentOffers);
  }
  return res.status(400).json({
    message: "Error in getting Offers",
  });
};

export const AddOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const {
      offerType,
      title,
      description,
      minValue,
      offerAmount,
      startValidity,
      endValidity,
      pincode,
      promocode,
      bank,
      bins,
    } = <CreateOfferInput>req.body;
    const vendor = await Vendor.findById(user._id);
    if (vendor) {
      const offer = await Offer.create({
        offerType,
        title,
        description,
        minValue,
        offerAmount,
        startValidity,
        endValidity,
        pincode,
        promocode,
        bank,
        bins,
        vendors: [vendor],
      });
      return res.status(200).json(offer);
    }
  }
  return res.json(400).json({
    message: "Error in Adding Offer",
  });
};

export const EditOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const offerId = req.params.id;
    if (offerId) {
      const {
        offerType,
        title,
        description,
        minValue,
        offerAmount,
        startValidity,
        endValidity,
        pincode,
        promocode,
        bank,
        bins,
        isActive,
      } = <CreateOfferInput>req.body;
      const currentOffer = await Offer.findById(offerId);
      if (currentOffer) {
        const vendor = await findVendor(user._id);

        if (vendor) {
          currentOffer.offerType = offerType;
          currentOffer.title = title;
          currentOffer.description = description;
          currentOffer.minValue = minValue;
          currentOffer.offerAmount = offerAmount;
          currentOffer.startValidity = startValidity;
          currentOffer.endValidity = endValidity;
          currentOffer.pincode = pincode;
          currentOffer.promocode = promocode;
          currentOffer.bank = bank;
          currentOffer.bins = bins;
          currentOffer.isActive = isActive as boolean;

          const result = await currentOffer.save();

          return res.status(200).json(result);
        }
      }
    }
  }
  return res.status(400).json({
    message: "Error in Editing the Offer",
  });
};
