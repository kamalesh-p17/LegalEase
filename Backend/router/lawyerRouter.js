import express from 'express';
import LawyerProfile from '../module/lawyer.module.js';
import Case from '../module/case.module.js';
import verifyToken from '../middleware/authMiddleware.js';
import CommonUser from '../module/commonUser.module.js';

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
// ➕ Add a process update to a specific case
router.post('/:caseId/process_update', verifyToken, async (req, res) => {
  try {
    const { caseId } = req.params;
    const { updateText } = req.body;

    if (!updateText) {
      return res.status(400).json({ success: false, message: "updateText is required" });
    }

    // Verify role
    if (req.user.role !== 'lawyer') {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const lawyer_Id = req.user.id; // ✅ from token

    // Find the case belonging to this lawyer
    const caseData = await Case.findOne({ _id: caseId, lawyer_id: lawyer_Id });
    if (!caseData) {
      return res.status(404).json({ success: false, message: "Case not found for this lawyer" });
    }

    // Push process update
    caseData.process_updates.push({
      update_text: updateText,
      updated_by: lawyer_Id,
      timestamp: new Date(),
    });

    await caseData.save();

    res.status(200).json({
      success: true,
      message: "Process update added successfully",
      data: caseData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
});

// 🧾 Get all cases for the logged-in lawyer
router.get('/my-cases', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'lawyer') {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const lawyerId = req.user.id; // ✅ LawyerProfile ID from token

    const cases = await Case.find({ lawyer_id: lawyerId })
      .populate({
        path: 'client_id',
        populate: { path: 'user_id', select: 'name email phone' },
        select: 'user_id location'
      })
      .sort({ created_at: -1})
      .select('title description legal_category status process_updates created_at updated_at');

    if (!cases.length) {
      return res.status(200).json({ success: true, cases: [], message: "No cases found" });
    }

    const formattedCases = cases.map(c => ({
      _id: c._id,
      title: c.title,
      description: c.description,
      legal_category: c.legal_category,
      status: c.status,
      process_updates: c.process_updates,
      client_name: c.client_id?.user_id?.name || "Unknown",
      client_email: c.client_id?.user_id?.email || "",
      client_phone: c.client_id?.user_id?.phone || "",
      location: c.client_id?.location || "",
      created_at: c.created_at,
      updated_at: c.updated_at
    }));
    res.status(200).json({ success: true, cases: formattedCases });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
});


// 🧾 Get a specific case details along with client info
router.get("/:case_id/clients", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "lawyer") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { case_id } = req.params;

    // Find case and populate client info
    const caseData = await Case.findById(case_id)
      .populate({
        path: "client_id",
        populate: { path: "user_id", select: "name email phone" },
        select: "user_id location",
      })
      .populate({
        path: "lawyer_id",
        populate: { path: "user_id", select: "name email" },
        select: "user_id specialization location experience_years",
      });

    if (!caseData)
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });

    // Format the data for clarity
    const formattedCase = {
      _id: caseData._id,
      title: caseData.title,
      description: caseData.description,
      legal_category: caseData.legal_category,
      status: caseData.status,
      process_updates: caseData.process_updates,
      created_at: caseData.created_at,
      updated_at: caseData.updated_at,
      client: {
        name: caseData.client_id?.user_id?.name || "Unknown",
        email: caseData.client_id?.user_id?.email || "",
        phone: caseData.client_id?.user_id?.phone || "",
        location: caseData.client_id?.location || "",
      },
      lawyer: {
        name: caseData.lawyer_id?.user_id?.name || "",
        email: caseData.lawyer_id?.user_id?.email || "",
        specialization: caseData.lawyer_id?.specialization || "",
        experience_years: caseData.lawyer_id?.experience_years || 0,
      },
    };

    res.status(200).json({ success: true, caseData: formattedCase });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

router.post("/process_status_update", verifyToken, async (req, res) => {
    try {
        const { case_id, new_status } = req.body;

        if (!case_id || !new_status) {
            return res.status(400).json({
                success: false,
                message: "case_id and new_status are required",
            });
        }

        const allowed = ["ongoing", "completed", "closed"];
        if (!allowed.includes(new_status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value",
            });
        }

        // FETCH CASE
        const caseObj = await Case.findById(case_id);
        if (!caseObj) {
            return res.status(404).json({
                success: false,
                message: "Case not found",
            });
        }

        // AUTH VERIFY
        if (req.user.role !== "lawyer" || req.user.id != caseObj.lawyer_id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: Lawyer does not own this case",
            });
        }

        const oldStatus = caseObj.status;

        // UPDATE CASE MODEL
        caseObj.status = new_status;
        caseObj.last_updated = new Date();
        await caseObj.save();

        // UPDATE IN COMMON USER
        await CommonUser.updateOne(
            { "cases.case_id": caseObj._id },
            {
                $set: {
                    "cases.$.status": new_status,
                    "cases.$.last_updated": new Date(),
                }
            }
        );

        // UPDATE IN LAWYER PROFILE
        await LawyerProfile.updateOne(
            { _id: req.user.id, "cases.case_id": caseObj._id },
            {
                $set: {
                    "cases.$.status": new_status,
                    "cases.$.last_updated": new Date(),
                }
            }
        );

        const updatedCase = await Case.findById(case_id);

        return res.status(200).json({
            success: true,
            message: "Case status updated successfully",
            old_status: oldStatus,
            updated_status: new_status,
            updated_case: updatedCase,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});


export default router;