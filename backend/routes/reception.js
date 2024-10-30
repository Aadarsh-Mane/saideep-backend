import express from "express";
import { addPatient } from "../controllers/admin/receiptionController.js";

const receiptionRouter = express.Router();

receiptionRouter.post("/addPatient", addPatient);

// userRouter.get("/profile", auth, getUserProfile);
// userRouter.patch("/edit-profile", auth, upload.single("image"), editProfile);

export default receiptionRouter;
