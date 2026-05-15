const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Initialize SQLite database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false
});

// Import models
const User = require('./user')(sequelize, DataTypes);
const Customer = require('./customer')(sequelize, DataTypes);
const Registration = require('./registration')(sequelize, DataTypes);

// Define associations
User.hasOne(Customer, { foreignKey: 'userId', as: 'customer' });
Customer.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Customer.hasMany(Registration, { foreignKey: 'customerId', as: 'registrations' });
Registration.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

// CSM assignment (User can have many assigned Customers)
Customer.belongsTo(User, { foreignKey: 'assignedCSM', as: 'csm' });

// Initialize database
const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Sync models (creates tables if they don't exist)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Database models synchronized');

    return true;
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Customer,
  Registration,
  initDatabase
};
