/**
 * Database Seed Script
 * Creates test users and data for development
 */

const { User, Customer, Registration } = require('../models');
const authService = require('../services/auth.service');

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Check if CSM user already exists
    const existingCSM = await User.findOne({ where: { email: 'csm@test.com' } });
    if (existingCSM) {
      console.log('✅ Seed data already exists');
      return;
    }

    // Create CSM test user
    const csmPassword = await authService.hashPassword('password123');
    const csmUser = await User.create({
      email: 'csm@test.com',
      passwordHash: csmPassword,
      username: 'Test CSM',
      role: 'csm',
      companyName: 'Twilio ISV Demo',
      isActive: true
    });
    console.log('✅ Created CSM user: csm@test.com / password123');

    // Create test customer user
    const customerPassword = await authService.hashPassword('customer123');
    const customerUser = await User.create({
      email: 'customer@test.com',
      passwordHash: customerPassword,
      username: 'Test Customer',
      role: 'customer',
      companyName: 'Acme Corporation',
      isActive: true
    });
    console.log('✅ Created test customer: customer@test.com / customer123');

    // Create customer record
    const customer = await Customer.create({
      userId: customerUser.id,
      businessName: 'Acme Corporation',
      businessWebsite: 'https://acme.example.com',
      contactEmail: 'customer@test.com',
      invitationStatus: 'completed',
      assignedCSM: csmUser.id,
      metadata: {
        industry: 'Technology',
        size: 'Medium'
      }
    });
    console.log('✅ Created test customer record');

    console.log('🎉 Seed completed successfully!');
    console.log('');
    console.log('Test Credentials:');
    console.log('  CSM Dashboard: csm@test.com / password123');
    console.log('  Customer Portal: customer@test.com / customer123');
    console.log('');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

module.exports = seed;

// Run seed if called directly
if (require.main === module) {
  const sequelize = require('../models').sequelize;

  seed()
    .then(() => {
      console.log('✅ Seed script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed script failed:', error);
      process.exit(1);
    });
}
