import express from 'express';
import { registerUser, loginUser } from '../controllers/authcontroller.js';

const router = express.Router();

// =============================
// Routes
// =============================

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

export default router;
