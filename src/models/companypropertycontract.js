"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CompanyPropertyContract extends Model {
    static associate(models) {
      CompanyPropertyContract.belongsTo(models.Company, {
        foreignKey: "companyId",
        as: "company",
      });

      CompanyPropertyContract.belongsTo(models.Property, {
        foreignKey: "propertyId",
        as: "property",
      });
    }
  }

  CompanyPropertyContract.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      companyId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },

      propertyId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },

      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      notes: {
        type: DataTypes.TEXT,
      },

      documents: {
        type: DataTypes.JSON,
      },
    },
    {
      sequelize,
      modelName: "CompanyPropertyContract",
      tableName: "companypropertycontracts",
      timestamps: true,
    }
  );

  return CompanyPropertyContract;
};
