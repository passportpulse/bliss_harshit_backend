import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import path from 'path';
import User from '../src/models/User.js';

// Load environment variables
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function verifyAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Check if admin user exists
    let admin = await User.findOne({ email: 'admin@example.com' });
    
    if (!admin) {
      console.log('Admin user not found. Creating admin user...');
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Create admin user
      admin = new User({
        name: 'Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN'
      });
      
      await admin.save();
      console.log('Admin user created successfully!');
    } else {
      console.log('Admin user found. Verifying password...');
      // Verify the password
      const isMatch = await bcrypt.compare('admin123', admin.password);
      
      if (!isMatch) {
        console.log('Updating admin password...');
        // Update the password
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash('admin123', salt);
        await admin.save();
        console.log('Admin password updated successfully!');
      } else {
        console.log('Admin password is correct.');
      }
    }
    
    console.log('Admin user details:', {
      id: admin._id,
      email: admin.email,
      role: admin.role,
      name: admin.name,
      passwordSet: !!admin.password
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verifyAdmin();
