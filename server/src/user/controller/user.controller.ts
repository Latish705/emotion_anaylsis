import { Request, Response } from "express";
import User, { IUser } from "../model/user.model";
import Emotion from "../model/emotion.model";

// Function to generate access and refresh tokens
const generateAccessAndRefreshToken = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error: any) {
    console.log("Error generating Access and Refresh token", error.message);
    throw error;
  }
};

// Signup function
export const signup = async (req: Request, res: Response) => {
  try {
    const {
      email,
      name,
      password,
    }: { email: string; name: string; password: string } = req.body;

    if ([name, password].some((field) => field === "")) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User exists with this email" });
    }

    const newUser = new User({ name, password, email });
    await newUser.save();

    if (!newUser) {
      return res.status(500).json({
        success: false,
        message: "Cannot create user properly, try again",
      });
    }

    const dbUser = await User.findById(newUser._id).select("-password");
    if (!dbUser) {
      return res.status(500).json({
        success: false,
        message: "User not found after creation",
      });
    }

    console.log("New user signup successfully", newUser._id);
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: dbUser,
    });
  } catch (error: any) {
    console.log("Error Signing Up user", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// Login function
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: { email: string; password: string } = req.body;
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot find user with this email" });
    }

    const isPasswordMatched = await existingUser.comparePassword(password);
    if (!isPasswordMatched) {
      return res
        .status(400)
        .json({ success: false, message: "Password doesn't match" });
    }

    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
      //@ts-ignore
      existingUser._id
    );
    const loggedInUser = await User.findOne({ email }).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res.cookie("refreshToken", refreshToken, options).status(200).json({
      success: true,
      message: "User logged In successfully",
      user: loggedInUser,
      refreshToken,
    });
  } catch (error: any) {
    console.log("Error logging in user", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// Add emotion and description function
export const addEmotionAndDescription = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const user = req.user;
    const {
      emotion,
      description,
    }: { user: IUser; emotion: number; description: string } = req.body;

    if ([user, emotion, description].some((field) => field === "")) {
      return res
        .status(500)
        .json({ success: false, message: "All fields are required" });
    }

    const newEmotion = new Emotion({
      userId: user._id,
      emotion,
      description,
    });
    await newEmotion.save();

    console.log(`User: ${user._id} added data`);
    const updatedUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    return res.status(201).json({
      success: true,
      message: "User data added successfully",
      user: updatedUser,
      emotion: newEmotion,
    });
  } catch (error: any) {
    console.error("Error adding emotion and description:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
