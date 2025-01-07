import { client } from "../../helpers/twilio.js";
import Appointment from "../../models/bookAppointmentSchema.js";
import hospitalDoctors from "../../models/hospitalDoctorSchema.js";
import PatientHistory from "../../models/patientHistorySchema.js";
import patientSchema from "../../models/patientSchema.js";
import { sendNotification } from "../notifyController.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { fileURLToPath } from "url"; // To handle __dirname in ESM
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import puppeteer from "puppeteer";

dayjs.extend(utc);
dayjs.extend(timezone);
// export const addPatient = async (req, res) => {
//   const {
//     name,
//     age,
//     gender,
//     contact,
//     address,
//     weight,
//     caste,
//     reasonForAdmission,
//     symptoms,
//     initialDiagnosis,
//     isReadmission
//   } = req.body;

//   try {
//     let patient = await patientSchema.findOne({ name, contact });

//     if (patient) {
//       let daysSinceLastAdmission = null;

//       // Check if the patient has been discharged
//       if (!patient.discharged) {
//         // If not discharged, calculate days since last admission
//         if (patient.admissionRecords.length > 0) {
//           const lastAdmission =
//             patient.admissionRecords[patient.admissionRecords.length - 1]
//               .admissionDate;
//           daysSinceLastAdmission = dayjs().diff(dayjs(lastAdmission), "day");
//         }
//       } else {
//         // Patient has been discharged, check history for the last discharge date
//         let patientHistory = await PatientHistory.findOne({
//           patientId: patient.patientId,
//         });

//         if (patientHistory) {
//           // Fetch the latest discharge date from the history
//           const lastDischarge = patientHistory.history
//             .filter((entry) => entry.dischargeDate)
//             .sort((a, b) =>
//               dayjs(b.dischargeDate).isBefore(a.dischargeDate) ? -1 : 1
//             )[0];

//           if (lastDischarge) {
//             // Calculate the days since last discharge
//             daysSinceLastAdmission = dayjs().diff(
//               dayjs(lastDischarge.dischargeDate),
//               "day"
//             );
//           }
//         }

//         // Set discharged status to false for re-admission
//         patient.discharged = false;
//       }

//       // Add new admission record
//       patient.admissionRecords.push({
//         admissionDate: new Date(),
//         reasonForAdmission,
//         symptoms,
//         initialDiagnosis,
//       });

//       // Save updated patient record
//       await patient.save();

//       return res.status(200).json({
//         message: `Patient ${name} re-admitted successfully.`,
//         patientDetails: patient,
//         daysSinceLastAdmission,
//         admissionRecords: patient.admissionRecords,
//       });
//     }

//     // If patient does not exist, create a new one with a generated patientId
//     const patientId = generatePatientId(name);

//     patient = new patientSchema({
//       patientId,
//       name,
//       age,
//       gender,
//       contact,
//       address,
//       weight,
//       caste,
//       admissionRecords: [
//         {
//           admissionDate: new Date(),
//           reasonForAdmission,
//           symptoms,
//           initialDiagnosis,
//         },
//       ],
//     });
//     await patient.save();
//     // const messageBody = `Dear ${name}, welcome to our spandan hospital. Your patient ID is ${patientId}. Wishing you a speedy recovery!`;

//     // await client.messages.create({
//     //   from: "+14152149378", // Twilio phone number
//     //   to: contact,
//     //   body: messageBody,
//     // });

