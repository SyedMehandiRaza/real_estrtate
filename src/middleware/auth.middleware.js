const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.cookies.token; 
    if (!token) {
      req.flash("error", "Please login to continue");
      return res.redirect("/login"); 
    }

    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    console.error(error);
    req.flash("error", "Session expired, login again");
    return res.redirect("/login");
  }
};
