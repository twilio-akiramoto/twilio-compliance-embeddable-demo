module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true, // Can be null until user registers
      references: {
        model: 'users',
        key: 'id'
      }
    },
    businessName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    businessWebsite: {
      type: DataTypes.STRING,
      allowNull: true
    },
    contactEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    invitationToken: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    invitationSentAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    invitationStatus: {
      type: DataTypes.ENUM('sent', 'opened', 'logged_in', 'in_progress', 'completed'),
      allowNull: false,
      defaultValue: 'sent'
    },
    assignedCSM: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    tableName: 'customers',
    timestamps: true,
    underscored: true
  });

  return Customer;
};
