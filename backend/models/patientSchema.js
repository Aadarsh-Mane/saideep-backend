import mongoose from "mongoose";

// 2-hour follow-up sub-schema
const twoHourFollowUpSchema = new mongoose.Schema({
  vitals: {
    temperature: { type: Number }, // T (Temperature)
    pulse: { type: Number }, // P (Pulse)
    respirationRate: { type: Number }, // R (Respiration Rate)
    bloodPressure: {
      NIBP: { type: String }, // Non-Invasive Blood Pressure
      IBP: { type: String }, // Invasive Blood Pressure
    },
    oxygenSaturation: { type: Number }, // SpO2
    bloodSugarLevel: { type: Number }, // BSL
    otherVitals: { type: String }, // OTHER
  },
  intake: {
    ivFluid: { type: String }, // I.V. Fluid
    nasogastric: { type: String }, // Nasogastric
    rtFeedOral: { type: String }, // RT Feed/Oral
    totalIntake: { type: String }, // Total
    cvp: { type: String }, // CVP
  },
  output: {
    urine: { type: String }, // Urine
    stool: { type: String }, // Stool
    rtAspirate: { type: String }, // RT Aspirate
    otherOutput: { type: String }, // Other
  },
  ventilator: {
    ventyMode: { type: String }, // VentyMode
    setRate: { type: Number }, // Set Rate
    fiO2: { type: Number }, // FiO2
    pip: { type: Number }, // PIP
    peepCpap: { type: String }, // PEEP/CPAP
    ieRatio: { type: String }, // I:E Ratio
    otherVentilator: { type: String }, // Other
  },
});

// 4-hour follow-up sub-schema
const fourHourFollowUpSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now }, // Date
  pulse: { type: Number }, // Pulse
  bloodPressure: { type: String }, // BP
  oxygenSaturation: { type: Number }, // SpO2
  temperature: { type: Number }, // Temp
  bloodSugarLevel: { type: Number }, // BSL
  intravenousFluids: { type: String }, // IV
  urineOutput: { type: String }, // Urine
});

// Follow-up schema
const followUpSchema = new mongoose.Schema({
  nurseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Nurse",
    required: true,
  }, // Nurse who recorded the follow-up
  date: { type: Date, default: Date.now },
  notes: { type: String, required: true },
  observations: { type: String },
  twoHourFollowUp: twoHourFollowUpSchema,
  fourHourFollowUp: fourHourFollowUpSchema,
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
