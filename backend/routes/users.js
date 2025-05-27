const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
    getUserProfile,
    updateUserProfile,
    updatePassword,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    uploadAvatar,
    getUserEvents,
    getLikedEvents,
} = require('../controllers/userController');

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/update-password', protect, updatePassword);

router.get('/', protect, authorizeRoles('admin'), getAllUsers);
router.get('/:id', protect, authorizeRoles('admin'), getUserById);
router.put('/:id', protect, authorizeRoles('admin'), updateUser);
router.delete('/:id', protect, authorizeRoles('admin'), deleteUser);

router.post('/upload-avatar', protect, uploadAvatar);

router.get('/:userId/events', protect, getUserEvents);
router.get('/:userId/liked-events', protect, getLikedEvents);

module.exports = router;