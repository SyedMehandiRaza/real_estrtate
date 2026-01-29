const { Op, Model, where } = require("sequelize");
const { User, Property, PropertyMedia } = require("../models");
const bcrypt = require("bcrypt");
const { sendCredentialsEmail } = require("../services/mail.service");
const PERMISSIONS = require("../constants/permissions");

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

    // console.log(ownerProperties, "ownjdjk");

    const totalPages = Math.ceil(totalStaff / limit);
    // console.log(staff, "staff memebers");

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
    // return res.redirect(req.get("Referer"));
    return res.status(200).json({
      success: true,
      message: "User Removed Successfully",
    });
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
    console.log("sdfghjkl")

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
        await sendCredentialsEmail(credentials).catch(console.error);;    
        req.flash("success", "Staff Added again successfully");
        return res.redirect(req.get("Referer"));
      }
      req.flash("error", "Staff member alred added");
      return res.redirect(req.get("Referer"));
    }
console.log("create user")
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
  