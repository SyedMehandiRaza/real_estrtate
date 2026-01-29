const express = require("express");
const router = express.Router();


router.get("/subscription", (req, res) => {
  try {
    res.render("dashboard/main/index.ejs",{
    pageTitle: "Subscription",
    activePage: "subscription",
  })
  } catch (error) {
    console.error(error);
    req.flash("error", "something went wrong");
    return res.redirect(req.get("Referer"));    
  }
});
module.exports = router;