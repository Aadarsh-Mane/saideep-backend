import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Doctor from "../models/doctorSchema.js";
import hospitalDoctors from "../models/hospitalDoctorSchema.js";

const SECRET = "DOCTOR";

export const signup = async (req, res) => {
  const { email, password, usertype, doctorName } = req.body;

  try {
    // Check if doctor exists in the database by name and type
    const doctor = await Doctor.findOne({ name: doctorName, type: usertype });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found in system." });
    }

    // Check if user with the provided email already exists
    const existingUser = await hospitalDoctors.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Hash the password and create the user
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await hospitalDoctors.create({
      email,
      password: hashedPassword,
      usertype,
      doctorName: doctor.name, // Link to doctor by name
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
export const signin = async (req, res) => {
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
