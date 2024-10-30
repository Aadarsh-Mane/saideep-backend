import patientSchema from "../../models/patientSchema.js";

export const addPatient = async (req, res) => {
  const {
    name,
    age,
    gender,
    contact,
    address,
    reasonForAdmission,
    symptoms,
    initialDiagnosis,
  } = req.body;

  try {
    let patient = await patientSchema.findOne({ name, contact });

    if (patient) {
      const lastAdmission =
        patient.admissionRecords[patient.admissionRecords.length - 1]
          .admissionDate;
      const daysSinceLastAdmission = dayjs().diff(dayjs(lastAdmission), "day");

      // Add new admission record with condition details
      patient.admissionRecords.push({
        admissionDate: new Date(),
        reasonForAdmission,
        symptoms,
        initialDiagnosis,
      });
      await patient.save();

      return res.status(200).json({
        message: `Patient ${name} readmitted successfully.`,
        patientDetails: patient,
        daysSinceLastAdmission,
        admissionRecords: patient.admissionRecords,
      });
    }

    // If patient does not exist, create a new one with a generated patientId
    const patientId = generatePatientId(name);

    patient = new patientSchema({
      patientId,
      name,
      age,
      gender,
      contact,
      address,
      admissionRecords: [
        {
          admissionDate: new Date(),
          reasonForAdmission,
          symptoms,
          initialDiagnosis,
        },
      ],
    });
    await patient.save();

    res.status(201).json({
      message: `Patient ${name} added successfully with ID ${patientId}.`,
      patientDetails: patient,
    });
  } catch (error) {
    console.error("Error adding patient:", error);
    res
      .status(500)
      .json({ message: "Error adding patient", error: error.message });
  }
};
const generatePatientId = (name) => {
  const initials = name.slice(0, 3).toUpperCase(); // First three letters of the name
  const randomDigits = Math.floor(100 + Math.random() * 900); // Generate three random digits
  return `${initials}${randomDigits}`;
};
