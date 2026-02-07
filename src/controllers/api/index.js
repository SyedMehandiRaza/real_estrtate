const { STATUS_CODES } = require("../../constants/statusCode");

const {
  successResponseData,
  errorResponseWithoutData,
  successResponseWithoutData,
} = require("../../helper/response.helper");

const {
  Property,
  PropertyMedia,
  User,
  Enquiry,
  SiteVisit,
} = require("../models");

const { Op, and, where } = require("sequelize");
const bcrypt = require("bcrypt");
const { generateOtp, generateToken } = require("../../helper/generate.helper");
const { sendOtpEmail } = require("../../helper/sendEmail.helper");

// authentication
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const exist = await User.findOne({ where: { email } });
    if (exist) {
      return errorResponseWithoutData(
        res,
        "User Already Exist",
        STATUS_CODES.FORBIDDEN
      );
    }

    const hashPass = await bcrypt.hash(password, 10);
    const userRole = role || "BUYER";

    const user = await User.create({
      name,
      email,
      password: hashPass,
      phone,
      role: userRole,
      isVerified: false,
    });
    generateToken(user, res);

    const otp = generateOtp();

    req.session.otp = otp;
    req.session.otpEmail = email;

    await sendOtpEmail(email, otp);
    return successResponseWithoutData(
      res,
      "User registered Successfully",
      STATUS_CODES.OK
    );
  } catch (error) {
    console.error(error);
    return errorResponseWithoutData(
      res,
      "Something went wrong,Please try again later",
      STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: {
        [Op.or]: [{ email }, { phone: email }],
      },
    });

    if (!user.isVerified) {
      return errorResponseWithoutData(
        res,
        "Please verify your account first",
        STATUS_CODES.FORBIDDEN
      );
    }

    if (!user)
      return errorResponseWithoutData(
        res,
        "Invalid Credentials",
        STATUS_CODES.NOT_FOUND
      );

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return errorResponseWithoutData(
        res,
        "Invalid Credentials",
        STATUS_CODES.CONFLICT
      );
    const token = generateToken(user, res);

    return successResponseData(res, "User Login Successfully", {
      user,
      token,
    });
  } catch (error) {
    console.error(error);
    return errorResponseWithoutData(
      res,
      "Something went wrong",
      STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }
};
exports.verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    if (otp !== req.session.otp) {
      return errorResponseWithoutData(
        res,
        "Invalid Otp",
        STATUS_CODES.CONFLICT
      );
    }
    const user = await User.findOne({
      where: { email: req.session.otpEmail },
    });
    if (!user) {
      return errorResponseWithoutData(
        res,
        "User Not Found",
        STATUS_CODES.NOT_FOUND
      );
    }
    user.isVerified = true;
    await user.save();
    req.session.otp = null;
    return successResponseWithoutData(res, "User Verified", STATUS_CODES.OK);
  } catch (error) {
    console.error("Verify OTP error:", error);
    return errorResponseWithoutData(
      res,
      "Somthing went wrong, Please try again",
      STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }
};
exports.updateCountry = async (req, res) => {
  try {
    const { country } = req.body;
    const user = await User.findOne({
      where: { email: req.session.otpEmail || req.user?.email },
    });
    if (!user) {
      return errorResponseWithoutData(
        res,
        "User not found",
        STATUS_CODES.NOT_FOUND
      );
    }
    user.country = country;
    await user.save();
    req.session.otpEmail = null;
    return successResponseWithoutData(
      res,
      "User Registered Successfully",
      STATUS_CODES.OK
    );
  } catch (error) {
    console.error(error);
    return errorResponseWithoutData(
      res,
      "something went wrong",
      STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }
};
exports.changePassword = async (req, res) => {
  try {
    const { newPassword, confirmNewPassword, password } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);

    if (newPassword !== confirmNewPassword)
      return errorResponseWithoutData(res, "password do not match");

    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return errorResponseWithoutData(
        res,
        "Something Went Wrong",
        STATUS_CODES.CONFLICT
      );

    const hashPass = await bcrypt.hash(newPassword, 10);
    await User.update({ password: hashPass }, { where: { id: userId } });

    return successResponseWithoutData(
      res,
      "Password Updated Successfully",
      STATUS_CODES.OK
    );
  } catch (error) {
    console.error(error);
    return errorResponseWithoutData(
      res,
      " something went wrong ",
      STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }
};

// user-property
exports.properties = async (req, res) => {
  try {
    const properties = await Property.findAll({
      include: [
        {
          model: PropertyMedia,
          as: "media",
          where: { type: "IMAGE" },
          required: false,
          separate: true,
          limit: 1,
          order: [["createdAt", "ASC"]],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 6,
    });

    return successResponseData(res, "Properties fetched successfully", {
      properties,
      user: req.user || null,
    });
  } catch (error) {
    console.error("error in properties", error);
    return errorResponseWithoutData(
      res,
      "Something went wrong, Please try again later",
      STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }
};
exports.propertyDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findOne({
      where: { id },
      include: {
        model: PropertyMedia,
        as: "media",
      },
    });

    if (!property) {
      return errorResponseWithoutData(
        res,
        "No Property found",
        STATUS_CODES.NOT_FOUND
      );
    }

    return successResponseData(res, "Property fetched successfully", property);
  } catch (error) {
    console.error("Property detail error", error);
    return errorResponseWithoutData(
      res,
      "Something went wrong, Please try again later",
      STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }
};
exports.filterController = async (req, res) => {
  try {
    const { keyword } = req.query;

    let whereCondition = {};

    if (keyword) {
      whereCondition[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } },
        { address: { [Op.like]: `%${keyword}%` } },
      ];
    }

    const properties = await Property.findAll({
      where: whereCondition,
      include: { model: PropertyMedia, as: "media" },
    });
    return successResponseData(
      res,
      "Properties fetched successfully",
      properties
    );
  } catch (error) {
    console.error("Filter error:", error);
    return errorResponseWithoutData(
      res,
      "Something went wrong, Please try again later",
      STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }
};
exports.fetchPropertyByPurpose = async (req, res) => {
  try {
    const limit = 5;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const { purpose } = req.body;

    const { rows: properties, count } = await Property.findAndCountAll({
      where: {
        purposeType: purpose,
        status: "ACTIVE",
      },
      include: [
        {
          model: PropertyMedia,
          as: "media",
          required: false,
        },
        {
          model: User,
          as: "owner",
          attributes: ["id", "email", "name", "phone"],
        },
      ],
      limit,
      offset,
    });

    const pages = Math.ceil(count / limit);

    return successResponseData(res, { properties, pages }, "", STATUS_CODES.OK);
  } catch (error) {
    console.error(error);
    return errorResponseWithoutData(
      res,
      "internal server error",
      STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }
};

// user-property enquiry
exports.enquiries = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId, message } = req.body;

    if (!propertyId || !message) {
      return errorResponseWithoutData(
        res,
        "All credentials required",
        STATUS_CODES.NOT_FOUND
      );
    }

    const existingEnquiry = await Enquiry.findOne({
      where: { userId, propertyId },
    });

    if (existingEnquiry && existingEnquiry.status === "ACTIVE") {
      return errorResponseWithoutData(
        res,
        "Your enquiry is already opened",
        STATUS_CODES.FORBIDDEN
      );
    }

    const newEnquiry = await Enquiry.create({
      userId,
      propertyId,
      message,
      status: "ACTIVE",
    });

    return successResponseData(
      res,
      "Enquiry created successfully",
      newEnquiry,
      STATUS_CODES.CREATED
    );
  } catch (error) {
    console.error(error);
    return errorResponseWithoutData(
      res,
      "Internal server error, something went wrong",
      STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }
};
exports.getEnquiries = async (req, res) => {
  try {
    const userId = req.user.id;

    const enquiries = await Enquiry.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    if (enquiries.length === 0) {
      return errorResponseWithoutData(
        res,
        "No enquiries found",
        STATUS_CODES.NOT_FOUND
      );
    }

    return successResponseData(
      res,
      "Fetched all enquiries",
      enquiries,
      STATUS_CODES.OK
    );
  } catch (error) {
    console.error(error);
    return errorResponseWithoutData(
      res,
      "Internal server error, something went wrong",
      STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }
};
exports.getEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const existingEnquiry = await Enquiry.findOne({
      where: {
        userId,
        propertyId: id,
      },
      order: [["createdAt", "DESC"]],
    });

    if (!existingEnquiry) {
      return errorResponseWithoutData(
        res,
        "no enquiry is found",
        STATUS_CODES.FORBIDDEN
      );
    }

    return successResponseData(
      res,
      "your enquiry",
      existingEnquiry,
      STATUS_CODES.OK
    );
  } catch (error) {
    console.error(error);
    return errorResponseWithoutData(
      res,
      "Internal Server Error, something went wrong",
      STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }
};

// ownerProperty - enquiry
exports.getOwnerEnquiries = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const enquiries = await Enquiry.findAll({
      attributes: ["userId", "propertyId", "message"],
      include: [
        {
          model: Property,
          as: "property",
          attributes: [],
          where: { ownerId },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (enquiries.length === 0) {
      return errorResponseWithoutData(
        res,
        "No enquiries found for your properties",
        STATUS_CODES.NOT_FOUND
      );
    }

    return successResponseData(
      res,
      "Fetched all enquiries for your properties",
      enquiries,
      STATUS_CODES.OK
    );
  } catch (error) {
    console.error(error);
    return errorResponseWithoutData(
      res,
      "Internal Server Error",
      STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }
};
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;
    const enquiry = await Enquiry.findByPk(id);
    if (!enquiry)
      return errorResponseWithoutData(
        res,
        "Enquiry Not Found",
        STATUS_CODES.NOT_FOUND
      );

    enquiry.status = "INACTIVE";
    await enquiry.save();
    return successResponseWithoutData(res, "Marked as read", STATUS_CODES.OK);
  } catch (error) {
    console.error(error);
    return errorResponseWithoutData(res, "Internal server error");
  }
};

// user-site-visit
exports.siteVisit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { visit_date, visit_time, propertyId } = req.body;
    const visit = await SiteVisit.findOne({
      where: { userId, propertyId },
    });
    if (visit)
      return errorResponseWithoutData(
        res,
        "Visit already schedule",
        STATUS_CODES.CONFLICT
      );
    const newVisit = await SiteVisit.create({
      propertyId,
      visit_time,
      visit_date,
      userId,
      status: "PENDING",
    });
    return successResponseData(
      res,
      "Visit Scheduled is pending",
      newVisit,
      STATUS_CODES.CREATED
    );
  } catch (error) {
    console.error(error);
    return errorResponseWithoutData(
      res,
      "Internal serever error, Please try again later"
    );
  }
};
exports.visitCancel = async (req, res) => {
  try {
    const { id } = req.params;
    const visit = await SiteVisit.findOne({
      where: { id },
      attributes: ["id", "status", "userId"],
    });

    if (!visit)
      return errorResponseWithoutData(
        res,
        "Visit not found",
        STATUS_CODES.NOT_FOUND
      );

    if (visit.userId !== req.user.id)
      return errorResponseWithoutData(
        res,
        "You cannot cancel this visit",
        STATUS_CODES.FORBIDDEN
      );

    visit.status = "CANCELLED";
    await visit.save();

    return successResponseData(
      res,
      "Visit cancelled successfully",
      visit,
      STATUS_CODES.OK
    );
  } catch (error) {
    console.error(error);
    return errorResponseWithoutData(
      res,
      "Internal server error, please try again",
      STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }
};
exports.myVisits = async (req, res) => {
  try {
    const userId = req.user.id;
    const visits = await SiteVisit.findAll({
      where: { userId },
    });
    if (!visits)
      return errorResponseWithoutData(
        res,
        "no visits found",
        STATUS_CODES.NOT_FOUND
      );
    return successResponseData(res, "All Visits", visits, STATUS_CODES.OK);
  } catch (error) {
    console.error(error);
    return errorResponseWithoutData(
      res,
      "Internal server error, peae try again",
      STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }
};

// owner-site-visit
exports.allPropertyVisist = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const visits = await SiteVisit.findAll({
      include: [
        {
          model: Property,
          where: { ownerId },
          attributes: ["id", "title"],
        },
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (visits.length === 0)
      return errorResponseWithoutData(res, "No visits", STATUS_CODES.NOT_FOUND);

    return successResponseData(
      res,
      "all Visit fetched",
      visits,
      STATUS_CODES.OK
    );
  } catch (error) {
    console.error(error);
    return errorResponseWithoutData(
      res,
      "Internal Server error, something went wrong"
    );
  }
};
exports.updateVisitStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const ownerId = req.user.id;

    if (!["CONFIRMED", "CANCELLED"].includes(status)) {
      return errorResponseWithoutData(
        res,
        "Invalid status",
        STATUS_CODES.BAD_REQUEST
      );
    }

    const visit = await SiteVisit.findByPk(id);
    if (!visit)
      return errorResponseWithoutData(
        res,
        "Visit not found",
        STATUS_CODES.NOT_FOUND
      );

    const property = await Property.findByPk(visit.propertyId);
    if (!property || property.ownerId !== ownerId) {
      return errorResponseWithoutData(
        res,
        "You are not allowed to update this visit",
        STATUS_CODES.FORBIDDEN
      );
    }

    if (visit.status !== "PENDING") {
      return errorResponseWithoutData(
        res,
        "Visit already processed",
        STATUS_CODES.CONFLICT
      );
    }

    visit.status = status;
    await visit.save();

    return successResponseData(
      res,
      `Visit ${status.toLowerCase()} successfully`,
      visit,
      STATUS_CODES.OK
    );
  } catch (error) {
    console.error(error);
    return errorResponseWithoutData(
      res,
      "Internal server error",
      STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }
};