import express from "express";
import { connectDB } from "./dbConnect.js";
import userRouter from "./routes/users.js";
import receiptionRouter from "./routes/reception.js";
import doctorRouter from "./routes/doctor.js";
import patientRouter from "./routes/patient.js";
import nurseRouter from "./routes/nurse.js";
const port = 3000;

const app = express();
app.use(express.json());
connectDB();
app.use("/users", userRouter);
app.use("/patient", patientRouter);
app.use("/reception", receiptionRouter);
app.use("/doctors", doctorRouter);
app.use("/nurse", nurseRouter);

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
