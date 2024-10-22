import express from "express";
import { connectDB } from "./dbConnect.js";

const app = express();
connectDB();
const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
