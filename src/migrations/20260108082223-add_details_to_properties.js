"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Properties", "propertyType", {
      type: Sequelize.ENUM("APARTMENT", "VILLA", "HOUSE", "PLOT", "BUNGLOW"),
      allowNull: false,
      defaultValue: "HOUSE",
    });

    await queryInterface.addColumn("Properties", "bedrooms", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn("Properties", "bathrooms", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn("Properties", "garage", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn("Properties", "yearBuilt", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("Properties", "area", {
      type: Sequelize.INTEGER, 
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Properties", "propertyType");
    await queryInterface.removeColumn("Properties", "bedrooms");
    await queryInterface.removeColumn("Properties", "bathrooms");
    await queryInterface.removeColumn("Properties", "garage");
    await queryInterface.removeColumn("Properties", "yearBuilt");
    await queryInterface.removeColumn("Properties", "area");
  },
};
