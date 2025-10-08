import express from 'express';
import Case from '../module/case.module.js';
import CommonUser from '../module/commonUser.module.js';
import LawyerProfile from '../module/lawyer.module.js';
import verifyToken from '../middleware/authMiddleware.js';
import mongoose from 'mongoose';

const router = express.Router();

// 2️⃣ Accept a client request and create a case
router.post('/requests/:client_id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'lawyer') {
      return res.status(403).json({ success: false, message: 'Only lawyers can accept requests' });
    }

    const { client_id } = req.params;
    const { title, description, legal_category } = req.body;

    if (!title || !description || !legal_category) {
      return res.status(400).json({ success: false, message: 'Title, description, and legal_category are required' });
    }

    const lawyer = await LawyerProfile.findById(req.user.id);
    if (!lawyer) return res.status(404).json({ success: false, message: 'Lawyer not found' });

    const client = await CommonUser.findById(client_id);
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    console.log("client and lawyer found");
    const requestIndex = lawyer.requests.findIndex(r => r.client_id === client._id);
    if (!requestIndex) return res.status(400).json({ success: false, message: 'Request not found' });
    console.log("request found");
    // Remove request
    lawyer.requests.splice(requestIndex, 1);
    await lawyer.save();

    // Create case
    const newCase = new Case({
      title,
      description,
      legal_category,
      client_id: client._id,
      lawyer_id: lawyer._id,
      status: 'ongoing',
      process_updates: [{ update_text: 'Case created', updated_by: lawyer._id, timestamp: new Date() }]
    });

    const savedCase = await newCase.save();

    // Update client and lawyer
    client.cases.push({ case_id: savedCase._id, lawyer_id: lawyer._id, status: 'ongoing', last_updated: new Date() });
    await client.save();

    lawyer.cases.push({ case_id: savedCase._id, client_id: client._id, status: 'ongoing', last_update: new Date() });
    await lawyer.save();

    res.status(201).json({ success: true, message: 'Request accepted and case created', case: savedCase });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

export default router;
