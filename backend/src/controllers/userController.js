const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// @route PUT /api/users/profile  (private)
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  if (req.body.password) {
    if (req.body.password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }
    user.password = req.body.password;
  }
  const updated = await user.save();
  res.json({ _id: updated._id, name: updated.name, email: updated.email, role: updated.role });
});

// ---------- Admin ----------

// @route GET /api/users  (admin)
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).sort('-createdAt');
  res.json(users);
});

// @route PUT /api/users/:id  (admin) - change role / active status
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (String(user._id) === String(req.user._id)) {
    res.status(400);
    throw new Error('You cannot modify your own role or status');
  }
  if (req.body.role) user.role = req.body.role;
  if (typeof req.body.isActive === 'boolean') user.isActive = req.body.isActive;
  await user.save();
  res.json(user);
});

// @route DELETE /api/users/:id  (admin)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (String(user._id) === String(req.user._id)) {
    res.status(400);
    throw new Error('You cannot delete your own account');
  }
  await user.deleteOne();
  res.json({ message: 'User removed' });
});

module.exports = { updateProfile, getUsers, updateUser, deleteUser };
