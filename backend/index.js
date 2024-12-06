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

const predefinedLocation = {
  latitude: 19.215696,
  longitude: 73.0804656,
};

app.post("/check-location", (req, res) => {
  const { latitude, longitude } = req.body;

  // Calculate if the given coordinates are close enough to the predefined location
  const isInLocation =
    Math.abs(predefinedLocation.latitude - latitude) < 0.0001 &&
    Math.abs(predefinedLocation.longitude - longitude) < 0.0001;

  if (isInLocation) {
    res.json({ message: "You are in the right location!" });
  } else {
    res.json({ message: "You are not in the correct location." });
  }
});
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
