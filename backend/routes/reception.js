import express from "express";
import {
  acceptAppointment,
  addPatient,
} from "../controllers/admin/receiptionController.js";

const receiptionRouter = express.Router();

receiptionRouter.post("/addPatient", addPatient);
receiptionRouter.post("/acceptAppointment", acceptAppointment);
receiptionRouter.post("/addDoctorToPatient");

export default receiptionRouter;
