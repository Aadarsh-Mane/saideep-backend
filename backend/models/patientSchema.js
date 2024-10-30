import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  patientId: { type: String, unique: true }, // Unique Patient ID

  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  contact: { type: String, required: true },
  address: String,
  admissionRecords: [
    {
      admissionDate: { type: Date, default: Date.now },
      reasonForAdmission: { type: String },
      symptoms: String,
      initialDiagnosis: String,
      doctor: { type: mongoose.Schema.Types.ObjectId, ref: "hospitalDoctor" }, // Reference to the doctor

      reports: [{ type: mongoose.Schema.Types.ObjectId, ref: "PatientReport" }],
    },
  ],
});

export default mongoose.model("Patient", patientSchema);
