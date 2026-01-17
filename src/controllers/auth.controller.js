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

// checked by postman
// exports.register = async (req, res) => {
//   try {
//     const { name, email, password, phone, role } = req.body;

//     const exist = await User.findOne({ where: { email } });
//     if (exist) {
//       req.flash("error", "user already registered with this email");
//       return res.redirect('/login');
//       // return res.status(401).json("already registered");
//     }
//     const hashPass = await bcrypt.hash(password, 10);
//     const userRole = role || "BUYER"
//     const user = await User.create({
//       name,
//       email,
//       password: hashPass,
//       phone,
//       role: userRole
//     });
//     const token = generateToken(user, res);

//     req.flash("success", "User registered successfully");

//     return res.redirect('/verify');
//   } catch (error) {
//     console.error("error in register controller -------->", error);
//     req.flash("error", "something went wrong");
//     // return res.redirect('/register')
//     return res.status(500).json("something went wrong");
//   }
// };

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

    console.log("user create before")
    const user  = await User.create({
      name,
      email,
      password: hashPass,
      phone,
      role: userRole,
      isVerified: false
    });
    console.log("user create")
    generateToken(user, res)

    const otp = generateOtp();
    
    console.log("otp create", otp)

    // Store OTP in session
    req.session.otp = otp;
    req.session.otpEmail = email;

    console.log("SESSION SET:", req.session);


    console.log("sending email")
    await sendOtpEmail(email, otp);

    console.log("email send ")
    req.flash("success", "OTP sent to your email");
    res.redirect("/verify");

  } catch (error) {
    console.error(error);
    req.flash("error", "Something went wrong");
    res.redirect("/register");
  }
};

// checked by postman
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash("error", "All fields are required");
      return res.redirect("/login");
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [{ email }, { phone: email }]
      }
    });

    if (!user) {
      req.flash("error", "Invalid credentials");
      return res.redirect("/login");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
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

// exports.login = async (req, res) => {
//   try {
//     const { email, phone, password } = req.body;
//     const orCondition = [];
//     if (email) orCondition.push({ email });
//     if (phone) orCondition.push({ phone });

//     if (orCondition.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Email or phone is required",
//       });
//     }
//     const user = await User.findOne({
//       where: {
//         [Op.or]: orCondition,
//       },
//     });
//     if (!user) {
//       req.flash("error", "Invalid Credentials");
//     //   return res.redirect("/login");
//         return res.status(400).json("Invalid credentials");
//     }
//     const match = await bcrypt.compare(password, user.password);
//     if (!match) {
//       req.flash("error", "Invalid Credentials");
//     //   return res.redirect("/login");
//       return res.status(400).json("Password do not match")
//     }
//     const token = generateToken(user, res);
//     req.flash("success", "Login Successfully");
//     // return res.redirect("/dashboard");
//     return res.status(200).json({
//         success: true,
//         user,
//         token
//     })
//   } catch (error) {
//     console.error("Error in login controller -------->", error);
//     req.flash("error", "Something went wrong");
//     // return res.redirect("/login");
//     return res.status(500).json("something wen wrong")
//   }
// };

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
    console.log("inside verifying.............. ");
    
    const otp = 
      req.body.o1 +
      req.body.o2 +
      req.body.o3 +
      req.body.o4 +
      req.body.o5 +
      req.body.o6;

    console.log("matching otp's",otp, req.session.otp)
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
