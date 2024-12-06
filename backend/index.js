import express from "express";
import { connectDB } from "./dbConnect.js";
import userRouter from "./routes/users.js";
import receiptionRouter from "./routes/reception.js";
import doctorRouter from "./routes/doctor.js";
import patientRouter from "./routes/patient.js";
import nurseRouter from "./routes/nurse.js";
import cors from "cors";
import labRouter from "./routes/lab.js";
import { getPatientHistory } from "./controllers/doctorController.js";
const port = 3000;

const app = express();
app.use(express.json());
app.use(cors());
connectDB();
app.use("/users", userRouter);
app.use("/patient", patientRouter);
app.use("/reception", receiptionRouter);
app.use("/doctors", doctorRouter);
app.use("/nurse", nurseRouter);
app.use("/labs", labRouter);
app.get("/patientHistory/:patientId", getPatientHistory);

app.get("/", (req, res) => {
  return res.status(200).json("Welcome to Ai in HealthCare");

  console.log("welcome to doctors service");
});
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
