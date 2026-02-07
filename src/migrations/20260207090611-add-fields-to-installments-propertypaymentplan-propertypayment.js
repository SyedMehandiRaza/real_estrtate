module.exports = {
  async up(queryInterface, Sequelize) {

    // PropertyPaymentPlan updates
    await queryInterface.addColumn("PropertyPaymentPlans", "userId", {
      type: Sequelize.INTEGER,
    });

    await queryInterface.addColumn("PropertyPaymentPlans", "planType", {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn("PropertyPaymentPlans", "durationMonths", {
      type: Sequelize.INTEGER,
    });

    await queryInterface.addColumn("PropertyPaymentPlans", "monthlyAmount", {
      type: Sequelize.DECIMAL,
    });

    await queryInterface.addColumn("PropertyPaymentPlans", "startDate", {
      type: Sequelize.DATE,
    });

    await queryInterface.addColumn("PropertyPaymentPlans", "dueDay", {
      type: Sequelize.INTEGER,
    });

    await queryInterface.addColumn("PropertyPaymentPlans", "status", {
      type: Sequelize.STRING,
    });

    // Installment updates
    await queryInterface.addColumn("Installments", "paidAt", {
      type: Sequelize.DATE,
    });

    await queryInterface.addColumn("Installments", "lateFee", {
      type: Sequelize.DECIMAL,
    });

    // PropertyPayment updates
    await queryInterface.addColumn("PropertyPayments", "razorpaySignature", {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn("PropertyPayments", "paidAt", {
      type: Sequelize.DATE,
    });

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("PropertyPaymentPlans", "userId");
    await queryInterface.removeColumn("PropertyPaymentPlans", "planType");
    await queryInterface.removeColumn("PropertyPaymentPlans", "durationMonths");
    await queryInterface.removeColumn("PropertyPaymentPlans", "monthlyAmount");
    await queryInterface.removeColumn("PropertyPaymentPlans", "startDate");
    await queryInterface.removeColumn("PropertyPaymentPlans", "dueDay");
    await queryInterface.removeColumn("PropertyPaymentPlans", "status");

    await queryInterface.removeColumn("Installments", "paidAt");
    await queryInterface.removeColumn("Installments", "lateFee");

    await queryInterface.removeColumn("PropertyPayments", "razorpaySignature");
    await queryInterface.removeColumn("PropertyPayments", "paidAt");
  }
};
