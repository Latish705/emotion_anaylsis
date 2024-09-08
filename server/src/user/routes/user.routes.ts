import { Router } from "express";
import {
  addEmotionAndDescription,
  login,
  signup,
} from "../controller/user.controller";
import validateUser from "../../middleware/verifyUser";

const userRoutes = Router();

userRoutes.post("/signup", signup);
userRoutes.post("/login", login);

userRoutes.post("/add_data", validateUser, addEmotionAndDescription);

export default userRoutes;
