require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/E-commerce';

async function createDashboardAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Define User schema inline
    const UserSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true, lowercase: true },
      password: { type: String, required: true, select: false },
      role: { type: String, enum: ['ADMIN', 'CUSTOMER'], default: 'CUSTOMER' },
    }, {
      timestamps: true
    });

    // Get or create model
    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });

    if (existingAdmin) {
      console.log('⚠️  Dashboard admin user already exists');
      console.log('📧 Email: admin@example.com');
      console.log('👤 Role:', existingAdmin.role);

      // Update to ADMIN role if needed
      if (existingAdmin.role !== 'ADMIN') {
        existingAdmin.role = 'ADMIN';
        await existingAdmin.save();
        console.log('✅ Updated user role to ADMIN');
      }

      await mongoose.disconnect();
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create dashboard admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN'
    });

    console.log('✅ Dashboard admin user created successfully!');
    console.log('');
    console.log('Login Credentials:');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: ADMIN');
    console.log('');
    console.log('You can now login to the dashboard at /signin');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating dashboard admin user:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Execute the function
createDashboardAdmin();
