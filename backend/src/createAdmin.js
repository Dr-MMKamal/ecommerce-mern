require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

const createAdmin = async () => {
  const name = process.env.ADMIN_NAME || 'Administrator';
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password || password.length < 12) {
    throw new Error('Set ADMIN_EMAIL and an ADMIN_PASSWORD with at least 12 characters.');
  }

  await connectDB();
  try {
    const existingUser = await User.findOne({ email }).select('_id role');
    if (existingUser) {
      throw new Error('That email already belongs to an account. No account was changed.');
    }

    await User.create({ name, email, password, role: 'admin' });
    console.log(`Admin account created for ${email}.`);
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin().catch((error) => {
  console.error(`Could not create admin: ${error.message}`);
  process.exitCode = 1;
});
