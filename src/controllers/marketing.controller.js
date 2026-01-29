const { Property, Marketing, PropertyMedia } = require("../models");

exports.promoteProperty = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);

    const { propertyId, platforms, promotionType } = req.body;
    const userId = req.user.id;

    const property = await Property.findOne({
      where: { id: propertyId, ownerId: userId },
    });

    if (!property) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized property access",
      });
    }

    const marketing = await Marketing.findOne({
      where: { propertyId, userId },
    });

    if (marketing) {
      marketing.platforms = platforms;
      marketing.promotionType = promotionType;
      marketing.isPromoted = true;
      await marketing.save();

      return res.json({
        success: true,
        message: "Marketing updated",
        data: marketing,
      });
    }

    const mar = await Marketing.create({
      propertyId,
      userId,
      platforms,
      promotionType,
      isPromoted: true,
    });

    return res.json({
      success: true,
      message: "Marketing created",
      data: mar,
    });
  } catch (error) {
    console.error(error);
    // return res.status(500).json({
    //   success: false,
    //   message: "Server error",
    // });
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

    // const promotionStatus = properties.map(prop => {
    //   const marketing = prop.marketing || {
    //     platforms: { instagram: false, facebook: false, youtube: false, linkedin: false },
    //     isPromoted: false
    //   };

    //   return platforms.map(plat => {
    //     const key = plat.toLowerCase();
    //     const isPromoted = marketing.platforms[key] || false;

    //     return {
    //       propertyName: prop.title,
    //       platform: plat,
    //       status: isPromoted ? "Posted" : marketing.isPromoted ? "In Progress" : "Not Promoted",
    //       dateOfPosting: isPromoted ? new Date().toLocaleDateString() : "-",
    //       platformPostedOn: isPromoted ? new Date().toLocaleDateString() : "-"
    //     };
    //   });
    // }).flat();

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

    res.render("dashboard/main/index", {
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
