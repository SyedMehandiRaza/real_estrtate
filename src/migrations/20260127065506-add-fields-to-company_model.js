'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.addColumn("Companies","notes",{
      type:Sequelize.STRING,
      allowNull: true,
    })
    await queryInterface.addColumn("Companies", "isTerminated",{
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    })
    await queryInterface.addColumn("Companies", "addedBy", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
    })
    await queryInterface.addColumn("Companies", "password", {
      type: Sequelize.STRING,
      allowNull: false,
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("Companies", "notes");
    await queryInterface.removeColumn("Companies", "isTerminated")
    await queryInterface.removeColumn("Companies", "addedBy")
    await queryInterface.removeColumn("Companies", "password")
  }
};
