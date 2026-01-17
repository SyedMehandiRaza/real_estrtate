const express = require("express");
const authController = require('../controllers/auth.controller');
const { loginSchema, registerSchema } = require("../validor/auth.validator");
const validate = require("../middleware/validate.middleware");
const auth =  require("../middleware/auth.middleware")



const router = express.Router();

router.get('/login', authController.renderLogin);
router.post('/login', validate(loginSchema), authController.login)

router.get('/register', authController.renderRegister);
router.post('/register', validate(registerSchema), authController.register)

router.get("/verify", authController.renderverify_otp)
router.post("/verify-otp", authController.verifyOtp)


router.get("/country", authController.selectCountry)
router.post("/update-country", authController.updateCountry);


router.post('/logout', authController.logout)


module.exports = router;





























// https://chatgpt.com/c/6958cf2d-fe6c-8324-981b-85aff9cd10bd