import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Doctor from "../models/doctorSchema.js";
import hospitalDoctors from "../models/hospitalDoctorSchema.js";
import NonPatient from "../models/nonPatientSchema.js";
import Nurse from "../models/nurseSchema.js";
import twilio from "twilio";
import { fileURLToPath } from "url"; // To handle __dirname in ESM
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import cloudinary from "../helpers/cloudinary.js";
import LabReport from "../models/labreportSchema.js";
import { Readable } from "stream";
const SECRET = "DOCTOR";
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
export const signupDoctor = async (req, res) => {
  try {
    const {
      email,
      password,
      usertype,
      doctorName,
      speciality,
      experience,
      department,
      phoneNumber,
    } = req.body;
    const file = req.file;
    console.log("Uploaded file details:", file);

    const existingUser = await hospitalDoctors.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }
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

    const imageUrl = uploadResponse.data.webViewLink; // Link to the uploaded file

    // Hash the password and create the user
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await hospitalDoctors.create({
      email,
      password: hashedPassword,
      usertype,
      doctorName,
      speciality,
      experience,
      department,
      phoneNumber,
      imageUrl,
      // Add this field for FCM token
      // Link to doctor by name
    });

    // Generate JWT token
    const token = jwt.sign(
      { email: result.email, id: result._id, usertype: result.usertype },
      SECRET,
      { expiresIn: "30d" }
    );

    res.status(201).json({ user: result, token });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Signup failed.", error: error.message });
  }
};

export const signinDoctor = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const existingUser = await hospitalDoctors.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if password is correct
    const matchPassword = await bcrypt.compare(password, existingUser.password);
    if (!matchPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        email: existingUser.email,
        id: existingUser._id,
        usertype: existingUser.usertype,
      },
      SECRET,
      { expiresIn: "30d" }
    );

    res.status(200).json({ user: existingUser, token });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ message: "Signin failed", error: error.message });
  }
};
export const signupNurse = async (req, res) => {
  const { email, password, usertype, nurseName } = req.body;

  try {
    // Check if a user with the provided email already exists
    const existingUser = await Nurse.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Hash the password and create the user
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await Nurse.create({
      email,
      password: hashedPassword,
      usertype, // Add usertype field if needed
      nurseName,
    });

    // Generate JWT token
    const token = jwt.sign(
      { email: result.email, id: result._id, usertype: result.usertype },
      SECRET,
      { expiresIn: "30d" }
    );

    res.status(201).json({ user: result, token });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Signup failed.", error: error.message });
  }
};
export const signinNurse = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const existingUser = await Nurse.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the password is correct
    const matchPassword = await bcrypt.compare(password, existingUser.password);
    if (!matchPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        email: existingUser.email,
        id: existingUser._id,
        usertype: existingUser.usertype,
      },
      SECRET,
      { expiresIn: "30d" }
    );

    // Send back the user details and token
    res.status(200).json({ user: existingUser, token });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ message: "Signin failed", error: error.message });
  }
};

const TWILIO_ACCOUNT_SID = "AC35d86e0d9c60d2eb91c76053c7c863e1";
const TWILIO_AUTH_TOKEN = "ee3d620954c9e24f4388300475d433e7";

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export const signupPatient = async (req, res) => {
  const { name, age, gender, address, email, password, phoneNumber } = req.body;

  try {
    const existingUser = await NonPatient.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newPatient = new NonPatient({
      name,
      age,
      gender,
      address,
      email,
      phoneNumber,
      password: hashedPassword,
    });
    await newPatient.save();

    // Send OTP using Twilio SMS API
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes from now
    const messageBody = `Your verification code is: ${otp}`;

    const msgOptions = {
      from: +14152149378,
      to: phoneNumber,
      body: messageBody,
    };
    await client.messages.create(msgOptions);

    // Save OTP with expiration
    newPatient.otp = { code: otp, expiresAt };
    await newPatient.save();

    res.status(201).json({
      message: "Patient registration successful. OTP sent for verification.",
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res
      .status(500)
      .json({ message: "Error during registration", error: error.message });
  }
};

export const signinPatient = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    const patient = await NonPatient.findOne({ phoneNumber });
    if (!patient) {
      return res.status(400).json({ message: "Phone number not registered" });
    }

    // Send OTP using Twilio SMS API
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes from now
    const messageBody = `Your verification code is: ${otp}`;

    const msgOptions = {
      from: "+14152149378",
      to: phoneNumber,
      body: messageBody,
    };
    await client.messages.create(msgOptions);

    // Save OTP with expiration
    patient.otp = { code: otp, expiresAt };
    await patient.save();

    res.status(200).json({ message: "OTP sent to phone number" });
  } catch (error) {
    console.error("Error during sign-in:", error);
    res
      .status(500)
      .json({ message: "Error during sign-in", error: error.message });
  }
};
export const verifyOTP = async (req, res) => {
  const { phoneNumber, otp } = req.body;
  console.log("Request Body:", req.body); // Log the entire request body

  try {
    // Retrieve the patient using the phone number
    const patient = await NonPatient.findOne({ phoneNumber });

    // Check if the patient was found
    if (!patient) {
      return res.status(400).json({ message: "Phone number not registered" });
    }

    // Log the stored OTP if patient exists
    console.log("Stored OTP:", patient.otp ? patient.otp.code : "No OTP found");

    // Validate OTP
    if (!patient.otp || patient.otp.code !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if OTP has expired
    if (new Date() > patient.otp.expiresAt) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: patient._id, usertype: "patient" }, SECRET, {
      expiresIn: "30d",
    });

    // Clear the OTP after successful verification
    patient.otp = null;
    await patient.save();

    res.status(200).json({ message: "Signin successful", token });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res
      .status(500)
      .json({ message: "Error during OTP verification", error: error.message });
  }
};
