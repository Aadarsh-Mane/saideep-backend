import mongoose from "mongoose";

// 2-hour follow-up sub-schema

// Follow-up schema
const followUpSchema = new mongoose.Schema({
  nurseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Nurse",
    required: true,
  }, // Nurse who recorded the follow-up
  notes: { type: String, required: true },
  observations: { type: String },
  temperature: { type: Number }, // T (Temperature)
  pulse: { type: Number }, // P (Pulse)
  respirationRate: { type: Number }, // R (Respiration Rate)
  bloodPressure: {
    NIBP: { type: String }, // Non-Invasive Blood Pressure
    IBP: { type: String }, // Invasive Blood Pressure
  },
  oxygenSaturation: { type: Number }, // SpO2 (Oxygen Saturation)
  bloodSugarLevel: { type: Number }, // BSL (Blood Sugar Level)
  otherVitals: { type: String }, // OTHER (Any other vitals to be recorded)

  // Intake data (IV Fluids, Nasogastric, Feed, etc.)
  ivFluid: { type: String }, // I.V. Fluid (Intravenous fluids administered)
  nasogastric: { type: String }, // Nasogastric (Input through nasogastric tube)
  rtFeedOral: { type: String }, // RT Feed/Oral (Feed given via RT or orally)
  totalIntake: { type: String }, // Total (Total intake of fluids)
  cvp: { type: String }, // CVP (Central Venous Pressure)

  // Output data (Urine, Stool, RT Aspirate, etc.)
  urine: { type: String }, // Urine (Urinary output)
  stool: { type: String }, // Stool (Stool output)
  rtAspirate: { type: String }, // RT Aspirate (Output through Ryle's Tube aspirate)
  otherOutput: { type: String }, // Other (Any other output)

  // Ventilator data (Mode, Rate, FiO2, etc.)
  ventyMode: { type: String }, // VentyMode (Ventilator Mode)
  setRate: { type: Number }, // Set Rate (Set ventilator rate)
  fiO2: { type: Number }, // FiO2 (Fraction of Inspired Oxygen)
  pip: { type: Number }, // PIP (Peak Inspiratory Pressure)
  peepCpap: { type: String }, // PEEP/CPAP (Positive End-Expiratory Pressure/Continuous Positive Airway Pressure)
  ieRatio: { type: String }, // I:E Ratio (Inspiratory to Expiratory Ratio)
  otherVentilator: { type: String }, // Other (Any
});

// Patient schema
const patientSchema1 = new mongoose.Schema({
  patientId: { type: String, unique: true }, // Unique Patient ID
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  contact: { type: String, required: true },
  address: { type: String },
  discharged: { type: Boolean, default: false }, // Discharge status
  admissionRecords: [
    {
      admissionDate: { type: Date, default: Date.now },
      reasonForAdmission: { type: String },
      dischargeDate: { type: Date }, // Discharge date
      symptoms: { type: String },
      initialDiagnosis: { type: String },
      doctor: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "hospitalDoctor" },
        name: { type: String },
      }, // Reference to the doctor
      reports: [{ type: mongoose.Schema.Types.ObjectId, ref: "PatientReport" }],
      followUps: [followUpSchema], // Array of follow-up records for each admission
    },
  ],
});

const patientSchema = mongoose.model("Patient", patientSchema1);
export default patientSchema;
