require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/E-commerce';

async function createEcomAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Define EcomUser schema inline (to avoid import issues)
    const EcomUserSchema = new mongoose.Schema({
      firstName: { type: String, required: false },
      lastName: { type: String, required: false },
      email: { type: String, required: true, unique: true, lowercase: true },
      phone: { type: String, required: true, unique: true },
      password: { type: String, required: true, select: false },
      role: { type: String, enum: ['user', 'admin'], default: 'user' },
      isActive: { type: Boolean, default: true },
    }, {
      timestamps: true,
      strict: false
    });

    // Hash password before saving
    const bcrypt = require('bcryptjs');
    EcomUserSchema.pre('save', async function (next) {
      if (!this.isModified('password')) return next();

      try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
      } catch (error) {
        next(error);
      }
    });

    // Get or create model
    const EcomUser = mongoose.models.EcomUser || mongoose.model('EcomUser', EcomUserSchema);

    // Check if admin already exists
    const existingAdmin = await EcomUser.findOne({ email: 'admin@example.com' });

    if (existingAdmin) {
      console.log('⚠️  E-commerce admin user already exists');
      console.log('📧 Email: admin@example.com');
      console.log('👤 Role:', existingAdmin.role);

      // Update to admin role if needed
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Updated user role to admin');
      }

      await mongoose.disconnect();
      process.exit(0);
    }

    // Create e-commerce admin user
    const admin = await EcomUser.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      phone: '+919999999999',
      password: 'admin123',
      role: 'admin',
      isActive: true
    });

    console.log('✅ E-commerce admin user created successfully!');
    console.log('');
    console.log('Login Credentials:');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: admin');
    console.log('');
    console.log('You can now login to the e-commerce admin dashboard!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating e-commerce admin user:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Execute the function
createEcomAdmin();
