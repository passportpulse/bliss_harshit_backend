// Script to fix admin roles and show current user
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

async function fixAdminRoles() {
  try {
    // Connect to MongoDB using the URI from .env
    const MONGODB_URI = 'mongodb+srv://it_db_user:bcG9lyOEMcGuP6PH@cluster0.b9e5qnu.mongodb.net/dashboard?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    // List all users first
    const users = await User.find({}).select('name email role');
    console.log('\n=== Current Users ===');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'No Name'} (${user.email}) - Role: ${user.role}`);
    });

    // Fix any ADMIN (uppercase) to admin (lowercase)
    const uppercaseAdmins = await User.updateMany(
      { role: 'ADMIN' },
      { $set: { role: 'admin' } }
    );

    if (uppercaseAdmins.modifiedCount > 0) {
      console.log(`\n✅ Fixed ${uppercaseAdmins.modifiedCount} users with uppercase ADMIN role`);
    }

    // Make sure at least one user is admin
    const adminUsers = await User.find({ role: 'admin' });
    if (adminUsers.length === 0) {
      // Make the first user admin
      const firstUser = await User.findOne({});
      if (firstUser) {
        await User.updateOne({ _id: firstUser._id }, { $set: { role: 'admin' } });
        console.log(`\n✅ Made ${firstUser.email} an admin`);
      }
    }

    // Show final state
    const finalUsers = await User.find({}).select('name email role');
    console.log('\n=== Final Users State ===');
    finalUsers.forEach((user, index) => {
      const roleIcon = user.role === 'admin' ? '👑' : '👤';
      console.log(`${index + 1}. ${roleIcon} ${user.name || 'No Name'} (${user.email}) - Role: ${user.role}`);
    });

    const adminCount = await User.countDocuments({ role: 'admin' });
    console.log(`\n📊 Total Admin Users: ${adminCount}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

fixAdminRoles();