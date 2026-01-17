'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ConstructionUpdate extends Model {
    static associate(models) {
      ConstructionUpdate.belongsTo(models.Property, {
        foreignKey: 'propertyId',
        as: 'property',
        onDelete: 'CASCADE'
      });
    }
  }

  ConstructionUpdate.init(
    {
      propertyId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },

      title: {
        type: DataTypes.STRING,
        allowNull: false
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },

      progressPercentage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
          max: 100
        }
      }
    },
    {
      sequelize,
      modelName: 'ConstructionUpdate',
      timestamps: true
    }
  );

  return ConstructionUpdate;
};
