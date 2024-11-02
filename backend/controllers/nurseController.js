import Nurse from "../models/nurseSchema.js";
import patientSchema from "../models/patientSchema.js";

export const addFollowUp = async (req, res) => {
  try {
    const { patientId, admissionId, notes, observations } = req.body;
    const nurseId = req.userId; // Nurse ID from authenticated user

    // Validate nurse ID
    const nurse = await Nurse.findById(nurseId);
    if (!nurse) {
      return res.status(404).json({ message: "Nurse not found" });
    }

    // Find the patient
    const patient = await patientSchema.findOne({ patientId });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Find the admission record
    const admissionRecord = patient.admissionRecords.id(admissionId);
    if (!admissionRecord) {
      return res.status(404).json({ message: "Admission record not found" });
    }
    const dateInIST = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: false,
    });
    console.log(dateInIST);
    // Add follow-up to the admission record
    admissionRecord.followUps.push({
      nurseId: nurseId,
      notes: notes,
      observations: observations,
      date: dateInIST, // Sets the date to now
    });

    // Save the updated patient record
    await patient.save();

    res.status(201).json({
      message: "Follow-up added successfully",
      admissionRecord: admissionRecord,
    });
  } catch (error) {
    console.error("Error adding follow-up:", error);
    res
      .status(500)
      .json({ message: "Error adding follow-up", error: error.message });
  }
};
export const getLastFollowUpTime = async (req, res) => {
  try {
    const { patientId, admissionId } = req.body;

    // Find the patient
    const patient = await patientSchema.findOne({ patientId });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Find the admission record
    const admissionRecord = patient.admissionRecords.id(admissionId);
    if (!admissionRecord) {
      return res.status(404).json({ message: "Admission record not found" });
    }

    // Check if there is a previous follow-up
    if (admissionRecord.followUps.length === 0) {
      return res.status(200).json({ message: "No previous follow-ups found" });
    }

    // Get the last follow-up
    const lastFollowUp =
      admissionRecord.followUps[admissionRecord.followUps.length - 1];
    const lastFollowUpDate = new Date(lastFollowUp.date);

    // Get the current time in Indian timezone
    const currentTime = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
    const currentDate = new Date(currentTime);

    // Calculate the time difference in milliseconds
    const diffInMillis = Math.abs(currentDate - lastFollowUpDate);
    const diffInMinutes = Math.floor(diffInMillis / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const minutesRemaining = diffInMinutes % 60;

    const timeSinceLastFollowUp = `${diffInHours} hours and ${minutesRemaining} minutes ago`;

    res
      .status(200)
      .json({ message: "Last follow-up found", timeSinceLastFollowUp });
  } catch (error) {
    console.error("Error retrieving last follow-up:", error);
    res.status(500).json({
      message: "Error retrieving last follow-up",
      error: error.message,
    });
  }
};
