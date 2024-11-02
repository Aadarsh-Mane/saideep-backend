import Appointment from "../../models/bookAppointmentSchema.js";
import hospitalDoctors from "../../models/hospitalDoctorSchema.js";
import patientSchema from "../../models/patientSchema.js";
import Doctor from "./../../models/doctorSchema.js";

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

export const acceptAppointment = async (req, res) => {
  const { appointmentId } = req.params;
  const { note } = req.body; // Optional note field

  try {
    // Find the appointment by ID
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Update status and note
    appointment.status = "Confirmed";
    if (note) appointment.note = note;

    await appointment.save();

    res.status(200).json({
      message: `Appointment for ${appointment.name} confirmed successfully.`,
      appointmentDetails: appointment,
    });
  } catch (error) {
    console.error("Error confirming appointment:", error);
    res
      .status(500)
      .json({ message: "Error confirming appointment", error: error.message });
  }
};
export const assignDoctor = async (req, res) => {
  try {
    const { patientId, doctorId, admissionId, isReadmission } = req.body;

    // Find the patient
    const patient = await patientSchema.findOne({ patientId });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Find the doctor
    const doctor = await hospitalDoctors.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Check if admission record exists
    const admissionRecord = patient.admissionRecords.id(admissionId);
    if (!admissionRecord) {
      return res.status(404).json({ message: "Admission record not found" });
    }

    // If not a readmission, ensure no doctor is already assigned
    if (!isReadmission && admissionRecord.doctor) {
      return res
        .status(400)
        .json({ message: "Doctor is already assigned to this admission." });
    }

    // Assign doctor ID and name to the admission record
    admissionRecord.doctor = { id: doctorId, name: doctor.doctorName };
    await patient.save();

    return res
      .status(200)
      .json({ message: "Doctor assigned successfully", patient });
  } catch (error) {
    console.error("Error assigning doctor:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Controller to list all available doctors
export const listDoctors = async (req, res) => {
  try {
    // Retrieve all doctors, with an option to filter by availability if required
    const doctors = await hospitalDoctors.find({
      usertype: "doctor",
      // available: true,
    });

    if (!doctors || doctors.length === 0) {
      return res.status(404).json({ message: "No available doctors found." });
    }

    res.status(200).json({ doctors });
  } catch (error) {
    console.error("Error listing doctors:", error);
    res
      .status(500)
      .json({ message: "Failed to retrieve doctors.", error: error.message });
  }
};
// Controller to list all patients
export const listPatients = async (req, res) => {
  try {
    // Retrieve all patients from the database
    const patients = await patientSchema.find();

    if (!patients || patients.length === 0) {
      return res.status(404).json({ message: "No patients found." });
    }

    res.status(200).json({ patients });
  } catch (error) {
    console.error("Error listing patients:", error);
    res
      .status(500)
      .json({ message: "Failed to retrieve patients.", error: error.message });
  }
};
