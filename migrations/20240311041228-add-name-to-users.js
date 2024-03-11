'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'name');
  },
};
