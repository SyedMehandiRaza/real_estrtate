const { User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { sendOtpEmail } = require("../services/mail.service");

function generateToken(user, res) {
  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name},
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax", 
    secure: false,    
    maxAge: 7 * 24 * 60 * 60 * 1000 
  });

  return token;
}

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.renderLogin = (req, res) => {
  try {
    res.render("login/login.ejs");
  } catch (error) {
    console.error("error in render login --------->", error);
    req.flash("error", "Something went wrong");
    return res.redirect("/login");
  }
};

exports.renderRegister = (req, res) => {
  try {
    res.render("buyerSignup/signup.ejs");
  } catch (error) {
    console.error("error in render register --------->", error);
    req.flash("error", "Something went wrong");
    return res.redirect("/register");
  }
};

exports.renderverify_otp = ( req, res) => {
  res.render("buyerSignup/verifyOtp.ejs", {email: req.session.otpEmail})
}

exports.selectCountry = ( req, res) => {
  res.render("buyerSignup/selectCountry.ejs", {email: req.session.otpEmail})
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const exist = await User.findOne({ where: { email } });
    if (exist) {
      req.flash("error", "User already exists");
      return res.redirect("/login");
    }

    const hashPass = await bcrypt.hash(password, 10);
    const userRole = role || "BUYER";

    const user  = await User.create({
      name,
      email,
      password: hashPass,
      phone,
      role: userRole,
      isVerified: false
    });
    generateToken(user, res)

    const otp = generateOtp();
    

    req.session.otp = otp;
    req.session.otpEmail = email;

    await sendOtpEmail(email, otp);
    req.flash("success", "OTP sent to your email");
    return res.redirect("/verify");

  } catch (error) {
    console.error(error);
    req.flash("error", "Something went wrong");
    res.redirect("/register");
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // if (!email || !password) {
    //   req.flash("error", "All fields are required");
    //   return res.redirect("/login");
    // }

    const user = await User.findOne({
      where: {
        [Op.or]: [{ email }, { phone: email }]
      }
    });

    if (!user) {
      req.flash("error", "Invalid credentials");
      return res.redirect("/login");
    }

    generateToken(user, res);

    req.flash("success", "Login successful");
    return res.redirect("/dashboard");

  } catch (error) {
    console.error(error);
    req.flash("error", "Something went wrong");
    return res.redirect("/login");
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("token");
    req.flash("success", "Logout Successfully");
    res.redirect("/login");
  } catch (error) {
    console.error("error in logout controller -------->", error);
    req.flash("error", "something went wrong");
    return res.redirect("back");
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const otp = 
      req.body.o1 +
      req.body.o2 +
      req.body.o3 +
      req.body.o4 +
      req.body.o5 +
      req.body.o6;

    if (otp !== req.session.otp) {
      req.flash("error", "Invalid OTP");
      return res.redirect("/verify");
    }

    const user = await User.findOne({
      where: { email: req.session.otpEmail }
    });

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/register");
    }

    // Mark user as verified
    user.isVerified = true;
    await user.save();
    
    req.session.otp = null;


    req.flash("success", "Account verified successfully!");
    return res.redirect("/country");

  } catch (error) {
    console.error("Verify OTP error:", error);
    req.flash("error", "Something went wrong");
    return res.redirect("/verify");
  }
};

exports.updateCountry = async (req, res) => {
  try {
    const { country } = req.body;

    const user = await User.findOne({
      where: { email: req.session.otpEmail || req.user?.email }
    });

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/login");
    }

    user.country = country;
    await user.save();
    
    req.session.otpEmail = null;

    req.flash("success", "Country updated successfully");
    return res.redirect("/land");

  } catch (error) {
    console.error(error);
    req.flash("error", "Something went wrong");
    return res.redirect("/country");
  }
};
