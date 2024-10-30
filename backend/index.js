import express from "express";
import { connectDB } from "./dbConnect.js";
import userRouter from "./routes/users.js";
import receiptionRouter from "./routes/reception.js";
import doctorRouter from "./routes/doctor.js";
const port = 3000;

const app = express();
app.use(express.json());
connectDB();
app.use("/users", userRouter);
app.use("/receiption", receiptionRouter);
app.use("/doctors", doctorRouter);

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
