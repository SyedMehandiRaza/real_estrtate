const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const {
  sendOtpEmail,
  sendCredentialsEmail,
  sendCompanyCredentialsEmail,
} = require("../../services/mail.service");
const { generateOtp, generateToken } = require("../../helper/generate.helper");
const {
  Company,
  Property,
  CompanyPropertyContract,
  PropertyMedia,
  User,
  Marketing,
  PropertyConfiguration,
  Payment,
  Subscription,
  Plan,
  sequelize,
} = require("../../models");

const {
  successResponseData,
  successResponseWithoutData,
  errorResponseWithoutData,
} = require("../../helper/response.helper");

const PERMISSIONS = require("../../constants/permissions");
const crypto = require("crypto");
const razorpay = require("../../config/razorpay");


exports.renderLogin = (req, res) => {
  try {
    return res.render("login/login.ejs");
  } catch (error) {
    console.error("error in render login --------->", error);
    req.flash("error", "Something went wrong");
    return res.redirect("/login");
  }
};

exports.renderRegister = (req, res) => {
  try {
    return res.render("buyerSignup/signup.ejs");
  } catch (error) {
    console.error("error in render register --------->", error);
    req.flash("error", "Something went wrong");
    return res.redirect("/register");
  }
};

exports.renderverify_otp = (req, res) => {
  return res.render("buyerSignup/verifyOtp.ejs", {
    email: req.session.otpEmail,
  });
};

exports.selectCountry = (req, res) => {
  return res.render("buyerSignup/selectCountry.ejs", {
    email: req.session.otpEmail,
  });
};

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
    req.flash("success", "OTP sent to your email");
    return res.redirect("/verify");
  } catch (error) {
    console.error(error);
    req.flash("error", "Something went wrong");
    res.redirect("/register");
  }
};

exports.login = async (req, res) => {
  //  password is not checked here becuase i forgot my password;
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: {
        [Op.or]: [{ email }, { phone: email }],
      },
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
    // const otp =
    //   req.body.o1 +
    //   req.body.o2 +
    //   req.body.o3 +
    //   req.body.o4 +
    //   req.body.o5 +
    //   req.body.o6;
    const { otp } = req.body;

    if (otp !== req.session.otp) {
      req.flash("error", "Invalid OTP");
      return res.redirect("/verify");
    }

    const user = await User.findOne({
      where: { email: req.session.otpEmail },
    });

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/register");
    }

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
      where: { email: req.session.otpEmail || req.user?.email },
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

exports.renderFaciltiyManagement = async (req, res) => {
  try {
    const ownerId = req.user.id || req.user.ownerId;

    const companies = await Company.findAll({
      where: { addedBy: ownerId },

      attributes: [
        "id",
        "companyName",
        "contactPerson",
        "companyEmail",
        "phoneNumber",
        "isTerminated",
      ],

      include: [
        {
          model: CompanyPropertyContract,
          as: "propertyContracts",
          attributes: ["id", "startDate", "endDate", "notes"],
          include: [
            {
              model: Property,
              as: "property",
              attributes: ["id", "title"],
            },
          ],
        },
      ],
    });

    return res.render("dashboard/main/index.ejs", {
      companies,
      pageTitle: "Facility Management",
      activePage: "facility",
    });
  } catch (error) {
    console.error(error);
    return res.redirect(req.get("Referer"));
  }
};

exports.renderAddFacility = async (req, res) => {
  try {
    const ownerId = req.user.id || req.user.ownerId;
    const properties = await Property.findAll({
      where: { ownerId },
      attributes: ["id", "title"],
    });
    return res.render("dashboard/main/index.ejs", {
      properties,
      pageTitle: "Add Facality",
      activePage: "addfacility",
    });
  } catch (error) {
    console.error(error);
    return res.redirect(req.get("Referer"));
  }
};

