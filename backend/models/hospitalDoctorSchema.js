import mongoose from "mongoose";

const hospitalDoctor = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // username: { type: String, required: true },
  usertype: { type: String, required: true }, // Could be 'doctor' or another type if expanded
  doctorName: { type: String, required: true }, // Doctor name for reference
  createdAt: { type: Date, default: Date.now },
});

const hospitalDoctors = mongoose.model("hospitalDoctor", hospitalDoctor);

export default hospitalDoctors;
