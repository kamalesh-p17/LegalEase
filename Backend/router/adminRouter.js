import express from 'express';
import Case from '../module/case.module.js';
import CommonUser from '../module/commonUser.module.js';
import LawyerProfile from '../module/lawyer.module.js';
import verifyToken from '../middleware/authMiddleware.js';
import mongoose from 'mongoose';

const router = express.Router();

router.get("/lawyers_pending", async (req, res) => {
  try {
    console.log("loading");
    const pendingLawyers = await LawyerProfile.find({ approved_status: "pending" })
      .populate("user_id", "name email phone")
      .select("specialization location experience_years approved_status bar_council_state");

    res.status(200).json({
      success: true,
      lawyers: pendingLawyers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
});

router.put("/:lawyerId/status", async (req, res) => {
  try {
    const { lawyerId } = req.params;
    const { status } = req.body; // approved or rejected

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Use 'approved' or 'rejected'."
      });
    }

    const updatedLawyer = await LawyerProfile.findByIdAndUpdate(
      lawyerId,
      { approved_status: status },
      { new: true }
    );

    if (!updatedLawyer) {
      return res.status(404).json({
        success: false,
        message: "Lawyer not found"
      });
    }

    res.status(200).json({
      success: true,
      message: `Lawyer ${status} successfully`,
      lawyer: updatedLawyer
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
});

export default router;