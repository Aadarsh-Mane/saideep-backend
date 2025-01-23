import { fileURLToPath } from "url"; // To handle __dirname in ESM
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import cloudinary from "../helpers/cloudinary.js";
import LabReport from "../models/labreportSchema.js";
import { Readable } from "stream";

// export const getPatientsAssignedToLab = async (req, res) => {
//   try {
//     // Fetch all lab reports and populate patient and doctor details
//     const labReports = await LabReport.find()
//       .populate({
//         path: "patientId",
//         select: "name age gender contact admissionRecords", // Only include the necessary fields
//         match: {
//           // Only include patients with non-empty admissionRecords array
//           admissionRecords: { $not: { $size: 0 } },
//         },
//       })
//       .populate({
//         path: "doctorId",
//         select: "doctorName email",
//       });

//     if (!labReports || labReports.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No patients assigned to the lab." });
//     }

//     // Exclude followUps from the populated patient data
//     labReports.forEach((report) => {
//       report.patientId.admissionRecords.forEach((record) => {
//         delete record.followUps; // Remove the followUps field from each admission record
//       });
//     });

//     res.status(200).json({
//       message: "Patients assigned to the lab retrieved successfully",
//       labReports,
//     });
//   } catch (error) {
//     console.error("Error retrieving patients assigned to the lab:", error);
//     res
//       .status(500)
//       .json({ message: "Error retrieving patients", error: error.message });
//   }
// };
export const getPatientsAssignedToLab = async (req, res) => {
  try {
    // Fetch all lab reports and populate necessary patient and doctor fields
    const labReports = await LabReport.find()
      .populate({
        path: "patientId",
        select: "name age gender contact discharged", // Added 'discharged' field
      })
      .populate({
        path: "doctorId",
        select: "doctorName email", // Only include necessary doctor fields
      })
      .sort({ _id: -1 }); // Sort by _id in descending order (newest documents first)

    if (!labReports || labReports.length === 0) {
      return res
        .status(404)
        .json({ message: "No patients assigned to the lab." });
    }

    res.status(200).json({
      message: "Patients assigned to the lab retrieved successfully",
      labReports,
    });
  } catch (error) {
    console.error("Error retrieving patients assigned to the lab:", error);
    res
      .status(500)
      .json({ message: "Error retrieving patients", error: error.message });
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

export const generateReportPdfForPatient = async (req, res) => {
  // Setup __dirname for ESM
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  try {
    const { admissionId, patientId, labTestName, labType, labReportId } =
      req.body;
    const file = req.file; // Get the uploaded PDF file

    if (!admissionId || !patientId || !labTestName || !labType || !file) {
      return res.status(400).json({ message: "All fields are required" });
    }

    console.log("Uploaded file details:", file);

    // Authenticate with Google Drive
    const auth = new google.auth.GoogleAuth({
      credentials: ServiceAccount,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
    const drive = google.drive({ version: "v3", auth });

    // Convert buffer to a readable stream
    const bufferStream = new Readable();
    bufferStream.push(file.buffer);
    bufferStream.push(null);

    // Upload file to Google Drive
    const fileMetadata = {
      name: file.originalname, // Use the original file name
      parents: ["1Trbtp9gwGwNF_3KNjNcfL0DHeSUp0HyV"], // Replace with your shared folder ID
    };
    const media = {
      mimeType: file.mimetype,
      body: bufferStream, // Stream the buffer directly
    };

    const uploadResponse = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id, webViewLink",
    });

    const reportUrl = uploadResponse.data.webViewLink; // Link to the uploaded file

    // Save report to MongoDB
    const labReport = await LabReport.findById(labReportId);
    if (!labReport) {
      return res.status(404).json({ message: "Lab report not found" });
    }

    labReport.reports.push({
      labTestName,
      reportUrl,
      labType,
      uploadedAt: new Date(),
    });

    await labReport.save();

    res.status(200).json({
      message: "Lab report uploaded successfully",
      labReport,
    });
  } catch (error) {
    console.error("Error uploading lab report:", error);
    res.status(500).json({
      message: "Error uploading lab report",
      error: error.message,
    });
  }
};
