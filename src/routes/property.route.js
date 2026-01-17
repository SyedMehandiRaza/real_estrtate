const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");
const propertyController = require("../controllers/property.controller");
const validate = require('../middleware/validate.middleware');
const { createPropertySchema, uploadMediaSchema } = require("../validor/property.validator");

// router.get("/properties/create", auth, role("OWNER"), propertyController.renderCreateProperty);
// router.post("/properties/create", auth, role("OWNER"), validate(createPropertySchema), propertyController.createProperty);

// router.get("/properties/:propertyId/media", auth, role("OWNER"), propertyController.renderMediaUpload);
// router.post(
//   "/properties/:propertyId/media",
//   auth,
//   role("OWNER"),
//   validate(uploadMediaSchema, "params"),
//   upload.array("media", 10),
//   propertyController.uploadMedia
// );




router.get("/land", propertyController.renderLandingPage);
router.get("/properties/:id", propertyController.renderPropertyDetail);

router.get("/search", propertyController.filterController);


module.exports = router;
