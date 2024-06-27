import express, { Request, Response, NextFunction } from "express";
import {
  VandorLogin,
  GetVandorProfile,
  UpdateVandorProfile,
  UpdateVandorService,
  AddFood,
  GetFood,
  UpdateVandorProfilePicture,
} from "../controllers";
import { AuthMiddleware } from "../middlewares";
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage }).array("images", 10);

router.post("/login", VandorLogin);
router.use(AuthMiddleware);
router.get("/profile", GetVandorProfile);
router.patch("/profile", UpdateVandorProfile);
router.patch("/service", UpdateVandorService);
router.patch("/coverImage", upload, UpdateVandorProfilePicture);
router.post("/food", upload, AddFood);
router.get("/food", GetFood);

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("Vandor Routes");
});

export { router as VandorRouter };
