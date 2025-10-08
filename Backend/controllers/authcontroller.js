import User from '../module/user.module.js';
import mongoose from 'mongoose';
import LawyerProfile from '../module/lawyer.module.js';
import CommonUser from '../module/commonUser.module.js';
import jwt from 'jsonwebtoken';

// =============================
// REGISTER
// =============================
export const registerUser = async (req, res) => {
    try {
        const { 
            name, email, password, role, phone,
            specialization, experience_years, location,
            bar_council_id, bar_council_state, ratings
        } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        // Create base user
        const user = new User({
            name, email, password_hash: password, role, phone
        });
        await user.save();

        let profile;
        let roleId;

        // Create role-based profile
        if (role === 'lawyer') {
            profile = new LawyerProfile({
                user_id: user._id,
                specialization,
                experience_years,
                location,
                bar_council_id,
                bar_council_state,
                ratings: ratings || 0,
            });
            await profile.save();
            roleId = profile._id;
        } 
        else if (role === 'common') {
            profile = new CommonUser({
                user_id: user._id,
                location: location || 'Not specified',
            });
            await profile.save();
            roleId = profile._id;
        }

        // Generate token with role-based ID
        const token = jwt.sign(
            { id: roleId, userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'secretkey',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: `${role} registered successfully`,
            user,
            profile,
            token
        });

    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

// =============================
// LOGIN
// =============================
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.password_hash !== password)
            return res.status(401).json({ message: 'Invalid credentials' });
        console.log("user logged in ",user._id);
        let profile;
        let roleId;

        if (user.role === 'common') {
            const profile = await CommonUser.findOne({
                $or: [
                { user_id: user._id },                  // ObjectId
                { user_id: user._id.toString() }        // legacy string
                ]
            });
            if (!profile) return res.status(404).json({ message: 'Common user profile not found' });
            roleId = profile._id;
        } else if (user.role === 'lawyer') {
            const profile = await LawyerProfile.findOne({
                $or: [
                { user_id: user._id },
                { user_id: user._id.toString() }
                ]
            });
        if (!profile) return res.status(404).json({ message: 'Lawyer profile not found' });
        roleId = profile._id;
        } else {
            roleId = user._id; // student/admin
        }

        const token = jwt.sign(
            { id: roleId, userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'secretkey',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};
