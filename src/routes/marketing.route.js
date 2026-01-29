const express = require("express");
const promoteController = require("../controllers/marketing.controller.js")
const auth = require('../middleware/auth.middleware.js')
const { promotePropertySchema } = require("../validor/marketing.validator.js")
const validate = require("../middleware/validate.middleware.js");
 
const router  = express.Router();

router.get("/marketing", auth, promoteController.renderMarketing);
router.post("/marketing", auth, promoteController.promoteProperty)

module.exports = router;
