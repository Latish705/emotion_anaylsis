import { Router } from "express";
import {
  addemotionAndDescription,
  login,
  signup,
} from "../controller/user.controller";
import validateUser from "../../middleware/verifyUser";

const userRoutes = Router();

userRoutes.post("/signup", signup);
userRoutes.post("/login", validateUser, login);

userRoutes.post("/addData", validateUser, addemotionAndDescription);

export default userRoutes;
