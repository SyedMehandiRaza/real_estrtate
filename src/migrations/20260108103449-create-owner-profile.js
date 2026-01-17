'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OwnerProfiles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      userId: {
        type: Sequelize.INTEGER.UNSIGNED, 
        allowNull: false,
        unique: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      displayName: {
        type: Sequelize.STRING(100),
        allowNull: false
      },

      designation: {
        type: Sequelize.STRING(100)
      },

      companyName: {
        type: Sequelize.STRING(150)
      },

      experienceYears: {
        type: Sequelize.INTEGER
      },

      officeAddress: {
        type: Sequelize.TEXT
      },

      bio: {
        type: Sequelize.TEXT
      },

      phone: {
        type: Sequelize.STRING(20),
        allowNull: false
      },

      email: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true
      },

      whatsapp: {
        type: Sequelize.STRING(20)
      },

      facebookUrl: {
        type: Sequelize.STRING(255)
      },

      instagramUrl: {
        type: Sequelize.STRING(255)
      },

      linkedinUrl: {
        type: Sequelize.STRING(255)
      },

      twitterUrl: {
        type: Sequelize.STRING(255)
      },

      websiteUrl: {
        type: Sequelize.STRING(255)
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('OwnerProfiles');
  }
};
