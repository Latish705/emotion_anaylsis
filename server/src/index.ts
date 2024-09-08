import dotenv from "dotenv";
import connectDB from "./config/db_config";
import app from "./app";

dotenv.config();

const PORT = process.env.PORT || 8080;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server started successfull at http://localhost:8080");
  });
});
