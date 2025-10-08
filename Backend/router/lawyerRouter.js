import express from 'express';
import LawyerProfile from '../module/lawyer.module.js';
import Case from '../module/case.module.js';
import verifyToken from '../middleware/authMiddleware.js';

const router = express.Router();


router.get('/', (req, res) => {
    res.send('Lawyer Router is working');
});

// 📝 Get all pending client requests for the logged-in lawyer
router.get("/requests", verifyToken, async (req, res) => {
  try {
    // Only lawyers can access this
    if (req.user.role !== "lawyer") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // req.user.id contains the lawyer's _id
    const lawyerId = req.user.id;

    const lawyer = await LawyerProfile.findById(lawyerId).select("requests");

    if (!lawyer) {
      return res.status(404).json({ success: false, message: "Lawyer not found" });
    }

    // Send requests array
    res.status(200).json({
      success: true,
      requests: lawyer.requests || [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

router.post('/process_update', async(req, res) => {
    try {
        const { caseId, updateText, lawyer_Id } = req.body;
        if (!caseId || !updateText || !lawyer_Id) {
            return res.status(400).json({ success: false, message: 'caseId, updateText and lawyer_Id are required' });
        }

        const caseData = await Case.findOne({_id : caseId,lawyer_id : lawyer_Id});
        if (!caseData) {
            return res.status(404).json({ success: false, message: 'Case not found' });
        }

        caseData.process_updates.push({
            update_text: updateText,
            updated_by: lawyer_Id,
            timestamp: new Date(),
        });

        await caseData.save();

        res.status(200).json({ 
            success: true, 
            message: 'Process update added successfully', 
            data: caseData 
        });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Server Error', 
                error: error.message 
        });
        }
});

export default router;