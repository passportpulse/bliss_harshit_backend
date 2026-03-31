console.log('Starting MongoDB connection check...');

// Load environment variables
const path = require('path');
const dotenv = require('dotenv');

// Load .env file from project root
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI;

console.log('Environment variables loaded:', {
  MONGODB_URI: MONGODB_URI ? '***MONGODB_URI is set***' : 'MONGODB_URI is not set',
  NODE_ENV: process.env.NODE_ENV || 'not set'
});

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI is not defined in environment variables');
  console.log('Current working directory:', process.cwd());
  console.log('Environment file path:', path.join(__dirname, '../.env'));
  process.exit(1);
}

console.log('Connecting to MongoDB...');
console.log('Connection string:', MONGODB_URI.replace(/:([^:]*?)@/, ':***@'));

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Successfully connected to MongoDB');
  
    // Try to find the admin user
  console.log('\nChecking for admin user...');
  
  // Dynamically import the User model
  const User = (await import('../src/models/User.js')).default;
  
  // Check if the User model has the findOne method
  if (!User || typeof User.findOne !== 'function') {
    console.error('❌ Error: User model does not have findOne method');
    console.log('User model:', User);
    process.exit(1);
  }
  
  const admin = await User.findOne({ email: 'admin@example.com' });
  
  if (admin) {
    console.log('✅ Admin user found:');
    console.log({
      id: admin._id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      createdAt: admin.createdAt
    });
  } else {
    console.log('❌ Admin user not found');
  }
  
  process.exit(0);
})
.catch(error => {
  console.error('❌ Error connecting to MongoDB:', error.message);
  console.error('Error details:', error);
  process.exit(1);
});
