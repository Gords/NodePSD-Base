'use strict';

/** @type {import('sequelize-cli').Migration} */
// migrations/XXXXXXXXXXXXXX-add-userType-to-users.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'userType', {
      type: Sequelize.ENUM('individual', 'business'),
      allowNull: false,
      defaultValue: 'individual',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'userType');
  },
};