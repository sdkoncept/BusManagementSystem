// Script to create an admin user with proper password hashing
// Run: node prisma/create_admin.js

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'admin@eagleline.com';
    const password = 'Admin123!'; // Change this password!
    const firstName = 'Admin';
    const lastName = 'User';

    // Check if admin already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Update existing user to ADMIN
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          role: 'ADMIN',
          password: await bcrypt.hash(password, 10), // Update password
        },
      });
      console.log('✅ Admin user updated successfully!');
      console.log('Email:', updatedUser.email);
      console.log('Role:', updatedUser.role);
      console.log('Password:', password);
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: 'ADMIN',
        },
      });
      console.log('✅ Admin user created successfully!');
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
      console.log('Password:', password);
    }

    console.log('\n📝 Login Credentials:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('\n⚠️  Please change the password after first login!');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();

