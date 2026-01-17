'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // await queryInterface.addColumn('Properties', 'addressLine', {
    //   type: Sequelize.STRING,
    //   allowNull: true,
    // });

    // await queryInterface.addColumn('Properties', 'city', {
    //   type: Sequelize.STRING,
    //   allowNull: true,
    // });

    // await queryInterface.addColumn('Properties', 'state', {
    //   type: Sequelize.STRING,
    //   allowNull: true,
    // });

    // await queryInterface.addColumn('Properties', 'zipCode', {
    //   type: Sequelize.STRING,
    //   allowNull: true,
    // });

    // await queryInterface.addColumn('Properties', 'locationArea', {
    //   type: Sequelize.STRING,
    //   allowNull: true,
    // });


    await queryInterface.addColumn('Properties', 'country', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    // await queryInterface.removeColumn('Properties', 'addressLine');
    // await queryInterface.removeColumn('Properties', 'city');
    // await queryInterface.removeColumn('Properties', 'state');
    // await queryInterface.removeColumn('Properties', 'zipCode');
    // await queryInterface.removeColumn('Properties', 'locationArea');
    await queryInterface.removeColumn('Properties', 'country');
  },
};
