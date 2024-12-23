import express from "express";
import {
  addConsultant,
  addDiagnosisByDoctor,
  addPrescription,
  addSymptomsByDoctor,
  addVitals,
  admitPatient,
  admitPatientByDoctor,
  assignPatientToLab,
  dischargePatient,
  fetchConsultant,
  fetchDiagnosis,
  fetchPrescription,
  fetchSymptoms,
  fetchVitals,
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
doctorRouter.get("/getConsultant/:admissionId", fetchConsultant);
doctorRouter.post("/addConsultant", addConsultant);
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
doctorRouter.post("/addPresciption", addPrescription);
doctorRouter.get("/getPrescription/:patientId/:admissionId", fetchPrescription);
doctorRouter.post("/addSymptoms", addSymptomsByDoctor);
doctorRouter.get("/fetchSymptoms/:patientId/:admissionId", fetchSymptoms);
doctorRouter.post("/addVitals", addVitals);
doctorRouter.get("/fetchVitals/:patientId/:admissionId", fetchVitals);
doctorRouter.post("/addDiagnosis", addDiagnosisByDoctor);
doctorRouter.get("/fetchDiagnosis/:patientId/:admissionId", fetchDiagnosis);

// userRouter.get("/profile", auth, getUserProfile);
// userRouter.patch("/edit-profile", auth, upload.single("image"), editProfile);

export default doctorRouter;
