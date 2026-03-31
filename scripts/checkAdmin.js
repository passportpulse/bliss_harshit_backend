// Simple script to check admin user directly using MongoDB
require('dotenv').config({ path: './.env' });
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

async function checkAdmin() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const users = db.collection('users');
    
    console.log('🔍 Checking for admin user...');
    const admin = await users.findOne({ email: 'admin@example.com' });
    
    if (admin) {
      console.log('✅ Admin user found:');
      console.log({
        _id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        createdAt: admin.createdAt
      });
    } else {
      console.log('❌ Admin user not found');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkAdmin();
