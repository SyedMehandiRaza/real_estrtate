'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PropertyPaymentPlans', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },

      propertyId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "Properties",
          key: "id"
        },
        onDelete: "CASCADE"
      },

      totalPrice: {
        type: Sequelize.DECIMAL(12,2),
        allowNull: false
      },

      bookingAmount: {
        type: Sequelize.DECIMAL(12,2),
        allowNull: false
      },

      installmentCount: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },

      maintenanceCharge: Sequelize.DECIMAL(10,2),

      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('PropertyPaymentPlans');
  }
};
