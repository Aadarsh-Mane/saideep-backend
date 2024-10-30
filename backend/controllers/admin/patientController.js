import Appointment from "../../models/bookAppointmentSchema.js";

export const createNonPatientAppointment = async (req, res) => {
  const { name, contact, date, reason } = req.body;

  try {
    // Create a new appointment for a non-registered individual
    const appointment = new Appointment({
      name,
      contact,
      date: new Date(date),
      reason,
      status: "Pending", // Initially set to pending
    });

    await appointment.save();

    res.status(201).json({
      message: `Appointment booked successfully for ${name}`,
      appointmentDetails: appointment,
    });
  } catch (error) {
    console.error("Error booking non-patient appointment:", error);
    res
      .status(500)
      .json({ message: "Error booking appointment", error: error.message });
  }
};
