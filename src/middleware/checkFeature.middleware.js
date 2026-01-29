const { Subscription, Plan } = require("../models")
const checkFeature = (feature) => async (req, res, next) => {
  const sub = await Subscription.findOne({
    where: { userId: req.user.id, status: "active" },
    include: Plan
  });

  if (!sub || !sub.Plan.features[feature]) {
    return res.redirect("/upgrade-plan");
  }

  req.plan = sub.Plan;
  next();
};

module.exports  = checkFeature;