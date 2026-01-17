"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PropertyConfiguration extends Model {
    static associate(models) {
       PropertyConfiguration.belongsTo(models.Property, {
          foreignKey: "propertyId",
          as: "property",
          onDelete: "CASCADE",
        });
    }
  }

  PropertyConfiguration.init(
    {
      propertyId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        validate: {
          isInt: true,
        },
      },

      configName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 255],
        },
      },

      configArea: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },

      totalUnits: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },

      availableUnits: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },

      price: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isNumeric: true,
        },
      },

      floorPlan: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "PropertyConfiguration",
      tableName: "PropertyConfigurations",
      timestamps: true,
    }
  );

  return PropertyConfiguration;
};
