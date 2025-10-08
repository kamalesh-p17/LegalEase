import jwt from 'jsonwebtoken';
import User from '../module/user.module.js';
import CommonUser from '../module/commonUser.module.js';
import LawyerProfile from '../module/lawyer.module.js';

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
        // decoded = { id: roleId, role, user_id (optional) }

        // Check if the role is valid
        if (!['common', 'lawyer', 'student', 'admin'].includes(decoded.role)) {
            return res.status(401).json({ message: 'Invalid role in token' });
        }

        let profileExists = null;

        // Verify if the profile exists in the database according to the role
        if (decoded.role === 'common') {
            profileExists = await CommonUser.findById(decoded.id);
        } else if (decoded.role === 'lawyer') {
            profileExists = await LawyerProfile.findById(decoded.id);
        } else if (decoded.role === 'student' || decoded.role === 'admin') {
            profileExists = await User.findById(decoded.id);
        }

        if (!profileExists) {
            return res.status(401).json({ message: 'User/Profile not found' });
        }

        // Attach verified info to request
        req.user = {
            id: decoded.id,       // role-specific _id
            role: decoded.role,
            user_id: decoded.user_id || null // optional
        };
        
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
    }
};

export default verifyToken;
