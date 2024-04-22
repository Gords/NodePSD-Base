const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	// biome-ignore lint/complexity/noStaticOnlyClass: Convention used in sequelize
	class TypeOfLoan extends Model {
		static associate(models) {
			// A TypeOfLoan can have many Loans
			TypeOfLoan.hasMany(models.Loan, {
				foreignKey: "typeOfLoanId",
				as: "loans",
			});
		}
	}

	TypeOfLoan.init(
		{
			// Model attributes are defined here
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			description: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			createdAt: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
			updatedAt: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
		},
		{
			sequelize,
			modelName: "TypeOfLoan",
			tableName: "TypeOfLoans",
			timestamps: true,
		},
	);

	return TypeOfLoan;
};
