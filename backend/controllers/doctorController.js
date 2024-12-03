import hospitalDoctors from "../models/hospitalDoctorSchema.js";
import LabReport from "../models/labreportSchema.js";
import patientSchema from "../models/patientSchema.js";

export const getPatients = async (req, res) => {
  console.log(req.usertype);
  try {
    // Ensure only a doctor can access this route by checking the user type
    if (req.usertype !== "doctor") {
      return res
        .status(403)
        .json({ message: "Access denied. Only doctors can view patients." });
    }

    const patients = await patientSchema.find();
    res.status(200).json(patients);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching patients", error: error.message });
  }
};
// Route to admit a patient to the authenticated doctor
export const admitPatient = async (req, res) => {
  const { patientId } = req.params;

  try {
    // Ensure the user is a doctor
    if (req.usertype !== "doctor") {
      return res
        .status(403)
        .json({ message: "Access denied. Only doctors can admit patients." });
    }

    // Retrieve the patient by ID
    const patient = await patientSchema.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const doctor = await hospitalDoctors.findById(req.userId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Check if the patient has any active admissions
    const hasActiveAdmission =
      patient.admissionRecords.length > 0 &&
      patient.admissionRecords[patient.admissionRecords.length - 1]
        .dischargeDate === undefined;

    if (hasActiveAdmission) {
      return res.status(400).json({
        message: `Patient ${patient.name} is already admitted. No new admission can be created until discharge.`,
      });
    }

    // Add a new admission record with the doctor’s name
    patient.admissionRecords.push({
      admissionDate: new Date(),
      doctorName: doctor.doctorName,
      dischargeDate: null, // Initialize dischargeDate as null
    });

    await patient.save();

    res.status(200).json({
      message: `Patient ${patient.name} admitted to doctor ${doctor.doctorName}`,
      patientDetails: patient,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error admitting patient", error: error.message });
  }
};
export const dischargePatient = async (req, res) => {
  const { patientId } = req.params;

  try {
    // Ensure the user is a doctor
    if (req.usertype !== "doctor") {
      return res.status(403).json({
        message: "Access denied. Only doctors can discharge patients.",
      });
    }

    // Retrieve the patient by ID
    const patient = await patientSchema.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const doctor = await hospitalDoctors.findById(req.userId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Check if the patient has any active admissions
    const activeAdmission = patient.admissionRecords.find(
      (record) => record.dischargeDate === null
    );

    if (!activeAdmission) {
      return res.status(400).json({
        message: `Patient ${patient.name} is not currently admitted.`,
      });
    }

    // Update the last admission record with discharge date
    activeAdmission.dischargeDate = new Date(); // Set the discharge date
    await patient.save();

    res.status(200).json({
      message: `Patient ${patient.name} discharged by doctor ${doctor.doctorName}`,
      patientDetails: patient,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error discharging patient", error: error.message });
  }
};

export const getAssignedPatients = async (req, res) => {
  try {
    const doctorId = req.userId; // Get doctor ID from authenticated user

    // Find all patients with admission records assigned to this doctor
    const patients = await patientSchema.find({
      "admissionRecords.doctor.id": doctorId,
    });

    // Filter admission records specifically assigned to this doctor
    const filteredPatients = patients.map((patient) => {
      const relevantAdmissions = patient.admissionRecords.filter(
        (record) => record.doctor && record.doctor.id.toString() === doctorId
      );
      return { ...patient.toObject(), admissionRecords: relevantAdmissions };
    });

    res.status(200).json({
      message: "Patients assigned to doctor retrieved successfully",
      patients: filteredPatients,
    });
  } catch (error) {
    console.error("Error retrieving assigned patients:", error);
    res
      .status(500)
      .json({ message: "Error retrieving patients", error: error.message });
  }
};
export const getPatientDetailsForDoctor = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Ensure the user is a doctor
    if (req.usertype !== "doctor") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Find the patient with admission records assigned to the doctor
    const patient = await patientSchema
      .findOne({
        patientId,
        "admissionRecords.doctor": req.userId, // Match admissions where this doctor is assigned
      })
      .populate("admissionRecords.doctor", "doctorName") // Populate doctor details
      .populate("admissionRecords.reports", "reportDetails") // Populate reports
      .populate("admissionRecords.followUps.nurseId", "nurseName"); // Populate follow-up nurse details

    if (!patient) {
      return res
        .status(404)
        .json({ message: "Patient not found or not assigned to this doctor" });
    }

    res.status(200).json({ patient });
  } catch (error) {
    console.error("Error fetching patient details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getDoctorProfile = async (req, res) => {
  const doctorId = req.userId; // Get doctorId from the request

  try {
    // Find the doctor by ID
    const doctorProfile = await hospitalDoctors
      .findById(doctorId)
      .select("-password"); // Exclude password for security

    // Check if doctor profile exists
    if (!doctorProfile) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Return doctor profile
    return res.status(200).json({ doctorProfile });
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    return res
      .status(500)
      .json({ message: "Error fetching doctor profile", error: error.message });
  }
};
export const assignPatientToLab = async (req, res) => {
  const doctorId = req.userId;
  try {
    const { admissionId, patientId, labTestName } = req.body;

    // Validate request fields
    if (!admissionId || !patientId || !doctorId || !labTestName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the patient exists
    const patient = await patientSchema.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Check if the admission record exists
    const admissionRecord = patient.admissionRecords.id(admissionId);
    if (!admissionRecord) {
      return res.status(404).json({ message: "Admission record not found" });
    }

    // Optionally: Check for duplicate lab test assignment
    const existingLabReport = await LabReport.findOne({
      admissionId,
      labTestName,
    });
    if (existingLabReport) {
      return res
        .status(400)
        .json({ message: "Lab test already assigned for this admission" });
    }

    // Create a new lab report assignment
    const labReport = new LabReport({
      admissionId,
      patientId,
      doctorId,
      labTestName,
    });

    await labReport.save();

    res.status(200).json({
      message: "Patient assigned to lab successfully",
      labReport,
    });
  } catch (error) {
    console.error("Error assigning patient to lab:", error);
    res.status(500).json({
      message: "Error assigning patient to lab",
      error: error.message,
    });
  }
};
