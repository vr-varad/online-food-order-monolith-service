import express from "express";
import {
  GetFoodAvailability,
  GetFoodIn30Min,
  GetTopRestraunts,
  RestrauntFood,
  SearchFood,
} from "../controllers";

const router = express.Router();

router.get("/:pincode", GetFoodAvailability);
router.get("/top-restraunt/:pincode", GetTopRestraunts);
router.get("/food-in-30-min/:pincode", GetFoodIn30Min);
router.get("/search/:pincode", SearchFood);
router.get("/restraunt/:pincode", RestrauntFood);

export { router as ShoppingRouter };
