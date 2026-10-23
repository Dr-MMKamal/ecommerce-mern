const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { sendTokenResponse, cookieOptions } = require('../utils/generateToken');

// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }
  if (await User.findOne({ email })) {
    res.status(400);
    throw new Error('User already exists with this email');
  }
  // role is never taken from the request body -> no privilege escalation
  const user = await User.create({ name, email, password });
  sendTokenResponse(user, 201, res);
});

// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  if (!user.isActive) {
    res.status(403);
    throw new Error('Your account has been deactivated');
  }
  sendTokenResponse(user, 200, res);
});

// @route POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', { ...cookieOptions(), maxAge: 0, expires: new Date(0) });
  res.json({ message: 'Logged out successfully' });
});

// @route GET /api/auth/me  (used to restore the session on page refresh)
const getMe = asyncHandler(async (req, res) => {
  const { _id, name, email, role } = req.user;
  res.json({ _id, name, email, role });
});

module.exports = { register, login, logout, getMe };
