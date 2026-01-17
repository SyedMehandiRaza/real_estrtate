"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Properties", "purpose", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Properties", "noOfUnit", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Properties", "noOfTower", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Properties", "noOfFloor", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Properties", "builderName", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Properties", "amenities", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Properties", "purpose");
    await queryInterface.removeColumn("Properties", "noOfUnit");
    await queryInterface.removeColumn("Properties", "noOfTower");
    await queryInterface.removeColumn("Properties", "noOfFloor");
    await queryInterface.removeColumn("Properties", "builderName");
    await queryInterface.removeColumn("Properties", "amenities");
  },
};
