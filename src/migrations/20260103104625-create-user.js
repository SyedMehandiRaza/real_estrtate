'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement:true,
        allowNull: false
      },

      name: {
        type: Sequelize.STRING,
        allowNull: true
      },

      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
      },

      phone: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
      },

      password: {
        type: Sequelize.STRING,
        allowNull: true
      },

      role: {
        type: Sequelize.ENUM(
          "ADMIN",
          "BUYER",
          "OWNER",
          "TENANT",
          "FACILITY_ADMIN",
          "TECHNICIAN",
          "AGENT"
        ),
        defaultValue: "BUYER"
      },

      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },

      status: {
        type: Sequelize.ENUM("ACTIVE", "BLOCKED"),
        defaultValue: "ACTIVE"
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');


  }
};
