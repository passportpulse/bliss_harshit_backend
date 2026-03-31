import dbConnect from '../src/lib/mongodb';
import EcomUser from '../src/models/EcomUser';

async function seedAdmin() {
  try {
    await dbConnect();
    console.log('Connected to database');

    // Check if admin already exists
    const existingAdmin = await EcomUser.findOne({ email: 'admin@example.com' });

    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      process.exit(0);
    }

    // Create admin user
    const admin = await EcomUser.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      phone: '+919999999999',
      password: 'admin123',
      role: 'admin',
      isActive: true
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: admin123');
    console.log('Role:', admin.role);
    console.log('\nYou can now login with these credentials.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    process.exit(1);
  }
}

seedAdmin();
