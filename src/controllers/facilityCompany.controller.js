const { sendCompanyCredentialsEmail } = require("../services/mail.service");
const {
  Company,
  Property,
  CompanyPropertyContract,
  PropertyMedia,
  sequelize,
} = require("../models");
const bcrypt = require("bcrypt");

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
        "isTerminated"
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

    console.log(companies, "++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
    res.render("dashboard/main/index.ejs", {
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
    res.render("dashboard/main/index.ejs", {
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
        documents: documentData
      }));

      await CompanyPropertyContract.bulkCreate(contracts, { transaction: t });
    }

    await t.commit();

    await sendCompanyCredentialsEmail(credentials).catch(console.error);

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

exports.companyDetail = async (req, res) => {
  try {
    const { companyId } = req.params;
    // const ownerId  = req.user.id || req.user.ownerId;

    const company = await Company.findAll({
      where: {id: companyId},
      attributes: [
        "id",
        "companyName",
        "contactPerson",
        "companyEmail",
        "phoneNumber",
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
              attributes: ["id", "title","description","status", "locationArea", "city", "state"],
              include: [
                {
                  model: PropertyMedia,
                  as: "media",
                  attributes: ["id", "url"],
                  where: { type: "IMAGE"},
                  limit: 1
                }
              ]
            },
          ],
        },
      ],
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    console.log(company);
    return res.json(company);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// on working 
exports.assignProperty = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      companyId,
      propertyId,
      startDate,
      endDate,
      notes
    } = req.body;

    if (!companyId || !propertyId || !startDate || !endDate) {
      await t.rollback();
      req.flash("error", "All fields are required");
      return res.redirect(req.get("Referer"));
    }

    const existing = await CompanyPropertyContract.findOne({
      where: { companyId, propertyId },
      transaction: t
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
    await t.rollback();
    console.error(error);
    req.flash("error", "Something went wrong");
    return res.redirect(req.get("Referer"));
  }
};