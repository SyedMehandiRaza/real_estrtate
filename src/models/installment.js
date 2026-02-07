"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Installment extends Model {
    static associate(models) {

      this.belongsTo(models.PropertyPaymentPlan, {
        foreignKey: "planId",
        as: "plan",
      });

      this.hasMany(models.PropertyPayment, {
        foreignKey: "installmentId",
        as: "payments",
      });

    }
  }

  Installment.init(
    {
      planId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      installmentNo: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      amount: {
        type: DataTypes.DECIMAL(12,2),
        allowNull: false,
      },

      dueDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      
      status: {
        type: DataTypes.STRING,
        defaultValue: "PENDING",
      },

      
      paidAt: {
        type: DataTypes.DATE,
      },

      lateFee: {
        type: DataTypes.DECIMAL(12,2),
        defaultValue: 0,
      },

      currency: {
        type: DataTypes.STRING,
        defaultValue: "INR",
      },

      razorpayOrderId: {
        type: DataTypes.STRING,
      },

      remarks: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "Installment",
      tableName: "Installments",
    }
  );

  return Installment;
};
