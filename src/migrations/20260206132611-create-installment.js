'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Installments', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },

      planId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "PropertyPaymentPlans",
          key: "id"
        },
        onDelete: "CASCADE"
      },

      installmentNo: Sequelize.INTEGER.UNSIGNED,

      amount: Sequelize.DECIMAL(12,2),

      dueDate: Sequelize.DATEONLY,

      status: {
        type: Sequelize.ENUM("PENDING","PAID","OVERDUE"),
        defaultValue: "PENDING"
      },

      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Installments');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Installments_status";');
  }
};
