'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasOne(models.OwnerProfile, {
        foreignKey: "id",
        as: "profile",
      });
    }
  }
  User.init({
    id:{
      type:DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    name: DataTypes.STRING,
    email: {
      type:DataTypes.STRING,
      unique: true
    },
    phone:{
      type:DataTypes.STRING,
      unique: true
    },
    password: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM(
        "ADMIN", "BUYER", "OWNER", "TENANT", "FACILITY_ADMIN", "TECHNICIAN", "AGENT"
      ),
      defaultValue: "BUYER"
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status:{
      type:  DataTypes.ENUM("ACTIVE", "BLOCKED"),
      defaultValue: "ACTIVE"
    },
    createdAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};