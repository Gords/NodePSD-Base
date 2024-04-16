'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('TypeOfLoans', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Personal'
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('TypeOfLoans', 'name')
  }
}
