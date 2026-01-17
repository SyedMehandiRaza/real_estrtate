"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class OwnerProfile extends Model {
    static associate(models) {

      OwnerProfile.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    }
  }

  OwnerProfile.init(
    {
      id:{
        type:DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        unique: true,
        validate: {
          isInt: true,
          notNull: {
            msg: "User is required",
          },
        },
      },

      displayName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 100],
        },
      },

      designation: DataTypes.STRING,

      companyName: DataTypes.STRING,

      experienceYears: {
        type: DataTypes.INTEGER,
        validate: {
          min: 0,
          max: 60,
        },
      },

      officeAddress: DataTypes.TEXT,

      bio: {
        type: DataTypes.TEXT,
        validate: {
          len: [0, 1000],
        },
      },

      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          is: /^[0-9+\-() ]{7,20}$/i,
        },
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },

      whatsapp: {
        type: DataTypes.STRING,
        validate: {
          is: /^[0-9+\-() ]{7,20}$/i,
        },
      },

      facebookUrl: {
        type: DataTypes.STRING,
        validate: {
          isUrl: true,
        },
      },

      instagramUrl: {
        type: DataTypes.STRING,
        validate: {
          isUrl: true,
        },
      },

      linkedinUrl: {
        type: DataTypes.STRING,
        validate: {
          isUrl: true,
        },
      },

      twitterUrl: {
        type: DataTypes.STRING,
        validate: {
          isUrl: true,
        },
      },

      websiteUrl: {
        type: DataTypes.STRING,
        validate: {
          isUrl: true,
        },
      },
    },
    {
      sequelize,
      modelName: "OwnerProfile",
      tableName: "OwnerProfiles",
    }
  );

  return OwnerProfile;
};
