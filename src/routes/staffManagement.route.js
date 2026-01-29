const express = require("express");
const staffController = require("../controllers/staffManagement.controller");
const auth = require('../middleware/auth.middleware')
const role = require("../middleware/role.middleware")
const validate = require("../middleware/validate.middleware")
const { addStaffSchema } = require("../validor/staffManagement.validator");

const router = express.Router();

router.get("/staff", auth, staffController.renderStaff);
console.log("add staff rpoute")
router.post("/add-staff", auth, role("OWNER"),validate(addStaffSchema), staffController.addStaff);
router.post("/staff/remove/:id", staffController.removeController)


module.exports = router;