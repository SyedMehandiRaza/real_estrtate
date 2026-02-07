const { sendEmail } = require("../helper/sendEmail.helper");

exports.sendOtpEmail = async (to, otp) => {
  await sendEmail({
    to,
    subject: "Your Secure OTP for Verification",
    templateName: "email_template.ejs",
    data: {
      OTP: otp,
      YEAR: new Date().getFullYear(),
    },
  });
};

exports.sendCredentialsEmail = async (credentials) => {
  await sendEmail({
    to: credentials.email,
    subject: "Your Staff Login Credentials",
    templateName: "email_template_credentials.ejs",
    data: {
      NAME: credentials.name,
      EMAIL: credentials.email,
      PHONE: credentials.phone,
      PASSWORD: credentials.password,
      ROLE: credentials.role,
      YEAR: new Date().getFullYear(),
    },
  });
};

exports.sendCompanyCredentialsEmail = async (credentials) => {
  try {
    const displayName =
      credentials.contactPerson || credentials.companyName || "User";

    await sendEmail({
      to: credentials.companyEmail,
      subject: "Your Company Login Credentials",
      templateName: "email_template_companyCredentials.ejs",
      data: {
        NAME: displayName,
        EMAIL: credentials.companyEmail,
        PHONE: credentials.phoneNumber || "",
        PASSWORD: credentials.password,
        YEAR: new Date().getFullYear(),
      },
    });
  } catch (error) {
    console.error(error);
    return res.redirect(req.get("Referer"));
  }
};
