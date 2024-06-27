import express, { Request, Response, NextFunction } from "express";
import { CreateVandor, GetVendors, GetVendorById } from "../controllers";

const router = express.Router();

router.post("/vandor", CreateVandor);
router.get("/vandor", GetVendors);
router.get("/vandor/:id", GetVendorById);

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("Admin Routes");
});

export { router as AdminRouter };
