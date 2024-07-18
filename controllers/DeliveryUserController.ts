import { plainToClass } from "class-transformer";
import express, { Request, Response, NextFunction, application } from "express";
import {
  CreateDeliveryUserInputs,
  LoginCustomerInputs,
  UpdateCustomerInputs,
} from "../dto/Customer.dto";
import { validate } from "class-validator";
import {
  GenerateToken,
  GenPassword,
  GenSalt,
  VerifyPassword,
} from "../utility";
import { DeliveryUser } from "../models/DeliveryUser";

// ---------------------------------------------------------------- SignUP ----------------------------------------------------------------------------------

export const DeliveryUserSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const deliveryUserInputs = plainToClass(CreateDeliveryUserInputs, req.body);
  const inputErrors = await validate(deliveryUserInputs, {
    validationError: { target: true },
  });

  if (inputErrors.length > 0) {
    return res.status(400).json(inputErrors);
  }

  const { email, password, phone, firstName, lastName, address, pincode } =
    deliveryUserInputs;

  const salt = await GenSalt();
  const hashedPassword = await GenPassword(salt, password);

  const existingUser = await DeliveryUser.findOne({
    email: email,
  });

  if (existingUser != null) {
    return res.status(409).json({
      message: "An user with email id already exists.",
    });
  }

  const deliveryUser = await DeliveryUser.create({
    email: email,
    phone: phone,
    password: hashedPassword,
    salt,
    firstName: firstName,
    lastName: lastName,
    address: address,
    lat: 0,
    lan: 0,
    verified: false,
    isAvailable: false,
    pincode: pincode
  });

  if (deliveryUser) {
    const signature = GenerateToken({
      _id: deliveryUser._id as string,
      email: deliveryUser.email,
      verified: deliveryUser.verified,
    });
    return res.status(200).json({
      signature: signature,
      verified: deliveryUser.verified,
      email: deliveryUser.email,
    });
  }

  return res.status(409).json({
    message: "Error with SignUp",
  });
};

// ---------------------------------------------------------------- Login ----------------------------------------------------------------------------------

export const DeliveryUserLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const loginInputs = plainToClass(LoginCustomerInputs, req.body);
  const loginInputError = await validate(loginInputs, {
    validationError: { target: true },
  });

  if (loginInputError.length > 0) {
    return res.status(400).json(loginInputError);
  }

  const { email, password } = loginInputs;

  const deliveryUser = await DeliveryUser.findOne({
    email: email,
  });

  if (deliveryUser) {
    const validate = await VerifyPassword(
      password,
      deliveryUser.password,
      deliveryUser.salt
    );

    if (validate) {
      const signature = GenerateToken({
        _id: deliveryUser._id as string,
        email: deliveryUser.email,
        verified: deliveryUser.verified,
      });
      return res.status(200).json({
        signature: signature,
        verified: deliveryUser.verified,
        email: deliveryUser.email,
      });
    }
  }
  return res.status(409).json({
    message: "Error with Login",
  });
};

// ---------------------------------------------------------------- Get Customer Profile ----------------------------------------------------------------------------------

export const GetDeliveryUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    const user = req.user;
    if (user) {
      const deliveryUser = await DeliveryUser.findOne({
        email: user.email,
      });
      if (deliveryUser) {
        return res.status(200).json({
          deliveryUser
        });
      }
    }
    return res.status(404).json({
      message: "Error in Fetching Customer Profile",
    });
};

// ---------------------------------------------------------------- Update Customer Profile ----------------------------------------------------------------------------------

export const UpdateDeliveryUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    const user = req.user;
    if (user) {
      const updateInputs = plainToClass(UpdateCustomerInputs, req.body);
      const updateInputsError = await validate(updateInputs, {
        validationError: { target: true },
      });
      if (updateInputsError.length > 0) {
        return res.status(400).json(updateInputsError);
      }
      const deliveryUser = await DeliveryUser.findOne({
        email: user.email,
      });
      if (deliveryUser) {
        deliveryUser.firstName = updateInputs.firstName;
        deliveryUser.lastName = updateInputs.lastName;
        deliveryUser.address = updateInputs.address;
        const updatedDeliveryUser = await deliveryUser.save();
        return res.status(200).json({
          message: "Profile Successfully Updated",
          updatedDeliveryUser,
        });
      }
    }
    return res.status(404).json({
      message: "Error in Customer Profile Updation",
    });
};

export const UpdateDeliveryUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    const user = req.user
    if(user){
        const deliveryUser = await DeliveryUser.findOne({
            email: user.email
        })
        const {lat,lan} = req.body
        if(deliveryUser){
            if(lat && lan){
                deliveryUser.lat = lat
                deliveryUser.lan = lan
            }
            console.log(deliveryUser);
            deliveryUser.isAvailable = deliveryUser.isAvailable==true?false:true;
            console.log(deliveryUser)
            const updatedDeliveryUser = await deliveryUser.save();
            return res.status(200).json(updatedDeliveryUser)
        }
    }
    return res.status(404).json({
        message : "Error in updating Profile"
    })
};
