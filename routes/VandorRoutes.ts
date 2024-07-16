import express, { Request, Response, NextFunction } from "express";
import {
  VendorLogin,
  GetVendorProfile,
  UpdateVendorProfile,
  UpdateVendorProfilePicture,
  UpdateVendorService,
  AddFood,
  GetFood,
  GetAllOrders,
  ProcessOrder,
  GetOrderDetails,
  GetOffers,
  AddOffer,
  EditOffer
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

router.post("/login", VendorLogin);
router.use(AuthMiddleware);
router.get("/profile", GetVendorProfile);
router.patch("/profile", UpdateVendorProfile);
router.patch("/service", UpdateVendorService);
router.patch("/coverImage", upload, UpdateVendorProfilePicture);
router.post("/food", upload, AddFood);
router.get("/food", GetFood);

// offers

router.get('/offers',GetOffers);
router.post('/offer',AddOffer);
router.put('/offer/:id',EditOffer)

// orders

router.get('/orders', GetAllOrders)
router.get('/orders/:id/process',ProcessOrder)
router.get('/orders/:id',GetOrderDetails)


router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("Vendor Routes");
});

export { router as VendorRouter };
