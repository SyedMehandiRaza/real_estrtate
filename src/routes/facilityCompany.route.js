const express = require("express")
const facilityController = require("../controllers/facilityCompany.controller")
const auth = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const router = express.Router()
const checkFeature = require("../middleware/checkFeature.middleware")

router.get("/facility", auth, checkFeature("facilityManagement"), facilityController.renderFaciltiyManagement);

router.get("/addfacility", auth, facilityController.renderAddFacility);

router.post("/addfacility", auth, upload.single("document"), facilityController.addFacility);

router.post("/facility/:companyId/terminate", auth, facilityController.terminate);

router.get("/facility/:companyId", auth, facilityController.companyDetail);

router.post("/facility/assign-property", auth, facilityController.assignProperty);



module.exports = router;