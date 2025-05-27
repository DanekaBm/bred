const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Event = require('../models/Event');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const getUserProfile = asyncHandler(async (req, res) => {
    res.json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
    });
});

const updateUserProfile = asyncHandler(async (req, res) => {
    const { name, email } = req.body;

    const user = await User.findById(req.user._id);

    if (user) {
        user.name = name || user.name;
        user.email = email || user.email;

        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists && emailExists._id.toString() !== user._id.toString()) {
                res.status(400);
                // Изменено на ключ перевода
                throw new Error('email_already_exists_key');
            }
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
            // Изменено на ключ перевода
            message: 'Profile updated successfully'
        });
    } else {
        res.status(404);
        // Изменено на ключ перевода
        throw new Error('user_not_found_key');
    }
});

const updatePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
        res.status(404);
        // Изменено на ключ перевода
        throw new Error('user_not_found_key');
    }

    if (!(await user.matchPassword(oldPassword))) {
        res.status(401);
        // Изменено на ключ перевода
        throw new Error('old_password_incorrect_key');
    }

    user.password = newPassword;
    await user.save();

    // Изменено на ключ перевода
    res.json({ message: 'password_updated_success_key' });
});

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('_id name email role avatar');
    res.json(users);
});

const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        // Изменено на ключ перевода
        throw new Error('user_not_found_key');
    }
});

const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
            // Изменено на ключ перевода
            message: 'user_updated_success_key' // Добавил новый ключ для этого сообщения
        });
    } else {
        res.status(404);
        // Изменено на ключ перевода
        throw new Error('user_not_found_key');
    }
});

const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (req.user._id.toString() === user._id.toString()) {
            res.status(400);
            // Изменено на ключ перевода
            throw new Error('cannot_delete_own_account_key');
        }

        if (user.avatar) {
            const avatarPath = path.join(__dirname, '..', 'uploads', 'avatars', path.basename(user.avatar));
            if (fs.existsSync(avatarPath)) {
                fs.unlinkSync(avatarPath);
                console.log(`Old avatar ${avatarPath} deleted.`);
            }
        }

        await user.deleteOne();
        // Изменено на ключ перевода
        res.json({ message: 'user_deleted_success_key' });
    } else {
        res.status(404);
        // Изменено на ключ перевода
        throw new Error('user_not_found_key');
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '..', 'uploads', 'avatars');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, req.user._id + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        // Изменено на ключ перевода
        cb(new Error('only_images_allowed_key'));
    }
}).single('avatar');

const uploadAvatar = asyncHandler(async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                // Изменено на ключ перевода, используя общий ключ для Multer ошибок
                return res.status(400).json({ message: 'upload_error_key', details: err.message });
            }
            // Если ошибка не от Multer, но тоже передана как сообщение
            return res.status(400).json({ message: err.message }); // Возможно, тут тоже нужен ключ
        }
        if (!req.file) {
            // Изменено на ключ перевода
            return res.status(400).json({ message: 'no_file_selected_key' });
        }

        try {
            const user = await User.findById(req.user._id);
            if (!user) {
                // Изменено на ключ перевода
                return res.status(404).json({ message: 'user_not_found_key' });
            }

            if (user.avatar) {
                const oldAvatarFilename = path.basename(user.avatar);
                const oldAvatarPath = path.join(__dirname, '..', 'uploads', 'avatars', oldAvatarFilename);
                if (fs.existsSync(oldAvatarPath)) {
                    fs.unlinkSync(oldAvatarPath);
                    console.log(`Old avatar ${oldAvatarPath} deleted.`);
                }
            }

            const backendBaseUrl = `http://localhost:${process.env.PORT || 5001}`;
            user.avatar = `${backendBaseUrl}/uploads/avatars/${req.file.filename}`;

            await user.save();

            res.status(200).json({
                // Изменено на ключ перевода
                message: 'avatar_upload_success_key',
                avatarUrl: user.avatar
            });

        } catch (error) {
            console.error(error);
            // Изменено на ключ перевода
            res.status(500).json({ message: 'server_error_avatar_upload_key' });
        }
    });
});

const getUserEvents = asyncHandler(async (req, res) => {
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
        res.status(403);
        // Изменено на ключ перевода
        throw new Error('not_authorized_to_view_events_key');
    }
    const userEvents = await Event.find({ createdBy: req.params.userId }).populate('createdBy', 'name email');
    res.json(userEvents);
});

const getLikedEvents = asyncHandler(async (req, res) => {
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
        res.status(403);
        // Изменено на ключ перевода
        throw new Error('not_authorized_to_view_liked_events_key');
    }

    const likedEvents = await Event.find({ likes: req.params.userId }).populate('createdBy', 'name email');
    res.json(likedEvents);
});

module.exports = {
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
};