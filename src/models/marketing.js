"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Marketing extends Model {
    static associate(models) {
      Marketing.belongsTo(models.Property, {
        foreignKey: "propertyId",
        as: "property",
        onDelete: "CASCADE",
      });
    }
  }

  Marketing.init(
    {
      propertyId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        validate: {
          isInt: true,
          notNull: { msg: "Property ID is required" },
        },
      },
      
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        validate: {
          isInt: true,
          notNull: { msg: "User ID is required" },
        },
      },

      platforms: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {
          instagram: false,
          youtube: false,
          facebook: false,
          linkedin: false,
        },
      },

      promotionType: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {
          single: false,
          carousel: false,
          story: false,
          video: false,
        },
      },

      isPromoted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Marketing",
      tableName: "Marketings",
    }
  );

  return Marketing;
};
