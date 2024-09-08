import mongoose, { Document, model, Schema } from "mongoose";
import bcrypt, { genSalt } from "bcrypt";
import jwt from "jsonwebtoken";

export interface IUser extends Document {
  id?: string;
  email: string;
  password: string;
  name: string;
  emotion: number;
  description: string;
  accessToken: string;
  refreshToken: string;
  comparePassword: (password: string) => Boolean;
  generateAccessToken: () => string;
  generateRefreshToken: () => string;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    emotion: {
      type: Number,
    },
    description: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    { _id: this.id, name: this.name, email: this.email },
    process.env.ACCESS_TOKEN_SECRET!,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign({ _id: this.id }, process.env.REFRESH_TOKEN!, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

const User = model("User", userSchema);
export default User;
