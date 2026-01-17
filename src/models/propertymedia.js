'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PropertyMedia extends Model {
    static associate(models) {
      PropertyMedia.belongsTo(models.Property, {
        foreignKey: 'propertyId',
        as: 'property',
        onDelete: 'CASCADE'
      });
    }
  }

  PropertyMedia.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },

      propertyId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },

      type: {
        type: DataTypes.ENUM("IMAGE", "VIDEO"),
        allowNull: false
      },

      url: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'PropertyMedia',
      timestamps: true
    }
  );

  return PropertyMedia;
};
