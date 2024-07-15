import { plainToClass } from "class-transformer";
import express, { Request, Response, NextFunction } from "express";
import {
  CreateCustomerInputs,
  LoginCustomerInputs,
  OrderInputs,
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
import { Food } from "../models/Food";
import { Order } from "../models/Order";

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
    orders: [],
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

// ---------------------------------------------------------------- Add to Cart ----------------------------------------------------------------------------------

export const AddtoCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const customer = await Customer.findOne({
      email: user.email,
    }).populate("cart.food");

    let cartItems = Array();

    const { _id, units } = <OrderInputs>req.body;

    const food = await Food.findById(_id);

    if (food) {
      if (customer) {
        cartItems = customer.cart;

        if (cartItems.length > 0) {
          let foodAlreadyExisting = cartItems.filter(
            (item) => item.food._id.toString() === _id
          );
          if (foodAlreadyExisting.length > 0) {
            const index = cartItems.indexOf(foodAlreadyExisting[0]);
            if (units > 0) {
              cartItems[index] = { food, units };
            } else {
              cartItems.splice(index, 1);
            }
          } else {
            cartItems.push({ food, units });
          }
        } else {
          cartItems.push({ food, units });
        }

        customer.cart = cartItems as any;
        const updatedCustomer = await customer.save();
        return res.status(200).json(updatedCustomer);
      }
    }
  }
  return res.status(400).json({
    message: "Error in Adding Food to Cart",
  });
};

// ---------------------------------------------------------------- Get Cart ----------------------------------------------------------------------------------

export const GetCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user
  if(user){
    const customer = await Customer.findOne({email: user.email}).populate('cart.food');
    if(customer){
      const cartItems = customer.cart;
      return res.status(200).json(cartItems);
    }
  }
  return res.status(400).json({
    message : "Error in Getting Cart."
  })
};

// ---------------------------------------------------------------- Delete Cart ----------------------------------------------------------------------------------

export const DeleteCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if(user){
    const customer = await Customer.findOne({email: user.email}).populate('cart.food');
    if(customer){
      customer.cart = [] as any;
      const updatedCustomer = await customer.save();
      return res.status(200).json(updatedCustomer);
    }
  }
  return res.status(400).json({
    message : "Error in Deleting Cart."
  })
};

// ---------------------------------------------------------------- Create Order ----------------------------------------------------------------------------------

export const CreateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const orderId = Math.trunc(Math.random() * 8999999);
    const customer = await Customer.findOne({
      email: user.email,
    });
    const cart = <[OrderInputs]>req.body;

    const cartItems = Array();

    let netAmount = 0.0;

    let vendorId;

    const foods = await Food.find()
      .where("_id")
      .in(cart.map((item) => item._id))
      .exec();

    foods.map((food) => {
      cart.map(({ _id, units }) => {
        if (food._id == _id) {
          vendorId = food.vandorId;
          netAmount += food.price * units;
          cartItems.push({ food, unit: units });
        }
      });
    });
    if(customer){

      
      if (cartItems) {
        const currentOrder = await Order.create({
          orderId: orderId,
          items: cartItems,
          totalAmount: netAmount,
          orderDate: new Date(),
          paidThrough: "COD",
          paymentResponse: "",
          orderStatus: "waiting",
          vendorId,
          remarks: '',
          offerId: '',
          appliedOffers: false,
          readyTime: '',
        });
        if (currentOrder) {
          customer.cart = [] as any;
          customer.orders.push(currentOrder);
          const updatedCustomer = await customer?.save();
          return res.status(200).json(updatedCustomer);
        }
      }
    }
  }
  return res.json(400).json({
    message: "Error in Creating order",
  });
};

// ---------------------------------------------------------------- Get All Order ----------------------------------------------------------------------------------

export const GetAllOrders = async (
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
      return res.status(200).json(customer.orders);
    }
  }
  return res.status(400).json({
    message: "Error with Getting All orders from your Profile.",
  });
};

// ---------------------------------------------------------------- Create Order By Id----------------------------------------------------------------------------------

export const GetOrderById = async (
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
      const orderId = req.params.id;
      const order = await Order.findById(orderId).populate("items.food");
      return res.status(200).json(order);
    }
  }
  return res.status(400).json({
    message: "Error with Getting Order.",
  });
};
