'use strict';

const { tr } = require('zod/locales');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn("Users", "permissions", {
      type: Sequelize.JSON,
      allowNull: true,
    });

    await queryInterface.addColumn("Users", "ownerId", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("Users", "permissions")
    await queryInterface.removeColumn("Users", "ownerId")
  }
};
