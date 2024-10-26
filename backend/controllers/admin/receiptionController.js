import Doctor from "../../models/doctorSchema.js";
import patientSchema from "../../models/patientSchema.js";

export const addPatient = async (req, res) => {
  const { name, age, gender, contact, address } = req.body;

  try {
    // Find existing patient by name and contact
    let patient = await patientSchema.findOne({ name, contact });

    if (patient) {
      // If patient exists, add new admission record
      patient.admissionRecords.push({ admissionDate: new Date() });
      await patient.save();
      return res.status(200).json({
        message: `Patient ${name} readmitted successfully.`,
        patientDetails: patient,
        admissionRecords: patient.admissionRecords,
      });
    }

    // If patient does not exist, check if doctor exists by doctorId

    // Create a new patient with the first admission record
    patient = new patientSchema({
      name,
      age,
      gender,
      contact,
      address,
      admissionRecords: [{ admissionDate: new Date() }],
    });
    await patient.save();

    res.status(201).json({
      message: `Patient ${name} added successfully.`,
      patientDetails: patient,
    });
  } catch (error) {
    console.error("Error adding patient:", error);
    res
      .status(500)
      .json({ message: "Error adding patient", error: error.message });
  }
};
