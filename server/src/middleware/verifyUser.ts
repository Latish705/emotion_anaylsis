import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../user/model/user.model";

const validateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Access Denied" });
      console.log("Token:", token);
    }
    const decodedUser = await jwt.verify(token, process.env.REFRESH_TOKEN!);
    const user = User.findById(decodedUser);
    //@ts-ignore
    req.user = user;
    next();
  } catch (error: any) {
    console.log("Error authentication by token", error.message);
  }
};

export default validateUser;
