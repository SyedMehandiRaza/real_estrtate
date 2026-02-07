const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require("express-session");
const flash = require("connect-flash");
// const authRoutes = require("../src/routes/auth.route");
// const propertyRoute = require("../src/routes/property.route");
// const propOwnerRoute = require("../src/routes/propertyOwner.route")
// const marketRoutes = require("../src/routes/marketing.route")
// const staffRoutes = require("../src/routes/staffManagement.route");
// const facalityRoutes = require("../src/routes/facilityCompany.route");
// const subscriptionRoute = require("../src/routes/subscription.route");
// const razorpayRoute = require("../src/routes/razorpay.route");
const routes = require("../src/routes/admin/index")

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 21052001,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 10 }
  }));

app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// app.use(authRoutes);
// app.use(propertyRoute);
// app.use(propOwnerRoute);
// app.use(marketRoutes);
// app.use(staffRoutes);
// app.use(facalityRoutes);
// app.use(subscriptionRoute);
// app.use(razorpayRoute);

app.use(routes)
app.get("/upgrade-plan", (req, res) => {                            // for temperory
  return res.render("dashboard/upgrade/upgradePlan.ejs")
})

const PORT = process.env.PORT || 1000;
app.listen(PORT, () => {
    console.log(`Server running at PORT: ${PORT} Successfully`);
});
