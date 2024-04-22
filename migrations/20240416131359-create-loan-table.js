module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Loans", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			userId: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: "Users", // name of the Target model
					key: "id", // key in Target model
				},
			},
			typeOfLoanId: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: "TypeOfLoans", // name of the Target model
					key: "id", // key in Target model
				},
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
		});
	},
	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("Loans");
	},
};
