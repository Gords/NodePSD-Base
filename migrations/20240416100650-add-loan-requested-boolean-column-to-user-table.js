module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn("Users", "loanRequested", {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn("Users", "loanRequested");
	},
};
