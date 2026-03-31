require('dotenv').config({ path: './.env' });
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

async function updateAdminPassword() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const users = db.collection('users');
    
    // Find admin user
    console.log(`🔍 Checking admin user: ${ADMIN_EMAIL}`);
    const admin = await users.findOne({ email: ADMIN_EMAIL });
    
    if (!admin) {
      console.log('❌ Admin user not found, creating one...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
      
      await users.insertOne({
        name: 'Admin User',
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Admin user created with password:', ADMIN_PASSWORD);
    } else {
      console.log('✅ Admin user found, checking password...');
      
      // Check if password needs to be updated
      const isPasswordValid = await bcrypt.compare(ADMIN_PASSWORD, admin.password);
      
      if (!isPasswordValid) {
        console.log('🔄 Updating admin password...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
        
        await users.updateOne(
          { _id: admin._id },
          { $set: { password: hashedPassword, updatedAt: new Date() } }
        );
        
        console.log('✅ Admin password updated to:', ADMIN_PASSWORD);
      } else {
        console.log('✅ Admin password is already set correctly');
      }
    }
    
    console.log('\n🔑 Login with these credentials:');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

updateAdminPassword();
