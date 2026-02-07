const express = require("express");
const controller = require("../../controllers/api/index")
const auth = require("../../middleware/auth.middleware");
const role = require("../../middleware/role.middleware")

const router = express.Router();

// authentication
router.post("/register", controller.register);
router.post("/verify", controller.verifyOtp);
router.post("/country", controller.updateCountry);
router.post("/login", controller.login);
router.post("/changePassword", auth, controller.changePassword);

// properties

// user-property
router.get("/property/purpose", auth, controller.fetchPropertyByPurpose);
router.get("/property/detail/:id", auth, controller.propertyDetail);
router.get("/properties", auth, controller.properties);
router.get("/filter", auth, controller.filterController)

// owner-property

// user-enquiry
router.post("/user/enquiry", auth, controller.enquiries);
router.get("/user/get-enquiries", auth, controller.getEnquiries)
router.get("/user/get-enquiries/:id", auth, controller.getEnquiry)

// owner-property enquiry
router.get("/owner/get-enquiries", auth, role("OWNER"), controller.getOwnerEnquiries);
router.post("/owner/mark-read", auth, role("OWNER"), controller.markAsRead);

// user-property-visit
router.post("/visit/create", auth, role("BUYER"), controller.siteVisit);
router.get("/visit/all-visit", auth, role("BUYER"), controller.myVisits);
router.post("/visit/cancel", auth, role("BUYER"), controller.visitCancel);

// owner-property-visit
router.get("/visit/allPropertyVisit", auth, role("OWNER"), controller.allPropertyVisist)
router.post("/visit/status/:id", auth, role("OWNER"), controller.updateVisitStatus);



module.exports = router;


