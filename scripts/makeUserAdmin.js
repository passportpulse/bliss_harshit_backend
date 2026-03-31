// Script to make current user an admin
const mongoose = require('mongoose');

// User model schema (matching your existing User model)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function makeUserAdmin() {
  try {
    // Connect to MongoDB using the URI from .env
    const MONGODB_URI = 'mongodb+srv://it_db_user:bcG9lyOEMcGuP6PH@cluster0.b9e5qnu.mongodb.net/dashboard?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    // List all users to see who can be made admin
    const users = await User.find({}).select('name email role');
    console.log('\n=== Current Users ===');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    if (users.length === 0) {
      console.log('No users found!');
      return;
    }

    // Make the first user admin (you can modify this logic)
    const userToUpdate = users[0]; // First user
    
    const result = await User.updateOne(
      { _id: userToUpdate._id },
      { $set: { role: 'admin' } }
    );

    if (result.modifiedCount > 0) {
      console.log(`\n✅ SUCCESS: Made ${userToUpdate.name} (${userToUpdate.email}) an admin!`);
    } else {
      console.log(`\n⚠️  User ${userToUpdate.email} was already an admin or not found.`);
    }

    // Show updated users
    const updatedUsers = await User.find({}).select('name email role');
    console.log('\n=== Updated Users ===');
    updatedUsers.forEach((user, index) => {
      const roleIcon = user.role === 'admin' ? '👑' : '👤';
      console.log(`${index + 1}. ${roleIcon} ${user.name} (${user.email}) - Role: ${user.role}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// If you want to make a specific user admin by email, uncomment and modify this:
/*
async function makeSpecificUserAdmin(email) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const result = await User.updateOne(
      { email: email },
      { $set: { role: 'admin' } }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`✅ Made ${email} an admin!`);
    } else {
      console.log(`❌ User ${email} not found or already admin.`);
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Usage: makeSpecificUserAdmin('your@email.com');
*/

makeUserAdmin();