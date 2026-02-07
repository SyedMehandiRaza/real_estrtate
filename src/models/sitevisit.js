'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SiteVisit extends Model {
    static associate(models) {
      SiteVisit.belongsTo(models.User, { foreignKey: 'userId' });
      SiteVisit.belongsTo(models.Property, { foreignKey: 'propertyId' });

    }
  }
  SiteVisit.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { notNull: true }
      },
      propertyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { notNull: true }
      },
      visit_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: { notNull: true, isDate: true }
      },
      visit_time: {
        type: DataTypes.TIME,
        allowNull: false,
        validate: { notNull: true }
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'PENDING',
        validate: { isIn: [['PENDING', 'CONFIRMED', 'CANCELLED']] }
      }
    },
    {
      sequelize,
      modelName: 'SiteVisit',
    }
  );
  return SiteVisit;
};
