"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PropertyPayment extends Model {
    static associate(models) {

      this.belongsTo(models.User, {
        foreignKey: "userId",
        as: "buyer",
      });

      this.belongsTo(models.Property, {
        foreignKey: "propertyId",
        as: "property",
      });

      this.belongsTo(models.PropertyPaymentPlan, {
        foreignKey: "planId",
        as: "plan",
      });

      this.belongsTo(models.Installment, {
        foreignKey: "installmentId",
        as: "installment",
      });

    }
  }

  PropertyPayment.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      propertyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      planId: {
        type: DataTypes.INTEGER,
      },

      installmentId: {
        type: DataTypes.INTEGER,
      },

      amount: {
        type: DataTypes.DECIMAL(12,2),
        allowNull: false,
      },

      
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      razorpayOrderId: {
        type: DataTypes.STRING,
      },

      razorpayPaymentId: {
        type: DataTypes.STRING,
      },

      
      razorpaySignature: {
        type: DataTypes.STRING,
      },

      status: {
        type: DataTypes.STRING,
        defaultValue: "CREATED",
      },

      method: {
        type: DataTypes.STRING,
      },

      currency: {
        type: DataTypes.STRING,
        defaultValue: "INR",
      },

      
      paidAt: {
        type: DataTypes.DATE,
      },

      gatewayResponse: {
        type: DataTypes.JSON,
      },
    },
    {
      sequelize,
      modelName: "PropertyPayment",
      tableName: "PropertyPayments",
    }
  );

  return PropertyPayment;
};
