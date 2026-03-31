const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const dbName = 'dashboard';

async function createAdmin() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const users = db.collection('users');
    
    // Check if admin already exists
    const existingAdmin = await users.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }
    
    // Create admin user
    const adminUser = {
      name: 'Admin User',
      email: 'admin@example.com',
      password: '$2a$10$XFDJ5Bq3Lz0J3U4J5v8H9u9X5z1a9X5z1a9X5z1a9X5z1a9X5z1a9X5z1a', // hashed 'admin123'
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await users.insertOne(adminUser);
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

createAdmin();