exports.addFacility = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      companyName,
      contactPerson,
      companyEmail,
      companyAddress,
      phoneNumber,
      startDate,
      endDate,
      notes,
      propertyIds,
    } = req.body;
    const document = req.file;
    const documentData = document
      ? {
          path: document.path,
          name: document.originalname,
          type: document.mimetype,
          size: document.size,
        }
      : null;

    const addedBy = req.user.role === "OWNER" ? req.user.id : req.user.ownerId;

    const existingCompany = await Company.findOne({
      where: { companyEmail },
      transaction: t,
    });

    const random = Math.floor(1000 + Math.random() * 9000);
    const passChar = (contactPerson || companyName || "COM").substring(0, 3);
    const password = `${passChar}@${random}`;
    const hashPass = await bcrypt.hash(password, 10);

    const credentials = {
      companyName,
      companyEmail,
      phoneNumber,
      password,
      contactPerson,
    };

    let company;

    if (existingCompany) {
      if (existingCompany.isTerminated === true) {
        existingCompany.companyName = companyName;
        existingCompany.phoneNumber = phoneNumber;
        existingCompany.password = hashPass;
        existingCompany.companyEmail = companyEmail;
        existingCompany.companyAddress = companyAddress;
        existingCompany.contactPerson = contactPerson;
        existingCompany.addedBy = addedBy;
        existingCompany.isTerminated = false;

        company = await existingCompany.save({ transaction: t });
      } else {
        await t.rollback();
        req.flash("error", "Company already exists");
        return res.redirect(req.get("Referer"));
      }
    } else {
      company = await Company.create(
        {
          companyName,
          addedBy,
          companyEmail,
          password: hashPass,
          phoneNumber,
          companyAddress,
          contactPerson,
          isTerminated: false,
        },
        { transaction: t }
      );
    }

    if (propertyIds && propertyIds.length > 0) {
      const contracts = propertyIds.map((pid) => ({
        companyId: company.id,
        propertyId: pid,
        startDate,
        endDate,
        notes,
        documents: documentData,
      }));

      await CompanyPropertyContract.bulkCreate(contracts, { transaction: t });
    }

    await t.commit();

    await sendCompanyCredentialsEmail(credentials);

    req.flash("success", "Company added with properties successfully");
    return res.redirect("/facility");
  } catch (error) {
    await t.rollback();
    console.error(error);
    req.flash("error", "Something went wrong");
    return res.redirect(req.get("Referer"));
  }
};

exports.terminate = async (req, res) => {
  try {
    const { companyId } = req.params;

    const company = await Company.findOne({
      where: { id: companyId },
    });

    if (!company) {
      req.flash("error", "Company not found");
      return res.redirect(req.get("Referer"));
    }

    company.isTerminated = !company.isTerminated;
    await company.save();

    req.flash("success", "success");
    return res.redirect(req.get("Referer"));
  } catch (error) {
    console.error(error);
    req.flash("error", "Something went wrong");
    return res.redirect(req.get("Referer"));
  }
};

// on working
exports.assignProperty = async (req, res) => {
  const t = null;

  try {
    const { companyId, propertyId, startDate, endDate, notes } = req.body;

    if (!companyId || !propertyId || !startDate || !endDate) {
      req.flash("error", "All fields are required");
      return res.redirect(req.get("Referer"));
    }

    t = await sequelize.transaction();
    const existing = await CompanyPropertyContract.findOne({
      where: { companyId, propertyId },
      transaction: t,
    });

    if (existing) {
      await t.rollback();
      req.flash("error", "Property already assigned to this company");
      return res.redirect(req.get("Referer"));
    }

    await CompanyPropertyContract.create(
      {
        companyId,
        propertyId,
        startDate,
        endDate,
        notes,
      },
      { transaction: t }
    );

    await t.commit();

    req.flash("success", "Property assigned successfully");
    return res.redirect(req.get("Referer"));
  } catch (error) {
    if (t) {
      await t.rollback();
    }
    console.error(error);
    req.flash("error", "Something went wrong");
    return res.redirect(req.get("Referer"));
  }
};

// exports.companyDetail = async (req, res) => {
//   try {
//     const { companyId } = req.params;
//     // const ownerId  = req.user.id || req.user.ownerId;

//     const company = await Company.findAll({
//       where: {id: companyId},
//       attributes: [
//         "id",
//         "companyName",
//         "contactPerson",
//         "companyEmail",
//         "phoneNumber",
//       ],

//       include: [
//         {
//           model: CompanyPropertyContract,
//           as: "propertyContracts",
//           attributes: ["id", "startDate", "endDate", "notes"],
//           include: [
//             {
//               model: Property,
//               as: "property",
//               attributes: ["id", "title","description","status", "locationArea", "city", "state"],
//               include: [
//                 {
//                   model: PropertyMedia,
//                   as: "media",
//                   attributes: ["id", "url"],
//                   where: { type: "IMAGE"},
//                   limit: 1
//                 }
//               ]
//             },
//           ],
//         },
//       ],
//     });

//     if (!company) {
//       return res.status(404).json({ message: "Company not found" });
//     }
//     return res.status(200).json(company);
//   } catch (err) {
//     console.error(err);
//     return res.redirect(req.get("Referer"));
//   }
// };

