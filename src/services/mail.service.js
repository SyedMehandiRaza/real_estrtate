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

// sending credential to staff mail

exports.sendCredentialsEmail = async (credentials) => {
  try {
    console.log("Sending staff credentials email");

    const templatePath = path.join(
      __dirname,
      "../../public/email_template/email_template_credentials.html"
    );

    let html = fs.readFileSync(templatePath, "utf-8");

    html = html
      .replace(/{{NAME}}/g, credentials.name)
      .replace(/{{EMAIL}}/g, credentials.email)
      .replace(/{{PHONE}}/g, credentials.phone)
      .replace(/{{PASSWORD}}/g, credentials.password)
      .replace(/{{ROLE}}/g, credentials.role)
      .replace(/{{YEAR}}/g, new Date().getFullYear());

    await transporter.sendMail({
      from: `"Real Estate" <${process.env.USER_EMAIL}>`,
      to: credentials.email,
      subject: "Your Staff Login Credentials",
      html
    });

    console.log("Credentials email sent successfully");
  } catch (error) {
    console.error("Error sending credentials email:", error);
  }
};


exports.sendCompanyCredentialsEmail = async (credentials) => {
  try {
    console.log("Sending company credentials email", credentials);

    const templatePath = path.join(
      __dirname,
      "../../public/email_template/email_template_companyCredentials.html"
    );

    let html = fs.readFileSync(templatePath, "utf-8");

    const displayName =
      credentials.contactPerson ||
      credentials.companyName ||
      "User";

    html = html
      .replace(/{{NAME}}/g, displayName)
      .replace(/{{EMAIL}}/g, credentials.companyEmail)
      .replace(/{{PHONE}}/g, credentials.phoneNumber || "")
      .replace(/{{PASSWORD}}/g, credentials.password)
      .replace(/{{YEAR}}/g, new Date().getFullYear());

    await transporter.sendMail({
      from: `"Real Estate" <${process.env.USER_EMAIL}>`,
      to: credentials.companyEmail,
      subject: "Your Company Login Credentials",
      html
    });

    console.log("Company credentials email sent");

  } catch (error) {
    console.error("Error sending company credentials email:", error);
  }
};
