import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    const existing = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (existing) {
      console.log('✅ Admin already exists:', process.env.ADMIN_EMAIL);
      return process.exit(0);
    }

    await User.create({
      name:     process.env.ADMIN_NAME     || 'Super Admin',
      email:    process.env.ADMIN_EMAIL    || 'admin@college.edu',
      mobile:   process.env.ADMIN_MOBILE   || '9999999999',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role:     'admin',
    });

    console.log('✅ Admin created:', process.env.ADMIN_EMAIL);
    console.log('   Password:', process.env.ADMIN_PASSWORD, '← change this!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seedAdmin();
