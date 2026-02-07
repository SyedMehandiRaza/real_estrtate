"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Enquiry extends Model {
    static associate(models) {
      Enquiry.belongsTo(models.User, { foreignKey: "userId" });
      Enquiry.belongsTo(models.Property, { foreignKey: "propertyId" });
    }
  }
  Enquiry.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { notNull: true },
      },
      propertyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { notNull: true },
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notNull: true, notEmpty: true },
      },
      status: {
        type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
        allowNull: false,
        defaultValue: "ACTIVE",
        validate: {
          isIn: [["ACTIVE", "INACTIVE"]],
        },
      },
    },
    {
      sequelize,
      modelName: "Enquiry",
    }
  );
  return Enquiry;
};
