import express from "express";
import {
  AddtoCart,
  CreateOrder,
  CreatePayment,
  CustomerLogin,
  CustomerSignUp,
  CustomerVerify,
  DeleteCart,
  GetAllOrders,
  GetCart,
  GetCustomerProfile,
  GetOrderById,
  RequestOtp,
  UpdateCustomerProfile,
  VerifyOfferById,
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
router.post('/cart', AddtoCart);
router.get('/cart',GetCart);
router.delete('/cart',DeleteCart);

// offers
router.get('/offer/verify/:id', VerifyOfferById as any)

// payment
router.post('/create-payment', CreatePayment)

// order
router.post('/create-order', CreateOrder);
router.get('/orders',GetAllOrders);
router.get('/order/:id',GetOrderById);

export { router as CustomerRouter };
