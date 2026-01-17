const { Property, PropertyMedia } = require("../models");
const cloudinary = require("../config/cloudinary");
const { Op } = require("sequelize");

exports.renderLandingPage = async (req, res) => {
  try {
    const properties = await Property.findAll({
      include: {
        model: PropertyMedia,
        as: "media",
      },
      order: [["createdAt", "DESC"]],
      limit: 6,
    });

    const formattedProperties = properties.map(p => {
      const media = p.media || [];
      const thumbnail = media.find(m => m.type === "IMAGE")?.url;

      return {
        ...p.toJSON(),
        thumbnail,
      };
    });

    return res.render("main/Landing_Page/index", {
      properties: formattedProperties,
      user: req.user || null,
    });

  } catch (error) {
    console.error("Home render error", error);
    return res.status(500).send("Internal Server Error");
  }
};

exports.renderPropertyDetail = async (req, res) => {
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
      return res.status(404).render("errors/404");
    }

    const media = property.media.map(m => ({
      type: m.type,
      url: m.url
    }))

    return res.render("main/Landing_Page/Prop_detail.ejs", {
      property,
      media
    });

  } catch (error) {
    console.error("Property detail error", error);
    return res.status(500).send("Internal Server Error");
  }
};

exports.filterController = async (req, res) => {
  try {
    const { purpose, keyword } = req.query;

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

    console.log(properties)
    return res.json(properties);

  } catch (error) {
    console.error("Filter error:", error);
    return res.status(500).json({ error: error.message });
  }
};