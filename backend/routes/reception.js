import express from "express";
import {
  acceptAppointment,
  addPatient,
  listDoctors,
  listPatients,
} from "../controllers/admin/receiptionController.js";
import { signinDoctor, signupDoctor } from "../controllers/userController.js";

const receiptionRouter = express.Router();

receiptionRouter.post("/addDoctor", signupDoctor);
receiptionRouter.post("/addPatient", addPatient);
receiptionRouter.get("/listDoctors", listDoctors);
receiptionRouter.get("/listPatients", listPatients);
receiptionRouter.post("/acceptAppointment", acceptAppointment);
receiptionRouter.post("/addDoctorToPatient");

export default receiptionRouter;