exports.promoteProperty = async (req, res) => {
  try {
    const { propertyId, platforms, promotionType } = req.body;
    const userId = req.user.id;

    const property = await Property.findOne({
      where: { id: propertyId, ownerId: userId },
    });

    if (!property) {
      return errorResponseWithoutData(res, "Unauthorized property access", 403);
    }

    const marketing = await Marketing.findOne({
      where: { propertyId, userId },
    });

    if (marketing) {
      marketing.platforms = platforms;
      marketing.promotionType = promotionType;
      marketing.isPromoted = true;
      await marketing.save();

      return successResponseData(res, "Marketing updated", marketing);
    }

    const mar = await Marketing.create({
      propertyId,
      userId,
      platforms,
      promotionType,
      isPromoted: true,
    });

    successResponseData(res, "Marketing created", mar);
  } catch (error) {
    console.error(error);
    return res.redirect(req.get("Referer"));
  }
};

exports.renderMarketing = async (req, res) => {
  try {
    const limit = 5;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const { count, rows: properties } = await Property.findAndCountAll({
      where: { ownerId: req.user.id },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Marketing,
          as: "marketing",
        },
        {
          model: PropertyMedia,
          as: "media",
        },
      ],
    });

    const totalPages = Math.ceil(count / limit);

    const platforms = ["instagram", "facebook", "youTube", "linkedIn"];

    const posts = properties
      .map((prop) => {
        const images = prop.media.filter((m) => m.type === "IMAGE");
        const videos = prop.media.filter((m) => m.type === "VIDEO");

        const postList = [];

        if (images.length === 1) {
          postList.push({
            type: "image",
            url: images[0].url,
            title: prop.title,
            location: prop.location,
            price: prop.price,
          });
        }

        if (images.length > 1) {
          postList.push({
            type: "carousel",
            urls: images.map((i) => i.url),
            title: prop.title,
            location: prop.location,
            price: prop.price,
          });
        }

        videos.forEach((video) => {
          postList.push({
            type: "video",
            url: video.url,
            title: prop.title,
            location: prop.location,
            price: prop.price,
          });
        });

        return postList;
      })
      .flat();

    const promotionStatus = properties
      .map((prop) => {
        const marketing = prop.marketing || {
          platforms: {
            instagram: false,
            facebook: false,
            youtube: false,
            linkedin: false,
          },
        };

        return platforms.map((plat) => {
          const key = plat.toLowerCase();
          const isPromoted = marketing.platforms[key] || false;

          return {
            propertyName: prop.title,
            platform: plat,
            status: isPromoted ? "Promoted" : "Not Promoted",
            dateOfPosting: isPromoted
              ? new Date(marketing.updatedAt).toLocaleDateString()
              : "-",

            platformPostedOn: isPromoted
              ? new Date(marketing.updatedAt).toLocaleDateString()
              : "-",
          };
        });
      })
      .flat();

    return res.render("dashboard/main/index", {
      posts,
      promotionStatus,
      properties,
      currentPage: page,
      totalPages,
      pageTitle: "Marketing",
      activePage: "marketing",
    });
  } catch (error) {
    console.error("error in renderMarketing:", error);
    req.flash("error", "Something went wrong");
    return res.redirect(req.get("Referer") || "/");
  }
};

exports.renderDashboard = async (req, res) => {
  try {
    return res.render("dashboard/main/index", {
      pageTitle: "Dashboard",
      activePage: "dashboard",
      user: req.user,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong");
    return res.redirect(req.get("Referer") || "/");
  }
};

exports.renderPropertyDetail = async (req, res) => {
  try {
    const propertyId = req.params.id;

    const property = await Property.findByPk(propertyId, {
      include: {
        model: PropertyMedia,
        as: "media",
      },
    });

    if (!property) {
      req.flash("error", "property not found");
      return res.redirect(req.get("Referer"));
    }

    const images = property.media
      .filter((m) => m.type === "IMAGE")
      .map((m) => m.url);

    const videos = property.media
      .filter((m) => m.type === "VIDEO")
      .map((m) => m.url);

    return res.render("dashboard/main/index", {
      property,
      images,
      videos,
      pageTitle: "My Property",
      activePage: "properties_detail",
      user: req.userowner,
    });
  } catch (error) {
    console.error(error);
    req.flash("error", "Server Error");
    return res.redirect(req.get("Referer"));
  }
};

exports.renderPropertyDashboard = async (req, res) => {
  try {
    const { keyword } = req.query;

    const whereCondition = { ownerId: req.user.id };

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
      order: [["createdAt", "DESC"]],
    });

    const formattedProperties = properties.map((p) => {
      const media = p.media || [];
      const thumbnail = media.find((m) => m.type === "IMAGE")?.url;
      return {
        ...p.toJSON(),
        thumbnail,
      };
    });

    return res.render("dashboard/main/index", {
      properties: formattedProperties,
      keyword: keyword || "",
      pageTitle: "My Property",
      activePage: "properties",
      user: req.user,
    });
  } catch (error) {
    console.error("error in property dashboard", error);
    req.flash("error", "something Went wrong");
    return res.redirect("/property");
  }
};

