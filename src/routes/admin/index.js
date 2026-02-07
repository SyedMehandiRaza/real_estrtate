const express = require("express");

const auth = require("../../middleware/auth.middleware");
const upload = require("../../middleware/upload.middleware");
const checkFeature = require("../../middleware/checkFeature.middleware");
const validate = require("../../middleware/validate.middleware.js");
const role = require("../../middleware/role.middleware");

const {
  createPropertyStep1Schema,
  createPropertyStep2Schema,
} = require("../../validor/property.validator");
const { addStaffSchema } = require("../../validor/staffManagement.validator");
const { loginSchema } = require("../../validor/auth.validator.js");

const controller = require("../../controllers/admin/index.js");

const router = express.Router();

router.get("/login", controller.renderLogin);
router.post("/login", validate(loginSchema), controller.login);

router.use(auth);
// subscription temporaray
router.get("/subscription", (req, res) => {
  try {
    return res.render("dashboard/main/index.ejs", {
      pageTitle: "Subscription",
      activePage: "subscription",
    });
  } catch (error) {
    console.error(error);
    req.flash("error", "something went wrong");
    return res.redirect(req.get("Referer"));
  }
});

// facility management
router.get(
  "/facility",

  checkFeature("facilityManagement"),
  controller.renderFaciltiyManagement,
);
router.get("/addfacility", controller.renderAddFacility);
router.post(
  "/addfacility",

  upload.single("document"),
  controller.addFacility,
);
router.post(
  "/facility/:companyId/terminate",

  controller.terminate,
);
router.post(
  "/facility/assign-property",

  controller.assignProperty,
);
// router.get("/facility/:companyId",  controller.companyDetail);

// marketing
router.get(
  "/marketing",

  checkFeature("marketing"),
  controller.renderMarketing,
);
router.post("/marketing", controller.promoteProperty);

// staffManagement
router.get(
  "/staff",

  checkFeature("staffManagement"),
  controller.renderStaff,
);
router.post(
  "/add-staff",

  role("OWNER"),
  validate(addStaffSchema),
  controller.addStaff,
);
router.post("/staff/remove/:id", controller.removeController);

// razorpay
router.post("/create", controller.createOrder);
router.post("/payment/verify", controller.verifyPayment);

// property owner
router.get(
  "/dashboard",

  role("OWNER"),
  checkFeature("dashboard"),
  controller.renderDashboard,
);

router.get(
  "/property",

  role("OWNER"),
  checkFeature("property"),
  controller.renderPropertyDashboard,
);
router.get(
  "/propertydetail/:id",

  role("OWNER"),
  controller.renderPropertyDetail,
);
router.get("/add", controller.renderAddProduct1);
router.get("/add_detail", controller.renderAddProduct2);
router.get("/add_config", controller.renderAddProduct3);
router.get("/add_upload", controller.renderAddProduct4);
router.get("/add_docs", controller.renderAddProduct5);
router.get("/add_prop_submit", controller.renderAddProduct_submit);
router.post(
  "/add",

  validate(createPropertyStep1Schema),
  controller.submitStep1,
);
router.post(
  "/add_detail",

  validate(createPropertyStep2Schema),
  controller.submitStep2,
);
router.post(
  "/add_config",

  upload.fields([{ name: "floorPlan", maxCount: 1 }]),
  controller.submitStep3,
);
router.post(
  "/add_upload",

  upload.fields([
    { name: "images", maxCount: 20 },
    { name: "video", maxCount: 2 },
  ]),
  controller.submitStep4,
);
router.post("/add_docs", controller.submitStep5);
router.post("/add_prop_submit", controller.createProperty);


// logout
router.post("/logout", controller.logout)
module.exports = router;
