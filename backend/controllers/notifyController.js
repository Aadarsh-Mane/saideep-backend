import admin from "firebase-admin";
import patientSchema from "./../models/patientSchema.js";
import hospitalDoctors from "./../models/hospitalDoctorSchema.js";
// Initialize Firebase Admin SDK (ensure you've set up Firebase in your project)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      require("./path/to/your/serviceAccountKey.json")
    ),
  });
}

// Function to send notification
const sendNotification = async (token, title, body) => {
  try {
    const message = {
      token,
      notification: {
        title,
        body,
      },
    };
    const response = await admin.messaging().send(message);
    console.log("Notification sent successfully:", response);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

// Updated assignDoctor function
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

    // Assign doctor to admission record
    admissionRecord.doctor = { id: doctorId, name: doctor.doctorName };
    await patient.save();

    // Check if doctor has FCM token
    if (doctor.fcmToken) {
      // Send notification to the doctor
      const title = "New Patient Assignment";
      const body = `You have been assigned a new patient: ${patient.name}`;
      await sendNotification(doctor.fcmToken, title, body);
    } else {
      console.warn("Doctor does not have an FCM token. Notification not sent.");
    }

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

export const getFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.userId;

    if (!fcmToken) {
      return res.status(400).json({ message: "FCM token is required." });
    }

    const user = await hospitalDoctors.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ message: "FCM token stored successfully." });
  } catch (error) {
    console.error("Error storing FCM token:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
