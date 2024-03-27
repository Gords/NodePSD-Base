'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // logic for transforming into the new state
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(
        'ALTER TABLE "Images" ALTER COLUMN "userId" TYPE INTEGER USING "userId"::integer;',
        { transaction }
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    // logic for reverting the changes
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(
        'ALTER TABLE "Images" ALTER COLUMN "userId" TYPE CHARACTER VARYING USING "userId"::text;',
        { transaction }
      );
    });
  }
};
