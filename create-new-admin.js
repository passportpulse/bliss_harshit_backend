require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Use local MongoDB 
const MONGODB_URI = 'mongodb://localhost:27017/bliss';

async function createNewAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Define User schema (matching the TypeScript model)
    const UserSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      name: { type: String },
      role: { type: String, enum: ['ADMIN', 'USER'], default: 'USER' },
    }, { timestamps: true });

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Create new admin user with different email
    const email = 'superadmin@bliss.com';
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', email);
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin@123', 10);

    // Create admin user
    const admin = await User.create({
      name: 'Super Admin',
      email: email,
      password: hashedPassword,
      role: 'ADMIN'
    });

    console.log('✅ New admin user created successfully!');
    console.log('');
    console.log('Login Credentials:');
    console.log('📧 Email:', email);
    console.log('🔑 Password: admin@123');
    console.log('👤 Role: ADMIN');
    console.log('');
    console.log('You can now login to the admin panel');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createNewAdmin();
