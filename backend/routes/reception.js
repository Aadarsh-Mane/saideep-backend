import express from "express";
import {
  acceptAppointment,
  addPatient,
  assignDoctor,
  listDoctors,
  listPatients,
} from "../controllers/admin/receiptionController.js";
import {
  signinDoctor,
  signupDoctor,
  signupNurse,
} from "../controllers/userController.js";

const receiptionRouter = express.Router();

receiptionRouter.post("/addDoctor", signupDoctor);
receiptionRouter.post("/addNurse", signupNurse);
receiptionRouter.post("/addPatient", addPatient);
receiptionRouter.get("/listDoctors", listDoctors);
receiptionRouter.get("/listPatients", listPatients);
receiptionRouter.post("/assign-Doctor", assignDoctor);
receiptionRouter.post("/acceptAppointment", acceptAppointment);
receiptionRouter.post("/addDoctorToPatient");

export default receiptionRouter;
