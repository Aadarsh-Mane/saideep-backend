import express from "express";
import {
  acceptAppointment,
  addPatient,
  assignDoctor,
  dischargePatientByReception,
  generateBillForDischargedPatient,
  getDischargedPatientHistory,
  getDoctorsPatient,
  listAllPatientsWithLastRecord,
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
receiptionRouter.get(
  "/getPatientAssignedToDoctor/:doctorName",
  getDoctorsPatient
);
receiptionRouter.post("/acceptAppointment", acceptAppointment);
receiptionRouter.post("/dischargePatient", dischargePatientByReception);
receiptionRouter.post("/bill", generateBillForDischargedPatient);
receiptionRouter.post("/addDoctorToPatient");
receiptionRouter.get(
  "/getDischargedPatient/:patientId",
  getDischargedPatientHistory
);
receiptionRouter.get("/getAllDischargedPatient", listAllPatientsWithLastRecord);

export default receiptionRouter;
