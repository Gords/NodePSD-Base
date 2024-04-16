const { Model, DataTypes } = require('sequelize');

class Loan extends Model {
  static associate(models) {
    Loan.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    Loan.belongsTo(models.TypeOfLoan, {
      foreignKey: 'typeOfLoanId',
      as: 'typeOfLoan'
    });
  }
}

Loan.init({
  // Model attributes are defined here
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id',
    }
  },
  typeOfLoanId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'typeOfLoans',
      key: 'id',
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Loan',
  tableName: 'Loans',
  timestamps: true
});

module.exports = Loan;
