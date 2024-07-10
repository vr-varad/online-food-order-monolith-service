import express from "express";
import {
  CustomerLogin,
  CustomerSignUp,
  CustomerVerify,
  GetCustomerProfile,
  RequestOtp,
  UpdateCustomerProfile,
} from "../controllers";
import { AuthMiddleware } from "../middlewares";

const router = express.Router();

// signup-create customer
router.post("/signup", CustomerSignUp);

// login
router.post("/login", CustomerLogin);

//authenticate
router.use(AuthMiddleware)

// verify customer
router.patch("/verify", CustomerVerify);

// otp/request otp
router.get("/otp", RequestOtp);

// profile
router.get("/profile", GetCustomerProfile);
router.patch("/profile", UpdateCustomerProfile);

// cart
// order
// payment

export { router as CustomerRouter };
