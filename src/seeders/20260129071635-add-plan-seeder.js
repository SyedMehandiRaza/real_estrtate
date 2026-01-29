"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    await queryInterface.bulkInsert("Plans", [
      {
        name: "basic",
        price: 49,
        maxPropertiesPerMonth: 6,
        features: JSON.stringify({
          dashboard: true,
          property: true,
          crm: false,
          marketing: false,
          staffManagement: false,
          facilityManagement: false,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "premium",
        price: 99,
        maxPropertiesPerMonth: 20,
        features: JSON.stringify({
          dashboard: true,
          property: true,
          crm: true,
          marketing: true,
          staffManagement: false,
          facilityManagement: false,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "pro",
        price: 149,
        maxPropertiesPerMonth: 50,
        features: JSON.stringify({
          dashboard: true,
          property: true,
          crm: true,
          marketing: true,
          staffManagement: true,
          facilityManagement: true,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    await queryInterface.bulkDelete("Plans", null, {});
  },
};