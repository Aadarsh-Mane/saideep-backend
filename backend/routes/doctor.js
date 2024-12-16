import express from "express";
import {
  addPrescription,
  admitPatient,
  admitPatientByDoctor,
  assignPatientToLab,
  dischargePatient,
  fetchPrescriptions,
  getAdmittedPatientsByDoctor,
  getAllDoctorsProfiles,
  getAssignedPatients,
  getDischargedPatientsByDoctor,
  getDoctorProfile,
  getPatients,
  getPatientsAssignedByDoctor,
} from "../controllers/doctorController.js";
import { auth } from "../middleware/auth.js";

const doctorRouter = express.Router();

doctorRouter.get("/getPatients", auth, getPatients);
doctorRouter.get("/getDoctorProfile", auth, getDoctorProfile);
doctorRouter.get("/getAllDoctorProfile", getAllDoctorsProfiles);
doctorRouter.get("/getPrescriptions/:admissionId", fetchPrescriptions);
doctorRouter.post("/addPresciption", addPrescription);
doctorRouter.post("/admitPatient", auth, admitPatientByDoctor);
doctorRouter.get("/getadmittedPatient", auth, getAdmittedPatientsByDoctor);
doctorRouter.get("/getAssignedPatients", auth, getAssignedPatients);
doctorRouter.post("/admitPatient/:patientId", auth, admitPatient);
doctorRouter.post("/assignPatient", auth, assignPatientToLab);
doctorRouter.post("/dischargePatient", auth, dischargePatient);
doctorRouter.get("/getdischargedPatient", getDischargedPatientsByDoctor);
doctorRouter.get(
  "/getDoctorAssignedPatient",
  auth,
  getPatientsAssignedByDoctor
);

// userRouter.get("/profile", auth, getUserProfile);
// userRouter.patch("/edit-profile", auth, upload.single("image"), editProfile);

export default doctorRouter;
