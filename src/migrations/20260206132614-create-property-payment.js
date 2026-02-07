'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PropertyPayments', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },

      userId: {
        type: Sequelize.INTEGER.UNSIGNED,
        references: { model: "Users", key: "id" }
      },

      propertyId: {
        type: Sequelize.INTEGER.UNSIGNED,
        references: { model: "Properties", key: "id" }
      },

      installmentId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: "Installments", key: "id" }
      },

      amount: Sequelize.DECIMAL(12,2),

      type: {
        type: Sequelize.ENUM(
          "BOOKING",
          "INSTALLMENT",
          "RENT",
          "MAINTENANCE"
        )
      },

      razorpayOrderId: Sequelize.STRING,
      razorpayPaymentId: Sequelize.STRING,

      status: Sequelize.STRING,

      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PropertyPayments');
  }
};
