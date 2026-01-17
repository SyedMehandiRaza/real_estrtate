const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASS,
  },
});

exports.sendOtpEmail = async (to, otp) => {
    try {
      console.log("inside the nodemailer");
      const templatePath = path.join(__dirname, "../../public/email_template/email_template.html");

      let html = fs.readFileSync(templatePath, "utf-8");

      html = html
      .replace(/{{OTP}}/g, otp)
      .replace(/{{YEAR}}/g, new Date().getFullYear());

      await transporter.sendMail({
        from: `"Real Estate" <${process.env.USER_EMAIL}>`,
        to,
        subject: "Your Secure OTP for Verification",
        html
      });
  } catch (error) {
    console.error("error from sendOtpEmail",error);
    return res.redirect("/verify")
  }
};