exports.renderAddProduct1 = (req, res) => {
  try {
    const flashError = req.flash("error");
    const flashSuccess = req.flash("success");

    console.log("FLASH ERROR:", flashError);

    return res.render("dashboard/main/index", {
      pageTitle: "Add Property",
      activePage: "properties_addProduct1",
      user: req.user,
      userForm: req.session.formData || {},
      error: flashError,
      success: flashSuccess,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong");
    return res.redirect(req.get("Referer") || "/");
  }
};

exports.renderAddProduct2 = (req, res) => {
  try {
    return res.render("dashboard/main/index", {
      pageTitle: "Add Property Deatil",
      activePage: "properties_addProduct2",
      user: req.user,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong");
    return res.redirect(req.get("Referer") || "/");
  }
};

exports.renderAddProduct3 = (req, res) => {
  try {
    return res.render("dashboard/main/index", {
      pageTitle: "Add Property Configaration",
      activePage: "properties_addProduct3",
      user: req.user,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong");
    return res.redirect(req.get("Referer") || "/");
  }
};

exports.renderAddProduct4 = (req, res) => {
  try {
    return res.render("dashboard/main/index", {
      pageTitle: "Add Property ",
      activePage: "properties_addProduct4",
      user: req.user,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong");
    return res.redirect(req.get("Referer") || "/");
  }
};

exports.renderAddProduct5 = (req, res) => {
  try {
    return res.render("dashboard/main/index", {
      pageTitle: "Add Property ",
      activePage: "properties_addProduct5",
      user: req.user,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong");
    return res.redirect(req.get("Referer") || "/");
  }
};

exports.renderAddProduct_submit = (req, res) => {
  try {
    const data = req.session.formData;
    console.log(data, "form data");
    return res.render("dashboard/main/index", {
      pageTitle: "Review & Submit",
      activePage: "properties_addProduct6",
      user: req.user,
      data,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong");
    return res.redirect(req.get("Referer") || "/");
  }
};

exports.submitStep1 = (req, res) => {
  try {
    req.session.formData = {};
    req.session.formData = { ...req.session.formData, ...req.body };
    res.redirect("/add_detail");
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong");
    return res.redirect(req.get("Referer") || "/");
  }
};

exports.submitStep2 = (req, res) => {
  try {
    console.log("Body data:", req.body);

    console.log("step 1 -> 2 data:", req.session.formData);
    req.session.formData = { ...req.session.formData, ...req.body };
    console.log("step 2 data:", req.session.formData);
    res.redirect("/add_config");
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong");
    return res.redirect(req.get("Referer") || "/");
  }
};

exports.submitStep3 = async (req, res) => {
  try {
    const uploadToCloudinary = require("../../middleware/cloudinaryUpload.middleware");

    let floorPlanUrl = null;

    if (req.files?.floorPlan) {
      const result = await uploadToCloudinary(
        req.files.floorPlan[0],
        "property/config"
      );
      floorPlanUrl = result.secure_url;
    }

    console.log("FULL DATA from step 2 to 3:", req.session.formData);
    req.session.formData = {
      ...req.session.formData,
      config: {
        ...req.body,
        floorPlan: floorPlanUrl,
      },
    };

    console.log("STEP-3 DATA:", req.body);
    console.log("FULL DATA:", req.session.formData);

    res.redirect("/add_upload");
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong");
    return res.redirect(req.get("Referer") || "/");
  }
};

exports.submitStep4 = async (req, res) => {
  try {
    const uploadToCloudinary = require("../../middleware/cloudinaryUpload.middleware");

    const uploadedImages = [];
    const uploadedVideos = [];

    if (req.files?.images) {
      for (const file of req.files.images) {
        const result = await uploadToCloudinary(file, "property/images");
        uploadedImages.push(result);
      }
    }

    if (req.files?.video) {
      for (const file of req.files.video) {
        const result = await uploadToCloudinary(file, "property/videos");
        uploadedVideos.push(result);
      }
    }

    req.session.formData = {
      ...req.session.formData,
      images: uploadedImages,
      video: uploadedVideos,
    };

    res.redirect("/add_docs");
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong");
    return res.redirect(req.get("Referer") || "/");
  }
};

exports.submitStep5 = (req, res) => {
  try {
    req.session.formData = { ...req.session.formData, ...req.body };
    res.redirect("/add_prop_submit");
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong");
    return res.redirect(req.get("Referer") || "/");
  }
};

exports.createProperty = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const data = req.session.formData;

    if (!data) {
      return res.redirect("/add");
    }

    const property = await Property.create(
      {
        ownerId: req.user.id,
        title: data.title,
        propertyType: data.type,
        purpose: data.purpose,
        status: data.status,
        city: data.city,
        state: data.state,
        country: data.country,
        locationArea: data.locationArea,
        zipCode: data.zipCode,
        address: data.address,
        area: data.area,
        noOfUnit: data.noOfUnit,
        noOfTower: data.noOfTower,
        noOfFloor: data.noOfFloor,
        price: data.price,
        yearBuilt: data.yearBuilt,
        builderName: data.builderName,
        description: data.description,
        amenities: data.amenities,
        constructionStatus: "READY",
      },
      { transaction: t }
    );

    if (data.config) {
      await PropertyConfiguration.create(
        {
          propertyId: property.id,
          configName: data.config.configName,
          configArea: data.config.configArea,
          totalUnits: data.config.totalUnits,
          availableUnits: data.config.availableUnits,
          price: data.config.price,
          floorPlan: data.config.floorPlan,
        },
        { transaction: t }
      );
    }

    if (data.images?.length) {
      for (const img of data.images) {
        await PropertyMedia.create(
          {
            propertyId: property.id,
            type: "IMAGE",
            url: img.secure_url || img.path,
          },
          { transaction: t }
        );
      }
    }

    if (data.video?.length) {
      for (const vid of data.video) {
        await PropertyMedia.create(
          {
            propertyId: property.id,
            type: "VIDEO",
            url: vid.secure_url || vid.path,
          },
          { transaction: t }
        );
      }
    }

    await t.commit();

    req.session.formData = null;

    res.redirect("/property");
  } catch (error) {
    await t.rollback();
    console.error("CREATE PROPERTY ERROR:", error);
    req.flash("error", "Please try again");
    return res.redirect(req.get("Referer"));
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { planId } = req.body;

    const plan = await Plan.findByPk(planId);
    if (!plan) return errorResponseWithoutData(res, "plan not found");

    const order = await razorpay.orders.create({
      amount: plan.price * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return successResponseData(res, "Order created", {
      order,
      key: process.env.RAZORPAY_KEY,
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong");
    return res.redirect(req.get("Referer"));
  }
};

exports.verifyPayment = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      planId,
      amount,
    } = req.body;

    const body = razorpayOrderId + "|" + razorpayPaymentId;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return errorResponseWithoutData(res, "Invalid Signature");
    }

    await Payment.create(
      {
        userId: req.user.id,
        planId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        amount,
        status: "success",
      },
      { transaction: t }
    );

    await Subscription.update(
      { status: "inactive" },
      {
        where: { userId: req.user.id, status: "active" },
        transaction: t,
      }
    );

    await Subscription.create(
      {
        userId: req.user.id,
        planId,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "active",
      },
      { transaction: t }
    );

    await t.commit();

    req.flash("Success", "Plan Activated");
    return res.redirect(req.get("Referer"));
  } catch (err) {
    await t.rollback();
    console.error(err);
    req.flash("error", "Payment verification failed");
    return res.redirect(req.get("Referer"));
  }
};

// perission check to alot staff
function permissionCheck(permissions = []) {
  const VALID = Object.values(PERMISSIONS);
  return permissions.filter((p) => VALID.includes(p));
}

exports.renderStaff = async (req, res) => {
  try {
    const limit = 6;
    const page = parseInt(req.query.q) || 1;
    const offset = (page - 1) * limit;

    const ownerId = req.user.role === "OWNER" ? req.user.id : req.user.ownerId;

    const { rows: staff, count: totalStaff } = await User.findAndCountAll({
      where: {
        ownerId,
        isDeleted: false,
      },
      attributes: [
        "id",
        "name",
        "role",
        "email",
        "phone",
        "status",
        "permissions",
        "createdAt",
      ],
      // include: [
      //   {
      //     model: Property,
      //     as: "properties",
      //     attributes: ["id", "title", "address"],
      //     where: { ownerId },
      //     required: false,

      //     include: [
      //       {
      //         model: PropertyMedia,
      //         as: "media",
      //         attributes: ["url", "type"],
      //         where: { type: "IMAGE" },
      //         required: false,
      //         limit: 1,
      //       },
      //     ],
      //   },
      // ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const ownerProperties = await Property.findAll({
      where: { ownerId },
      attributes: ["id", "title", "address"],
      include: [
        {
          model: PropertyMedia,
          as: "media",
          attributes: ["url", "type"],
          where: { type: "IMAGE" },
          required: false,
          limit: 1,
        },
      ],
    });

    const totalPages = Math.ceil(totalStaff / limit);

    return res.render("dashboard/main/index.ejs", {
      pageTitle: "Staff Management",
      activePage: "staff",
      staff,
      ownerProperties,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error("error from renderStaff", error);
    req.flash("error", "Something went wrong");
    return res.redirect(req.get("Referer"));
  }
};

// exports.addStaff = async (req, res) => {
//   try {
//     const { name, email, phone, role, permissions } = req.body;
//     const ownerId = req.user.role === "OWNER" ? req.user.id : req.user.ownerId;
//     const existingUser = await User.findOne({
//       where: { [Op.or]: [{ email }, { phone }] },
//     });

//     if (existingUser) {
//       req.flash("error", "Staff Member already registered");
//       return res.redirect(req.get("Referer"));
//     }

//     const random = Math.floor(1000 + Math.random() * 9000);
//     const passChar = name.substring(0, 3);
//     const password = `${passChar}@${random}`;

//     const hashPass = await bcrypt.hash(password, 10);

//     const checkedPermissions = permissionCheck(permissions);

//     await User.create({
//       name,
//       ownerId,
//       email,
//       password: hashPass,
//       phone,
//       role,
//       permissions: checkedPermissions,
//     });

//     const credentials = { name, email, phone, password, role };
//     sendCredentialsEmail(credentials);

//     req.flash("success", "Staff Added Successfully");
//     return res.redirect("/staff");
//   } catch (error) {
//     console.error(error);
//     req.flash("error", "Something went wrong");
//     return res.redirect(req.get("Referer"));
//   }
// };

exports.removeController = async (req, res) => {
  try {
    const { id } = req.params;

    await User.update({ isDeleted: true }, { where: { id } });

    req.flash("success", "User Deleted Successfully");
    return successResponseWithoutData(res, "User Removed Successfully");
  } catch (error) {
    console.error(error);
    req.flash("error", error.message);
    return res.redirect(req.get("Referer"));
  }
};

exports.addStaff = async (req, res) => {
  try {
    const { name, email, phone, role, permissions } = req.body;
    const ownerId = req.user.role === "OWNER" ? req.user.id : req.user.ownerId;
    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }, { phone }] },
    });
    console.log("req.body:", req.body);

    const checkedPermissions = permissionCheck(permissions);
    const random = Math.floor(1000 + Math.random() * 9000);
    const passChar = name.substring(0, 3);
    const password = `${passChar}@${random}`;
    const hashPass = await bcrypt.hash(password, 10);
    const credentials = { name, email, phone, password, role };
    console.log("sdfghjkl");

    if (existingUser) {
      if (existingUser.isDeleted === true) {
        existingUser.name = name;
        existingUser.phone = phone;
        existingUser.password = hashPass;
        existingUser.email = email;
        existingUser.role = role;
        existingUser.permissions = checkedPermissions;
        existingUser.isDeleted = false;
        await existingUser.save();
        await sendCredentialsEmail(credentials).catch(console.error);
        req.flash("success", "Staff Added again successfully");
        return res.redirect(req.get("Referer"));
      }
      req.flash("error", "Staff member alred added");
      return res.redirect(req.get("Referer"));
    }
    console.log("create user");
    await User.create({
      name,
      ownerId,
      email,
      password: hashPass,
      phone,
      role,
      permissions: checkedPermissions,
    });
    await sendCredentialsEmail(credentials).catch(console.error);

    req.flash("success", "Staff Added Successfully");
    return res.redirect("/staff");
  } catch (error) {
    console.error(error);
    req.flash("error", "Something went wrong");
    return res.redirect(req.get("Referer"));
  }
};
