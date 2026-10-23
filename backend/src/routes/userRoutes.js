const router = require('express').Router();
const { updateProfile, getUsers, updateUser, deleteUser } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.put('/profile', protect, updateProfile);
router.get('/', protect, admin, getUsers);
router.route('/:id').put(protect, admin, updateUser).delete(protect, admin, deleteUser);

module.exports = router;
