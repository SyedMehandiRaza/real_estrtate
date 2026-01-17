const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const session = require("express-session");
const flash = require("connect-flash");
const authRoutes = require("../src/routes/auth.route");
const propertyRoute = require("../src/routes/property.route");
const propOwnerRoute = require("../src/routes/propertyOwner.route")
const marketRoutes = require("../src/routes/marketing.route")

dotenv.config();

const app = express();

const PORT = process.env.PORT || 1000;

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
app.get("/marketing", (rq, res) => {
  res.render("dashboard/layout/marketing/index.js")
})
app.use(authRoutes);
app.use(propertyRoute);
app.use(propOwnerRoute)
app.use(marketRoutes)

app.listen(1000, () => {
    console.log(`Server running at PORT: ${1000} Successfully`);
});
