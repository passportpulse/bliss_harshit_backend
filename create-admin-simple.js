require('dotenv').config();
const mongoose = require('mongoose');

// Define User schema directly
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  role: { type: String, enum: ['ADMIN', 'USER'], default: 'USER' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@bliss.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Hash the password
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user
    const admin = new User({
      name: 'Bliss Admin',
      email: 'admin@bliss.com',
      password: hashedPassword,
      role: 'ADMIN'
    });

    await admin.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@bliss.com');
    console.log('🔑 Password: admin123');
    console.log('🌐 Login URL: http://localhost:3000/dashboard');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Execute the function
createAdminUser();
