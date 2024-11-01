import patientSchema from "../models/patientSchema";

export const addFollowUp = async (req, res) => {
  try {
    const { patientId, admissionId } = req.params;
    const { notes, observations } = req.body;

    // Ensure the user is a nurse
    if (req.usertype !== "nurse") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Find the patient and admission record
    const patient = await patientSchema.findOne({ patientId });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const admissionRecord = patient.admissionRecords.id(admissionId);
    if (!admissionRecord) {
      return res.status(404).json({ message: "Admission record not found" });
    }

    // Add the follow-up to the admission record
    const followUp = {
      nurseId: req.userId, // ID from authenticated nurse
      notes,
      observations,
    };
    admissionRecord.followUps.push(followUp);
    await patient.save();

    res.status(200).json({ message: "Follow-up added successfully", followUp });
  } catch (error) {
    console.error("Error adding follow-up:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
