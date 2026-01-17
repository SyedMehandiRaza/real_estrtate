const { ZodError } = require("zod");

module.exports = (schema, source = "body") => {
  console.log("vaidatinbg ")
  return (req, res, next) => {
    // pick the right source
    const data =
      source === "body"
        ? req.body
        : source === "params"
        ? req.params
        : source === "query"
        ? req.query
        : null;

    const referer = req.get("Referer") || req.originalUrl || "/";

    if (!data) {
      req.flash("error", "Invalid request data");
      return res.redirect(referer);
    }

    const result = schema.safeParse(data);

    if (!result.success) {
      const messages = result.error.issues.map(i => i.message);
      req.flash("error", messages);

      console.log(messages);
      
    return res.redirect(referer);
}


    // replace data with validated version
    if (source === "body") req.body = result.data;
    if (source === "params") req.params = result.data;
    if (source === "query") req.query = result.data;

    next();
  };
};
