import { Request, Response } from "express";
import User, { IUser } from "../model/user.model";

const generateAccessAndRefreshToken = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user?.generateAccessToken();
    const refreshToken = user?.generateRefreshToken();
    if (user) {
      user.refreshToken = refreshToken as string;
      await user.save({ validateBeforeSave: false });
    }
    return { accessToken, refreshToken };
  } catch (error: any) {
    console.log("Error generating Access and Refresh token", error.message);
  }
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, name, password }: any = req.body;
    if ([name, password].some((field) => field === "")) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are requireds" });
    }
    const exsistingUser = await User.findOne({ email });
    if (exsistingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User exists with this email" });
    }

    const newUser = new User({
      name,
      password,
      email,
    });
    if (!newUser) {
      return res.status(200).json({
        success: false,
        message: "Cannot create user properly try again",
      });
    }
    const dbUser = await User.findById(newUser.id).select("-password");
    console.log("New user signup successfully", newUser.id);
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: dbUser,
    });
  } catch (error: any) {
    console.log("Error Signing Up user", error.message);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: any = req.body;
    const exsistingUser = await User.findOne({ email });
    if (!exsistingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot find user with this email" });
    }
    const isPasswordMatched = await exsistingUser.comparePassword(password);
    if (!isPasswordMatched) {
      return res
        .status(400)
        .json({ success: false, message: "Password doesn't match" });
    }
    const { refreshToken, accessToken }: any =
      await generateAccessAndRefreshToken(exsistingUser.id);
    const loggedInUser = await User.findOne({ email }).select(
      "-password -refreshToken"
    );

    const options = {
      http: true,
      secure: true,
    };
    return res.cookie("refreshToken", refreshToken, options).status(200).json({
      success: true,
      message: "User logged In successfully",
      user: loggedInUser,
    });
  } catch (error: any) {
    console.log("Error logging in user ", error.message);
  }
};

export const addemotionAndDescription = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const {
      user,
      emotion,
      description,
    }: { user: IUser; emotion: number; description: string } = req.body;
    user.emotion = emotion;
    user.description = description;
    user.save({ validateBeforeSave: false });

    console.log(`User: ${user.id} added data`);
    const dataUser = await User.findById(user.id).select(
      "-password -refreshToken"
    );
    return res.status(201).json({
      success: false,
      message: "User data added successfully",
      user: dataUser,
    });
  } catch (error: any) {}
};
