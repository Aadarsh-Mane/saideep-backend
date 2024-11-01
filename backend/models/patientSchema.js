import mongoose from "mongoose";
const followUpSchema = new mongoose.Schema({
  nurseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Nurse",
    required: true,
  }, // Nurse who recorded the follow-up
  date: { type: Date, default: Date.now },
  notes: { type: String, required: true },
  observations: String,
});
const patientSchema1 = new mongoose.Schema({
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
      followUps: [followUpSchema], // Array of follow-up records for each admission
    },
  ],
});

const patientSchema = mongoose.model("Patient", patientSchema1);
export default patientSchema;
