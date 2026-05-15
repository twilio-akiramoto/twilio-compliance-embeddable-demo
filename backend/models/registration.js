module.exports = (sequelize, DataTypes) => {
  const Registration = sequelize.define('Registration', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id'
      }
    },
    registrationType: {
      type: DataTypes.ENUM('au-alphanumeric', 'tollfree', 'regulatory-bundle', 'customer-profile', 'branded-calling'),
      allowNull: false
    },
    senderId: {
      type: DataTypes.STRING,
      allowNull: true // Not all registration types have sender IDs
    },
    status: {
      type: DataTypes.ENUM('draft', 'in_review', 'approved', 'rejected', 'in_progress'),
      allowNull: false,
      defaultValue: 'draft'
    },
    twilioRegistrationId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    twilioInquiryId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    data: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    tableName: 'registrations',
    timestamps: true,
    underscored: true
  });

  return Registration;
};
