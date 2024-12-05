import mongoose from "mongoose";

// Patient History Schema
const patientHistorySchema = new mongoose.Schema({
  patientId: { type: String, unique: true, required: true }, // Same patientId as in Patient schema
  name: { type: String, required: true }, // Redundant for easier history tracking
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  contact: { type: String }, // Optional for history purposes

  // Historical records
  history: [
    {
      admissionId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Reference to admission
      admissionDate: Date,
      dischargeDate: Date, // When the patient was discharged
      reasonForAdmission: String,
      symptoms: String,
      initialDiagnosis: String,
      doctor: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "hospitalDoctor" },
        name: String,
      },
      reports: [{ type: mongoose.Schema.Types.ObjectId, ref: "PatientReport" }],
      followUps: [
        {
          nurseId: { type: mongoose.Schema.Types.ObjectId, ref: "Nurse" },
          date: String,
          notes: String,
          observations: String,
        },
      ],
      labReports: [
        {
          labTestNameGivenByDoctor: String, // Test name requested by doctor
          reports: [
            {
              labTestName: String, // Name of the lab test
              reportUrl: String, // URL to the uploaded PDF
              labType: String, // Type of lab (e.g., hematology)
              uploadedAt: { type: Date, default: Date.now }, // Timestamp
            },
          ],
        },
      ], // New field for lab reports
    },
  ],
});

const PatientHistory = mongoose.model("PatientHistory", patientHistorySchema);
export default PatientHistory;
