import express, { Request, Response, NextFunction } from "express";
import { CreateVendor, GetVendors, GetVendorById, GetAllTransactions, GetTransactionById } from "../controllers";

const router = express.Router();

router.post("/vandor", CreateVendor);
router.get("/vandor", GetVendors);
router.get("/vandor/:id", GetVendorById);
router.get("/transaction",GetAllTransactions)
router.get("/transaction/:id",GetTransactionById)

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("Admin Routes");
});

export { router as AdminRouter };
