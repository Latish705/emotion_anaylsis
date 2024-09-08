import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL!);
    console.log("Database connected successfully ", conn.connection.host);
    return;
  } catch (error: any) {
    console.log("Error connecting the database", error.message);
  }
};

export default connectDB;
