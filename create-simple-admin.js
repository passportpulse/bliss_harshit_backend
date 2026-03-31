require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Use local MongoDB 
const MONGODB_URI = 'mongodb://localhost:27017/bliss';

async function createAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('URI:', MONGODB_URI.replace(/:([^:]*?)@/, ':***@'));
    
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

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@bliss.com' });

    if (existingAdmin) {
      console.log('✅ Admin user already exists:');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Role:', existingAdmin.role);
      console.log('👤 Name:', existingAdmin.name);
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const admin = await User.create({
      name: 'Bliss Admin',
      email: 'admin@bliss.com',
      password: hashedPassword,
      role: 'ADMIN'
    });

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('Login Credentials:');
    console.log('📧 Email: admin@bliss.com');
    console.log('🔑 Password: admin123');
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

createAdmin();
