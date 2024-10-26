// models/patientSchema.js
import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  contact: { type: String, required: true },
  address: String,
  admissionRecords: [
    {
      admissionDate: { type: Date, default: Date.now },
      reports: [{ type: mongoose.Schema.Types.ObjectId, ref: "PatientReport" }],
    },
  ],
});

export default mongoose.model("Patient", patientSchema);
