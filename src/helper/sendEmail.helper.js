const nodemailer = require("nodemailer");
const path = require("path");
const ejs = require("ejs");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASS,
  },
});

const sendEmail = async ({ to, subject, templateName, data }) => {
  const templatePath = path.join(
    __dirname,
    `../../public/email_template/${templateName}`
  );

  const html = await ejs.renderFile(templatePath, data);

  await transporter.sendMail({
    from: `"Real Estate" <${process.env.USER_EMAIL}>`,
    to,
    subject,
    html,
  });
};

module.exports = { sendEmail };
