"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Property extends Model {
    static associate(models) {
      Property.hasOne(models.Marketing, {
        foreignKey: "propertyId",
        as: "marketing",
        onDelete: "CASCADE",
      });
      Property.belongsTo(models.User, {
        foreignKey: "ownerId",
        as: "owner",
        onDelete: "CASCADE",
      });
      Property.hasMany(models.PropertyMedia, {
        foreignKey: "propertyId",
        as: "media",
      });
      Property.hasMany(models.PropertyConfiguration, {
        foreignKey: "propertyId",
        as: "configurations",
        onDelete: "CASCADE",
      });
      Property.hasMany(models.CompanyPropertyContract, {
        foreignKey: "propertyId",
        as: "companyContracts",
        onDelete: "CASCADE",
      });
      Property.hasMany(models.Enquiry, {
        foreignKey: "propertyId",
        as: "enquiries",
      });
      Property.hasMany(models.SiteVisit, {
        foreignKey: "propertyId",
        as: "siteVisits",
      });
      Property.hasOne(models.PropertyPaymentPlan, {
        foreignKey: "propertyId",
        as: "paymentPlan",
      });
      Property.hasMany(models.PropertyPayment, {
        foreignKey: "propertyId",
        as: "payments",
      });
    }
  }

  Property.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      ownerId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },

      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      constructionStatus: {
        type: DataTypes.ENUM("READY", "UNDER_CONSTRUCTION"),
        allowNull: false,
      },

      price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      propertyType: {
        type: DataTypes.ENUM("APARTMENT", "VILLA", "HOUSE", "PLOT", "BUNGLOW"),
        allowNull: false,
        defaultValue: "APARTMENT",
      },

      bedrooms: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      bathrooms: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      garage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      yearBuilt: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      area: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      addressLine: {
        type: DataTypes.STRING,
      },

      city: {
        type: DataTypes.STRING,
      },

      state: {
        type: DataTypes.STRING,
      },

      zipCode: {
        type: DataTypes.STRING,
      },

      locationArea: {
        type: DataTypes.STRING,
      },

      country: {
        type: DataTypes.STRING,
      },
      purpose: {
        type: DataTypes.ENUM("sale", "rent", "lease"),
        allowNull: false,
        defaultValue: "sale",
      },
      purposeType: {
        type: DataTypes.ENUM("SALE", "RENT", "LEASE"),
        allowNull: false,
        defaultValue: "SALE",
      },

      noOfUnit: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      noOfTower: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      noOfFloor: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      builderName: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      amenities: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
        defaultValue: "ACTIVE",
      },
    },
    {
      sequelize,
      modelName: "Property",
      timestamps: true,
    },
  );

  return Property;
};
