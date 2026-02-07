"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PropertyPaymentPlan extends Model {
    static associate(models) {

     
      PropertyPaymentPlan.belongsTo(models.Property, {
        foreignKey: "propertyId",
        as: "property",
      });

      PropertyPaymentPlan.belongsTo(models.User, {
        foreignKey: "userId",
        as: "buyer",
      });

      PropertyPaymentPlan.hasMany(models.Installment, {
        foreignKey: "planId",
        as: "installments",
      });

    }
  }

  PropertyPaymentPlan.init(
    {
      propertyId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      planType: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      totalPrice: {
        type: DataTypes.DECIMAL(12,2),
        allowNull: false,
      },

      bookingAmount: {
        type: DataTypes.DECIMAL(12,2),
      },

      installmentCount: {
        type: DataTypes.INTEGER,
      },

      durationMonths: {
        type: DataTypes.INTEGER,
      },

      monthlyAmount: {
        type: DataTypes.DECIMAL(12,2),
      },

      maintenanceCharge: {
        type: DataTypes.DECIMAL(12,2),
      },

      startDate: {
        type: DataTypes.DATE,
      },

      dueDay: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },

      status: {
        type: DataTypes.STRING,
        defaultValue: "ACTIVE",
      },

      razorpaySubscriptionId: {
        type: DataTypes.STRING,
      },

      currency: {
        type: DataTypes.STRING,
        defaultValue: "INR",
      },
    },
    {
      sequelize,
      modelName: "PropertyPaymentPlan",
      tableName: "PropertyPaymentPlans",
    }
  );

  return PropertyPaymentPlan;
};
