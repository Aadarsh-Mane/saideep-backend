import cloudinary from "../helpers/cloudinary.js";
import LabReport from "../models/labreportSchema.js";
export const getPatientsAssignedToLab = async (req, res) => {
  try {
    // Fetch all lab reports and populate patient and doctor details
    const labReports = await LabReport.find()
      .populate({
        path: "patientId",
        select: "name age gender contact", // Select specific fields from the Patient schema
      })
      .populate({
        path: "doctorId",
        select: "doctorName email", // Select specific fields from the Doctor schema
      });

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

export const generateReportPdfForPatient = async (req, res) => {
  try {
    const { admissionId, patientId, labTestName, labType } = req.body; // Accept new fields
    const file = req.file; // Get the uploaded PDF file

    if (!admissionId || !patientId || !labTestName || !labType || !file) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Upload the PDF file to Cloudinary
    let reportUrl = "";
    if (file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.v2.uploader
          .upload_stream(
            {
              folder: "lab_reports", // Cloudinary folder for lab reports
              resource_type: "auto", // For handling non-image files like PDFs
            },
            (error, result) => {
              if (error) {
                reject(new Error(error.message));
              } else {
                resolve(result);
              }
            }
          )
          .end(file.buffer); // Pass the buffer to Cloudinary
      });

      reportUrl = uploadResult.secure_url; // Save the URL of the uploaded PDF
    }

    // Find the lab report document by admissionId and patientId
    let labReport = await LabReport.findOne({ admissionId, patientId });

    if (!labReport) {
      // If no lab report document exists for the admissionId, create one
      labReport = new LabReport({
        admissionId,
        patientId,
        // doctorId,
        reports: [],
      });
    }

    // Add a new report to the reports array
    labReport.reports.push({
      labTestName,
      reportUrl,
      labType,
      uploadedAt: new Date(),
    });

    // Save the updated lab report document
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
