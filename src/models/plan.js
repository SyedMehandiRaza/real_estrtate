"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Plan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Plan.hasMany(models.Subscription, { foreignKey: "planId" });
      Plan.hasMany(models.Payment, { foreignKey: "planId" });
    }
  }
  Plan.init(
    {
      name: DataTypes.STRING,
      price: DataTypes.INTEGER,
      maxPropertiesPerMonth: DataTypes.INTEGER,
      features: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "Plan",
    }
  );
  return Plan;
};
