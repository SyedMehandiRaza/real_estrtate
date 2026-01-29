"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Subscription.belongsTo(models.User, { foreignKey: "userId" });
      Subscription.belongsTo(models.Plan, { foreignKey: "planId" });
    }
  }
  Subscription.init(
    {
      userId: DataTypes.INTEGER,
      planId: DataTypes.INTEGER,
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Subscription",
    }
  );
  return Subscription;
};
