import express from "express";
import { connectDB } from "./dbConnect.js";
import userRouter from "./routes/users.js";

const app = express();
app.use(express.json());
connectDB();
app.use("/users", userRouter);
const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
