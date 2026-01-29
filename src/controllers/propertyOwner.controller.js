const { Property, PropertyMedia, PropertyConfiguration, sequelize} = require("../models");
const { Op } = require("sequelize");
const flash = require("connect-flash");

exports.renderDashboard = async (req, res) => {
  try {
    res.render("dashboard/main/index", {
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
      req.flash('error','property not found')
      return res.redirect(req.get("Referer"));
    }

    const images = property.media
      .filter((m) => m.type === "IMAGE")
      .map((m) => m.url);

    const videos = property.media
      .filter((m) => m.type === "VIDEO")
      .map((m) => m.url);

    res.render("dashboard/main/index", {
      property,
      images,
      videos,
      pageTitle: "My Property",
      activePage: "properties_detail",
      user: req.userowner,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
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

    res.render("dashboard/main/index", {
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

    res.render("dashboard/main/index", {
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
    res.render("dashboard/main/index", {
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
    res.render("dashboard/main/index", {
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
    res.render("dashboard/main/index", {
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
    res.render("dashboard/main/index", {
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
    res.render("dashboard/main/index", {
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
    const uploadToCloudinary = require("../middleware/cloudinaryUpload.middleware");

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
    const uploadToCloudinary = require("../middleware/cloudinaryUpload.middleware");

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
    // res.status(500).send("Property creation failed. Please try again.");
    return res.redirect(req.get("Referer"));
  }
};
