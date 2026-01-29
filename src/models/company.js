"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    static associate(models) {
      Company.hasMany(models.CompanyPropertyContract, {
        foreignKey: "companyId",
        as: "propertyContracts",
        onDelete: "CASCADE",
      });
    }
  }

  Company.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      companyName: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      contactPerson: {
        type: DataTypes.STRING,
      },

      companyEmail: {
        type: DataTypes.STRING,
      },

      companyAddress: {
        type: DataTypes.TEXT,
      },

      phoneNumber: {
        type: DataTypes.STRING,
      },

      notes: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      isTerminated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      addedBy: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },

      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Company",
      tableName: "companies",
      timestamps: true,
    }
  );

  return Company;
};

