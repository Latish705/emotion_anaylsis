import express from "express";

import cors from "cors";
import userRoutes from "./user/routes/user.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", userRoutes);

app.get("/", (req, res): any => {
  res.send("hello");
});

export default app;
