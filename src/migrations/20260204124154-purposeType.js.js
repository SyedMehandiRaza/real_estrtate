'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Properties', 'purposeType', {
      type: Sequelize.ENUM('SALE', 'RENT', 'LEASE'),
      allowNull: false,
      defaultValue: 'SALE',
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the column if we rollback
    await queryInterface.removeColumn('Properties', 'purposeType');
  }
};
