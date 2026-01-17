const express = require("express");
const propOwnerController = require("../controllers/propertyOwner.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");
const validate = require("../middleware/validate.middleware");
const { createPropertyStep1Schema, createPropertyStep2Schema, createPropertyStep3Schema } = require("../validor/property.validator");

const router = express.Router();

router.get(
  "/dashboard",
  auth,
  role("OWNER"),
  propOwnerController.renderDashboard
);
router.get(
  "/property",
  auth,
  role("OWNER"),
  propOwnerController.renderPropertyDashboard
);
router.get(
  "/propertydetail/:id",
  auth,
  role("OWNER"),
  propOwnerController.renderPropertyDetail
);

// render pages of add product
router.get("/add", propOwnerController.renderAddProduct1);

router.get("/add_detail", propOwnerController.renderAddProduct2);

router.get("/add_config", propOwnerController.renderAddProduct3);

router.get("/add_upload", propOwnerController.renderAddProduct4);

router.get("/add_docs", propOwnerController.renderAddProduct5);

router.get("/add_prop_submit", propOwnerController.renderAddProduct_submit);

//  add product controller
router.post("/add", auth, validate(createPropertyStep1Schema), propOwnerController.submitStep1);
router.post("/add_detail", auth, validate(createPropertyStep2Schema), propOwnerController.submitStep2);
router.post(
  "/add_config",
  auth,
  upload.fields([{ name: "floorPlan", maxCount: 1 }]),
  propOwnerController.submitStep3
);
router.post(
  "/add_upload",
  auth,
  upload.fields([
    { name: "images", maxCount: 20 },
    { name: "video", maxCount: 2 },
  ]),
  propOwnerController.submitStep4
);
router.post("/add_docs", auth, propOwnerController.submitStep5);
router.post("/add_prop_submit", auth, propOwnerController.createProperty);

module.exports = router;


