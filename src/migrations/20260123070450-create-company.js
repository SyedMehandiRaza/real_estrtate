"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("companies", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      companyName: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      contactPerson: {
        type: Sequelize.STRING,
      },

      companyEmail: {
        type: Sequelize.STRING,
      },

      companyAddress: {
        type: Sequelize.TEXT,
      },

      phoneNumber: {
        type: Sequelize.STRING,
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

  async down(queryInterface) {
    await queryInterface.dropTable("companies");
  },
};
