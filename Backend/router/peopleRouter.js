import express from 'express';
import mongoose from 'mongoose';
import LawyerProfile from '../module/lawyer.module.js';
import CommonUser from '../module/commonUser.module.js';
import Case from '../module/case.module.js';
import verifyToken from '../middleware/authMiddleware.js';

const router = express.Router();

// Test route
router.get('/', (req, res) => {
    res.send('Lawyer Router is working');
});

// Filter lawyers based on specialization, location, experience_years
router.post('/filter', async (req, res) => {
    try {
        const { specialization, location, experience_years } = req.body;

        const filteredLawyers = await LawyerProfile.find({
            ...(specialization && { specialization: { $regex: specialization, $options: 'i' } }),
            ...(location && { location: { $regex: location, $options: 'i' } }),
            ...(experience_years && { experience_years: { $gte: experience_years } }),
            approved_status: 'approved'
        })
        .populate('user_id', 'name email phone')
        .select('specialization experience_years location availability ratings bar_council_id approved_status');

        // ==========================================
        // Add case counts for each lawyer
        // ==========================================
        const result = await Promise.all(
            filteredLawyers.map(async (lawyer) => {
                const lawyerId = lawyer._id;

                // Count each type of case
                const ongoingCount = await Case.countDocuments({
                    lawyer_id: lawyerId,
                    status: 'ongoing'
                });

                const completedCount = await Case.countDocuments({
                    lawyer_id: lawyerId,
                    status: 'completed'
                });

                const closedCount = await Case.countDocuments({
                    lawyer_id: lawyerId,
                    status: 'closed'
                });

                return {
                    ...lawyer.toObject(),
                    ongoingCount,
                    completedCount,
                    closedCount
                };
            })
        );

        // ==========================================
        res.status(200).json({
            success: true,
            lawyers: result
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
});


// 2️⃣ Client sends request to lawyer
router.post("/request", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'common') {
      return res.status(403).json({ success: false, message: "Only clients can send requests" });
    }

    const { lawyer_id } = req.body;
    if (!lawyer_id) {
      return res.status(400).json({ success: false, message: "Lawyer ID is required" });
    }

    const lawyer = await LawyerProfile.findById(lawyer_id);
    if (!lawyer) return res.status(404).json({ success: false, message: "Lawyer not found" });

    const client = await CommonUser.findById(req.user.id).populate('user_id', 'name');
    if (!client) return res.status(404).json({ success: false, message: "Client not found" });

    // Check for duplicate request
    const alreadyRequested = lawyer.requests.some(
      (r) => r.client_id.toString() === client._id.toString()
    );
    if (alreadyRequested) return res.status(400).json({ success: false, message: "Request already sent" });

    // Add request entry
    lawyer.requests.push({
      client_id: client._id,
      client_name: client.user_id.name,
    });

    await lawyer.save();

    res.json({ success: true, message: "Request sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all cases for the logged-in client (from CommonUser.cases array)
router.get('/my-cases', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'common') 
            return res.status(403).json({ message: "Access denied" });

        // Get the client
        const client = await CommonUser.findById(req.user.id)
            .populate({
                path: 'cases.lawyer_id',
                select: '_id user_id specialization location experience_years',
                populate: { path: 'user_id', select: 'name' }
            })
            .populate('cases.case_id');

            if (client && client.cases?.length) {
            // Sort cases by last_updated descending
            client.cases.sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated));
            }

        if (!client) 
            return res.status(404).json({ success: false, message: "Client not found" });

        // Format the cases
        const formattedCases = client.cases.map(c => ({
            _id: c.case_id?._id,
            title: c.case_id?.title || "",
            description: c.case_id?.description || "",
            legal_category: c.case_id?.legal_category || "",
            status: c.status || "ongoing",
            process_updates: c.case_id?.process_updates || [],
            lawyer_id: c.lawyer_id?._id,
            lawyer_name: c.lawyer_id?.user_id?.name || "Unknown",
            specialization: c.lawyer_id?.specialization || "",
            location: c.lawyer_id?.location || "",
            experience_years: c.lawyer_id?.experience_years || 0,
            last_updated: c.last_updated
        }));
        res.status(200).json({ success: true, cases: formattedCases });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
});


// 4️⃣ Get case details along with client info
router.get('/:case_id/clients', async (req, res) => {
    try {
        const { case_id } = req.params;
        const caseData = await Case.findById(case_id)
            .populate('client_id', 'name email phone');

        if (!caseData) return res.status(404).json({ success: false, message: "Case not found" });

        res.status(200).json({ success: true, caseData });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
});

export default router;
