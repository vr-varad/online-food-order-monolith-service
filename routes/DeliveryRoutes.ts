import express from "express";
import {} from "../controllers";
import { AuthMiddleware } from "../middlewares";
import { DeliveryUserLogin, DeliveryUserSignUp, GetDeliveryUserProfile, UpdateDeliveryUserProfile, UpdateDeliveryUserStatus } from "../controllers/DeliveryUserController";

const router = express.Router();

// signup-create customer
router.post("/signup", DeliveryUserSignUp);

// login
router.post("/login", DeliveryUserLogin);

//authenticate
router.use(AuthMiddleware);

//status
router.put("/change-status",UpdateDeliveryUserStatus)

// profile
router.get("/profile", GetDeliveryUserProfile);
router.patch("/profile", UpdateDeliveryUserProfile);

export { router as DeliveryUserRouter };
