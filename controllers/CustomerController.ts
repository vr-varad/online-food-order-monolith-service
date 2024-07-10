import { plainToClass } from "class-transformer";
import express, { Request, Response, NextFunction } from "express";
import {
  CreateCustomerInputs,
  LoginCustomerInputs,
  UpdateCustomerInputs,
} from "../dto/Customer.dto";
import { validate, ValidationError } from "class-validator";
import {
  GenerateToken,
  GenPassword,
  GenSalt,
  VerifyPassword,
} from "../utility";
import { Customer } from "../models/Customer";
import { GenOtp, SendOtp } from "../utility/NotificationUtility";

// ---------------------------------------------------------------- SignUP ----------------------------------------------------------------------------------

export const CustomerSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customerInputs = plainToClass(CreateCustomerInputs, req.body);
  const inputErrors = await validate(customerInputs, {
    validationError: { target: true },
  });

  if (inputErrors.length > 0) {
    return res.status(400).json(inputErrors);
  }

  const { email, password, phone } = customerInputs;

  const salt = await GenSalt();
  const hashedPassword = await GenPassword(salt, password);

  const { otp, expiry: otp_expiry } = GenOtp();

  const existingUser = await Customer.findOne({
    email: email,
  });

  if (existingUser != null) {
    return res.status(409).json({
      message: "An user with email id already exists.",
    });
  }

  const customer = await Customer.create({
    email: email,
    phone: phone,
    password: hashedPassword,
    salt,
    firstName: "",
    lastName: "",
    address: "",
    otp,
    otp_expiry,
    lat: 0,
    lng: 0,
    verified: false,
  });

  if (customer) {
    await SendOtp(otp, phone);
    const signature = GenerateToken({
      _id: customer._id as string,
      email: customer.email,
      verified: customer.verified,
    });
    return res.status(200).json({
      signature: signature,
      verified: customer.verified,
      email: customer.email,
    });
  }

  return res.status(409).json({
    message: "Error with SignUp",
  });
};

// ---------------------------------------------------------------- Login ----------------------------------------------------------------------------------

export const CustomerLogin = async (
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

  const customer = await Customer.findOne({
    email: email,
  });

  if (customer) {
    const validate = await VerifyPassword(
      password,
      customer.password,
      customer.salt
    );

    if (validate) {
      const signature = GenerateToken({
        _id: customer._id as string,
        email: customer.email,
        verified: customer.verified,
      });
      return res.status(200).json({
        signature: signature,
        verified: customer.verified,
        email: customer.email,
      });
    }
  }
  return res.status(409).json({
    message: "Error with Login",
  });
};

// ---------------------------------------------------------------- Verify_OTP ----------------------------------------------------------------------------------

export const CustomerVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { otp } = req.body;
  const user = req.user;
  if (user) {
    const customer = await Customer.findOne({
      email: user.email,
    });
    if (customer) {
      if (customer.otp === parseInt(otp) && customer.otp_expiry >= new Date()) {
        customer.verified = true;

        const updatedProfile = await customer.save();

        const signature = GenerateToken({
          _id: updatedProfile._id as string,
          email: updatedProfile.email,
          verified: updatedProfile.verified,
        });

        return res.status(200).json({
          signature: signature,
          verified: updatedProfile.verified,
          email: updatedProfile.email,
        });
      }
      return res.status(400).json({
        message: "Incorrect OTP or OTP Expired",
      });
    }
  }
  return res.json(409).json("Error with OTP Validation");
};

// ---------------------------------------------------------------- Request OTP ----------------------------------------------------------------------------------

export const RequestOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const customer = await Customer.findOne({
      email: user.email,
    });

    if (customer) {
      const { otp, expiry } = GenOtp();
      (customer.otp = otp), (customer.otp_expiry = expiry);
      await customer.save();
      await SendOtp(customer.otp, customer.phone);

      return res.status(200).json({
        message: "Otp has been send to the registered phone number.",
      });
    }
  }
  return res.json(409).json("Error with Request OTP");
};

// ---------------------------------------------------------------- Get Customer Profile ----------------------------------------------------------------------------------

export const GetCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const customer = await Customer.findOne({
      email: user.email,
    });
    if (customer) {
      return res.status(200).json({
        customer,
      });
    }
  }
  return res.status(404).json({
    message: "Error in Fetching Customer Profile",
  });
};

// ---------------------------------------------------------------- Update Customer Profile ----------------------------------------------------------------------------------

export const UpdateCustomerProfile = async (
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
    const customer = await Customer.findOne({
      email: user.email,
    });
    if (customer) {
      customer.firstName = updateInputs.firstName;
      customer.lastName = updateInputs.lastName;
      customer.address = updateInputs.address;

      const updatedCustomer = await customer.save();

      return res.status(200).json({
        message: "Profile Successfully Updated",
        updatedCustomer,
      });
    }
  }
  return res.status(404).json({
    message: "Error in Customer Profile Updation",
  });
};