//     res.status(200).json({
//       message: `Patient ${name} added successfully with ID ${patientId}.`,
//       patientDetails: patient,
//     });
//   } catch (error) {
//     console.error("Error adding patient:", error);
//     res
//       .status(500)
//       .json({ message: "Error adding patient", error: error.message });
//   }
// };
// const generatePatientId = (name) => {
//   const initials = name.slice(0, 3).toUpperCase(); // First three letters of the name
//   const randomDigits = Math.floor(100 + Math.random() * 900); // Generate three random digits
//   return `${initials}${randomDigits}`;
// };
export const addPatient = async (req, res) => {
  const {
    name,
    age,
    gender,
    contact,
    address,
    weight,
    caste,
    reasonForAdmission,
    symptoms,
    initialDiagnosis,
    isReadmission,
  } = req.body;

  try {
    let patient;

    if (isReadmission) {
      // Fetch patient by name and contact (or implement different search criteria)
      // patient = await patientSchema.findOne({ name, contact });
      if (!req.body.patientId)
        return res
          .status(404)
          .json({ message: "Patient ID is required for readmission." });
      patient = await patientSchema.findOne({ patientId: req.body.patientId }); // Assuming patientId is provided for readmission
      if (!patient.discharged)
        return res.status(400).json({ message: "Patient is not discharged." });
      if (patient) {
        let daysSinceLastAdmission = null;

        // Check if the patient has been discharged
        if (!patient.discharged) {
          // Calculate days since last admission if not discharged
          if (patient.admissionRecords.length > 0) {
            const lastAdmission =
              patient.admissionRecords[patient.admissionRecords.length - 1]
                .admissionDate;
            daysSinceLastAdmission = dayjs().diff(dayjs(lastAdmission), "day");
          }
        } else {
          // If discharged, check discharge history
          const patientHistory = await PatientHistory.findOne({
            patientId: patient.patientId,
          });

          if (patientHistory) {
            // Fetch the latest discharge date
            const lastDischarge = patientHistory.history
              .filter((entry) => entry.dischargeDate)
              .sort((a, b) =>
                dayjs(b.dischargeDate).isBefore(a.dischargeDate) ? -1 : 1
              )[0];

            if (lastDischarge) {
              daysSinceLastAdmission = dayjs().diff(
                dayjs(lastDischarge.dischargeDate),
                "day"
              );
            }
          }

          // Set discharged status to false for re-admission
          patient.discharged = false;
        }

        // Update all patient details
        patient.name = name;
        patient.age = age;
        patient.gender = gender;
        patient.contact = contact;
        patient.address = address;
        patient.weight = weight;
        patient.caste = caste;

        // Add new admission record for re-admission
        patient.admissionRecords.push({
          admissionDate: new Date(),
          reasonForAdmission,
          weight,
          symptoms,
          initialDiagnosis,
        });

        // Save updated patient record
        await patient.save();

        return res.status(200).json({
          message: `Patient ${name} re-admitted successfully.`,
          patientDetails: patient,
          daysSinceLastAdmission,
          admissionRecords: patient.admissionRecords,
        });
      } else {
        return res
          .status(404)
          .json({ message: "Patient not found for readmission." });
      }
    } else {
      // If not a readmission, create a new patient
      const patientId = generatePatientId(name);

      patient = new patientSchema({
        patientId,
        name,
        age,
        gender,
        contact,
        address,
        weight,
        caste,
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

      return res.status(200).json({
        message: `Patient ${name} added successfully with ID ${patientId}.`,
        patientDetails: patient,
      });
    }
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

// Controller to list all available doctors
export const listDoctors = async (req, res) => {
  try {
    // Retrieve all doctors, with an option to filter by availability if required
    const doctors = await hospitalDoctors
      .find({
        usertype: "doctor",
        // available: true,
      })
      .select("-password -createdAt -fcmToken");

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
export const getDoctorsPatient = async (req, res) => {
  try {
    const { doctorName } = req.params; // Assuming doctor name is passed as a query parameter

    // Find patients where any admission record has the specified doctor name
    const patients = await patientSchema.find({
      admissionRecords: {
        $elemMatch: { "doctor.name": doctorName },
      },
    });

    // If no patients are found, return a 404 message
    if (!patients || patients.length === 0) {
      return res
        .status(404)
        .json({ message: "No patients found for this doctor" });
    }

    // Return the list of patients assigned to this doctor
    return res.status(200).json({ patients });
  } catch (error) {
    console.error("Error retrieving doctor's patients:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getDischargedPatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!patientId) {
      return res.status(400).json({ error: "Patient ID is required." });
    }

    const patientHistory = await PatientHistory.aggregate([
      {
        $match: { patientId: patientId }, // Match the specific patient by ID
      },
      {
        $project: {
          _id: 0,
          patientId: 1,
          name: 1,
          gender: 1,
          contact: 1,
          lastRecord: { $arrayElemAt: ["$history", -1] }, // Get the last element of the history array
        },
      },
    ]);

    if (patientHistory.length === 0) {
      return res
        .status(404)
        .json({ error: "Patient not found or no history available." });
    }

    const result = patientHistory[0];

    // Format the dates in the last record
    if (result.lastRecord) {
      const lastRecord = result.lastRecord;
      lastRecord.admissionDate = dayjs(lastRecord.admissionDate)
        .tz("Asia/Kolkata")
        .format("YYYY-MM-DD hh:mm:ss A"); // Format: 2025-01-04 03:18:43 PM
      lastRecord.dischargeDate = dayjs(lastRecord.dischargeDate)
        .tz("Asia/Kolkata")
        .format("YYYY-MM-DD hh:mm:ss A");
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching patient history:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
// export const dischargePatientByReception = async (req, res) => {
//   try {
//     const { patientId, admissionId, amountPaid } = req.body;

//     if (!patientId || !admissionId || amountPaid == null) {
//       return res.status(400).json({
//         error: "Patient ID, admission ID, and amount paid are required.",
//       });
//     }

//     // Find the patient record
//     const patient = await patientSchema.findOne({ patientId });

//     if (!patient) {
//       return res.status(404).json({ error: "Patient not found." });
//     }

//     // Find the admission record
//     const admissionRecord = patient.admissionRecords.find(
//       (record) => record._id.toString() === admissionId
//     );

//     if (!admissionRecord) {
//       return res.status(404).json({ error: "Admission record not found." });
//     }

//     // Calculate remaining amount
//     const { amountToBePayed } = admissionRecord;
//     const previousPendingAmount = patient.pendingAmount || 0;
//     const totalAmountDue = amountToBePayed + previousPendingAmount;
//     const newPendingAmount = totalAmountDue - amountPaid;

//     // Update admission record and patient pending amount
//     admissionRecord.dischargeDate = new Date(); // Set discharge date
//     admissionRecord.status = "Discharged"; // Update status
//     admissionRecord.previousRemainingAmount = previousPendingAmount;

//     // Update pending amount in the patient schema
//     patient.pendingAmount = Math.max(newPendingAmount, 0);
//     patient.discharged = newPendingAmount <= 0; // Mark as fully settled if no pending amount

//     await patient.save();

//     return res.status(200).json({
//       message: "Patient discharged successfully.",
//       updatedAdmissionRecord: admissionRecord,
//       updatedPendingAmount: patient.pendingAmount,
//     });
//   } catch (error) {
//     console.error("Error discharging patient:", error);
//     return res.status(500).json({ error: "Internal server error." });
//   }
// };
export const dischargePatientByReception = async (req, res) => {
  try {
    const { patientId, admissionId, amountPaid } = req.body;

    if (!patientId || !admissionId || amountPaid == null) {
      return res.status(400).json({
        error: "Patient ID, admission ID, and amount paid are required.",
      });
    }

    // Find the patient record
    const patient = await patientSchema.findOne({ patientId });

    if (!patient) {
      return res.status(404).json({ error: "Patient not found." });
    }

    // Fetch the patient's history to get the most recent admission record
    const patientHistory = await PatientHistory.findOne({ patientId });

    if (!patientHistory || patientHistory.history.length === 0) {
      return res.status(404).json({ error: "Patient history not found." });
    }

    // Find the most recent admission record in the history
    const lastRecord =
      patientHistory.history[patientHistory.history.length - 1];
    const { amountToBePayed } = lastRecord;

    // Calculate remaining amount
    const previousPendingAmount = patient.pendingAmount || 0;
    const totalAmountDue = amountToBePayed + previousPendingAmount;
    const newPendingAmount = totalAmountDue - amountPaid;

    // Update the pending amount in the patient schema
    patient.pendingAmount = Math.max(newPendingAmount, 0); // Ensure no negative pending amount
    patient.discharged = newPendingAmount <= 0; // Mark as fully discharged if no pending amount

    await patient.save();

    return res.status(200).json({
      message: "Patient discharged successfully.",
      updatedPendingAmount: patient.pendingAmount,
    });
  } catch (error) {
    console.error("Error discharging patient:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
const ServiceAccount = {
  type: "service_account",
  project_id: "doctor-dd7e8",
  private_key_id: "5966d0605cb722f31fbcfdcd716153ad34529ed0",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDU8SYYtRBdRLgf\n9kRj70jHsNL6wj0s6I6NETYve1djm+okgfyAhU8MY0eKAexaaYQ+iJ9gRGaBoo1n\n7NMcMBd85HfKqYshuyyv/cqUIZKzRIn9czGkTkb2R2NsWRMfYWV7LeYfO3xkGWRD\nrII51YIJOujqNZMM3IJ4XiUkkww6iDC5ykEFtK7laPpXCL9ykdF9oMEybFtjF+1q\nVlh2PAilE7TzZWDnwjM5D6S2fdEj1WXDYMozsspBHOykk4RDcb1KkXjSSrbo5zTq\naCIuAxTHmA01EE5bJLP1DFrm+6VLMCjpZkdTxGOg8t3eMJ2L/o4ce8YW1QpBpc8x\ni5mjjYl1AgMBAAECggEAIr0ahXJYcpbI4PH4k0MQoP8wVBdHCqH/y3Sw3csl5Qql\nBoKsMj1NOYyiuZl5uQA4wkjgk0BlZqWhowAoKpOP6WCOSGIjYAPclPN2znaxq4w1\nZMMbqJ3ahsf7qMvZSkfF2fQRdCvsrZnU2RN2BUBXH/Fb2QWXcUQyBrf5ID/bAVs1\nJQKaSVT2cyRWPk6Q9t4DcXunpD7PXgFd8lyj/289SHMyf/0SDbNzcP5d+2zYj9D7\nSEXE7+n9odQRmIq+mRFIxIweyXY2w2H7aHpy5wtz00rQm+qFBlk+1VG3/JYMcOmu\nag/0E2JF3Pz1kjVh8/MZ6Plkc5++AGZ9oam+tqqoiwKBgQD3aE0HmOH7kMSewcM8\n0MYIxizFPQRLxIQ+O1aE+p/147Ey16SIgsc7oTnYFO1/TtxxCLvteMfHgrhHvqWK\ndRK9KR8JlzadojJAOI9U7AtVMThLNWDKxOupLrFhjA7eyYs0SlSLpuouNwnKe+FW\nQc+X4OB6gnM+pbgxkK3AM2WPwwKBgQDcVmpu1ZXNs+W6cmCYwhLLlwrLS1f0r8Nk\n9oAx0kg9PW2w/7Be4gFSKeAxFQ0OvHn6K5mLJc6QV6fPQL3zxtTbqubU3DYbLW2F\n7fZdI4zRA1EqiKrn+euT/F9TF0gS/00GQB8aSGjsJmdkaEjt6/9XD8T40+/5K+3a\nuv4kImNmZwKBgD9Uq6MuN2q1/B7Harq+lnLYh81VeSwL+e4UMmmH3jqLNmjVWoC3\nOVjCRJRThxf3j+Y/XhvDtyATDikPXEC9Bzb0t8U0t/5R7psR317VrXD5UHewCj7d\neZWtJiraN1RAMyoHfOzipT9/RzpVy7DQ19sA7XVuvyFiOmw1pMR2Y6ERAoGAOCcV\nzNVF7jyQqWmI0KV1IMmHiLPU4JkClPJ1TT0oB+Nl1xvymNvENmpRpnCU+VJzS5xc\n7yddc0/DhoAbaMsdaDYvycOtTlPPe7hfdvEebA4KW2qlE6WPshE5QfXG+oBx4svo\noUwe4UAQTXh+TZQ9aLSuIDPzDm9xmLLbHd5dsrUCgYA44Xm1h/kBmgaROuXjpJk+\nBY+N43Fx8EaXi2UGVSoRrdnk634nAJltQYaGeVPPwv+6I4Q2bBcL9VcjT8gNK43c\nImt+DRb9G2P6lfXBDGkPmHwmzhfszNEuyVglNLyggAWQgUcNZ7EmPYa43B6s3BXZ\nEZ3nHVzbmC/toUZ5OdiSFA==\n-----END PRIVATE KEY-----\n",
  client_email: "doctor-459@doctor-dd7e8.iam.gserviceaccount.com",
  client_id: "109450368952306583894",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/doctor-459%40doctor-dd7e8.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

export const generateBillForDischargedPatient = async (req, res) => {
  try {
    const {
      patientId,
      amountPaid = 0,
      icsAmount = 0,
      otherAdjustments = 0,
      bedCharges,
      oxygenCharges,
      medicineCharges,
      investigationCharges,
    } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: "Patient ID is required." });
    }

    // Find the patient record
    const patient = await patientSchema.findOne({ patientId });

    if (!patient) {
      return res.status(404).json({ error: "Patient not found." });
    }

    // Fetch the patient's most recent admission history
    const patientHistory = await PatientHistory.findOne({ patientId });

    if (!patientHistory || patientHistory.history.length === 0) {
      return res.status(404).json({ error: "Patient history not found." });
    }

    // Get the last record (most recent admission)
    const lastRecord =
      patientHistory.history[patientHistory.history.length - 1];
    const {
      name,
      gender,
      contact,
      weight,
      admissionDate,
      dischargeDate,
      reasonForAdmission,
      conditionAtDischarge,
      doctor,
      amountToBePayed,
    } = lastRecord;

    // Start with the pending amount from the patient schema and last admission record
    let totalAmountDue = (patient.pendingAmount || 0) + (amountToBePayed || 0);

    // Calculate bed charges dynamically (if provided)
    if (bedCharges) {
      const { startDate, endDate, ratePerDay } = bedCharges;
      if (!startDate || !endDate || !ratePerDay) {
        return res.status(400).json({
          error:
            "If bed charges are included, startDate, endDate, and ratePerDay are required.",
        });
      }

      const bedDays = Math.ceil(
        (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
      );
      const bedChargeAmount = bedDays * ratePerDay;
      totalAmountDue += bedChargeAmount;
      bedCharges.total = bedChargeAmount; // Add computed total to the response
    }

    // Calculate oxygen charges (if provided)
    if (oxygenCharges) {
      const { quantity, ratePerUnit } = oxygenCharges;
      if (quantity == null || ratePerUnit == null) {
        return res.status(400).json({
          error:
            "If oxygen charges are included, quantity and ratePerUnit are required.",
        });
      }
      const oxygenChargeAmount = quantity * ratePerUnit;
      totalAmountDue += oxygenChargeAmount;
      oxygenCharges.total = oxygenChargeAmount;
    }

    // Calculate medicine charges (if provided)
    if (medicineCharges) {
      const { totalCost } = medicineCharges;
      if (totalCost == null) {
        return res.status(400).json({
          error: "If medicine charges are included, totalCost is required.",
        });
      }
      totalAmountDue += totalCost;
    }

    // Calculate investigation charges (if provided)
    let totalInvestigationCharges = 0;
    if (investigationCharges && investigationCharges.length > 0) {
      totalInvestigationCharges = investigationCharges.reduce(
        (total, charge) => total + (charge.amount || 0),
        0
      );
      totalAmountDue += totalInvestigationCharges;
    }

    // Apply ICS and other adjustments to the bill calculation
    const adjustedAmount = totalAmountDue - icsAmount - otherAdjustments;

    // Calculate the remaining balance after payment
    const remainingBalance = adjustedAmount - amountPaid;

    // Update the pending amount in the patient schema
    patient.pendingAmount = Math.max(remainingBalance, 0); // Ensure no negative pending balance
    patient.discharged = remainingBalance <= 0; // Mark as fully discharged if no pending amount
    patientHistory.dischargedByReception = true;
    await patientHistory.save();
    // Save the updated patient record
    await patient.save();

    // Prepare the final bill details
    const billDetails = {
      patientId: patientId,
      name: name || patient.name,
      gender: gender || patient.gender,
      contact: contact || patient.contact,
      weight,
      admissionDate,
      dischargeDate,
      reasonForAdmission,
      conditionAtDischarge,
      doctorName: doctor?.name,
      bedCharges,
      oxygenCharges,
      medicineCharges,
      investigationCharges: investigationCharges || [],
      totalInvestigationCharges,
      amountToBePayed: totalAmountDue,
      icsAmount: icsAmount,
      otherAdjustments: otherAdjustments,
      finalAmountDue: adjustedAmount,
      amountPaid: amountPaid,
      remainingBalance: remainingBalance,
      dischargeStatus: patient.discharged
        ? "Fully Discharged"
        : "Pending Balance",
    };

    // HTML template for the bill
    const billHTML = `
   <html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #ddd;
      padding-bottom: 20px;
    }
    img {
  background-color: transparent;
}

    .header img {
      height: 80px;
      margin-bottom: 10px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      color: #333;
    }
    .header p {
      margin: 5px 0;
      font-size: 14px;
      color: #555;
    }
    .bill-details, .charges {
      margin-top: 20px;
      width: 100%;
      border-collapse: collapse;
    }
    .charges th, .charges td, .bill-details th, .bill-details td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    .charges th, .bill-details th {
      background-color: #f7f7f7;
    }
    .summary {
      margin-top: 30px;
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 10px;
      border: 1px solid #ddd;
    }
    .summary h2 {
      margin-top: 0;
      font-size: 20px;
      color: #444;
    }
    .summary p {
      margin: 10px 0;
      font-size: 16px;
      color: #333;
    }
    .summary strong {
      color: #000;
    }
  </style>
</head>
<body>
 <div class="header">
  <img src="https://img.freepik.com/premium-vector/blue-abstract-design-with-white-background_1123160-1669.jpg" alt="Hospital Logo" />
  <h1>Hospital Bill</h1>
  <table style="width: 100%; border-spacing: 0; margin-top: 10px;">
    <tr>
      <td><strong>Patient ID:</strong> ${billDetails.patientId}</td>
      <td><strong>Name:</strong> ${billDetails.name || "N/A"}</td>
      <td><strong>Age:</strong> ${billDetails.age || "N/A"}</td>
      <td><strong>Weight:</strong> ${billDetails.weight || "N/A"}</td>
    </tr>
    <tr>
      <td><strong>Gender:</strong> ${billDetails.gender || "N/A"}</td>
      <td><strong>Caste:</strong> ${billDetails.caste || "N/A"}</td>
      <td><strong>Contact:</strong> ${billDetails.contact || "N/A"}</td>
      <td><strong>Doctor:</strong> ${billDetails.doctorName || "N/A"}</td>
    </tr>
  </table>
</div>


  <table class="bill-details">
    <tr>
      <th>Admission Date</th>
      <td>${billDetails.admissionDate || "N/A"}</td>
    </tr>
    <tr>
      <th>Discharge Date</th>
      <td>${billDetails.dischargeDate || "N/A"}</td>
    </tr>
    <tr>
      <th>Reason for Admission</th>
      <td>${billDetails.reasonForAdmission || "N/A"}</td>
    </tr>
    <tr>
      <th>Condition at Discharge</th>
      <td>${billDetails.conditionAtDischarge || "N/A"}</td>
    </tr>
    <tr>
      <th>Doctor</th>
      <td>${billDetails.doctorName || "N/A"}</td>
    </tr>
  </table>

  <table class="charges">
    <tr>
      <th>Description</th>
      <th>Details</th>
      <th>Amount</th>
    </tr>
    <tr>
      <td>Bed Charges</td>
      <td>
        Start Date: ${billDetails.bedCharges.startDate || "N/A"}<br>
        End Date: ${billDetails.bedCharges.endDate || "N/A"}<br>
        Rate Per Day: ${billDetails.bedCharges.ratePerDay || 0}
      </td>
      <td>${
        ((new Date(billDetails.bedCharges.endDate) -
          new Date(billDetails.bedCharges.startDate)) /
          (1000 * 60 * 60 * 24)) *
          billDetails.bedCharges.ratePerDay || 0
      }</td>
    </tr>
    <tr>
      <td>Oxygen Charges</td>
      <td>
        Quantity: ${billDetails.oxygenCharges.quantity || 0}<br>
        Rate Per Unit: ${billDetails.oxygenCharges.ratePerUnit || 0}
      </td>
      <td>${
        billDetails.oxygenCharges.quantity *
          billDetails.oxygenCharges.ratePerUnit || 0
      }</td>
    </tr>
    <tr>
      <td>Medicine Charges</td>
      <td>Total Cost</td>
      <td>${billDetails.medicineCharges.totalCost || 0}</td>
    </tr>
    ${billDetails.investigationCharges
      .map(
        (item) => `
    <tr>
      <td>Investigation</td>
      <td>${item.description}</td>
      <td>${item.amount}</td>
    </tr>`
      )
      .join("")}
    <tr>
      <td>ICS Adjustment</td>
      <td>Deduction</td>
      <td>-${billDetails.icsAmount || 0}</td>
    </tr>
    <tr>
      <td>Other Adjustments</td>
      <td>Deduction</td>
      <td>-${billDetails.otherAdjustments || 0}</td>
    </tr>
    <tr>
      <th colspan="2">Total Amount Due</th>
      <th>${billDetails.finalAmountDue || 0}</th>
    </tr>
  </table>

  <div class="summary">
    <h2>Billing Summary</h2>
    <p><strong>Amount Paid:</strong> ${billDetails.amountPaid || 0}</p>
    <p><strong>Remaining Balance:</strong> ${
      billDetails.remainingBalance || 0
    }</p>
    <p><strong>Status:</strong> ${billDetails.dischargeStatus || "N/A"}</p>
    <p><strong>Amount to be Paid:</strong> ${
      billDetails.amountToBePayed || 0
    }</p>
  </div>
</body>
</html>



    `;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(billHTML);
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    // Authenticate with Google Drive API
    const auth = new google.auth.GoogleAuth({
      credentials: ServiceAccount,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
    const drive = google.drive({ version: "v3", auth });

    // Convert PDF buffer into a readable stream
    const bufferStream = new Readable();
    bufferStream.push(pdfBuffer);
    bufferStream.push(null);

    // Folder ID in Google Drive
    const folderId = "1Trbtp9gwGwNF_3KNjNcfL0DHeSUp0HyV";

    // Upload PDF to Google Drive
    const driveFile = await drive.files.create({
      resource: {
        name: `Bill_${patientId}.pdf`,
        parents: [folderId],
      },
      media: {
        mimeType: "application/pdf",
        body: bufferStream,
      },
      fields: "id, webViewLink",
    });

    // Extract file's public link
    const fileLink = driveFile.data.webViewLink;
    await browser.close();

    return res.status(200).json({
      message: "Bill generated successfully.",
      billDetails: billDetails,
      fileLink: fileLink,
    });
  } catch (error) {
    console.error("Error generating bill:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const listAllPatientsWithLastRecord = async (req, res) => {
  try {
    const patientsHistory = await PatientHistory.aggregate([
      // Sort the history array by admissionDate in descending order
      {
        $addFields: {
          history: {
            $sortArray: {
              input: "$history",
              sortBy: { admissionDate: -1 }, // Sort descending by admissionDate
            },
          },
        },
      },
      // Unwind the history array
      {
        $unwind: "$history",
      },
      // Group by patientId to get the last record after sorting
      {
        $group: {
          _id: "$patientId", // Group by patientId
          name: { $first: "$name" }, // Get the first name value (consistent for each patientId)
          gender: { $first: "$gender" }, // Get the first gender value
          contact: { $first: "$contact" }, // Get the first contact value
          lastRecord: { $first: "$history" }, // First record from the sorted array (latest record)
        },
      },
      // Project the output fields
      {
        $project: {
          _id: 0, // Exclude _id
          patientId: "$_id", // Include patientId
          name: 1,
          gender: 1,
          contact: 1,
          lastRecord: 1,
        },
      },
    ]);

    // Check if any patients are found
    if (patientsHistory.length === 0) {
      return res
        .status(404)
        .json({ error: "No patients found or no history available." });
    }

    // Format the dates in the last record
    patientsHistory.forEach((patient) => {
      const lastRecord = patient.lastRecord;
      if (lastRecord) {
        lastRecord.admissionDate = lastRecord.admissionDate
          ? dayjs(lastRecord.admissionDate)
              .tz("Asia/Kolkata")
              .format("YYYY-MM-DD hh:mm:ss A")
          : null;
        lastRecord.dischargeDate = lastRecord.dischargeDate
          ? dayjs(lastRecord.dischargeDate)
              .tz("Asia/Kolkata")
              .format("YYYY-MM-DD hh:mm:ss A")
          : null;
      }
    });

    return res.status(200).json(patientsHistory);
  } catch (error) {
    console.error("Error fetching patients' history:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
