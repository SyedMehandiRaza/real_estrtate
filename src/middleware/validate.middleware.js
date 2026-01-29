const { ZodError } = require("zod");

module.exports = (schema, source = "body") => {
  return (req, res, next) => {
    console.log("Inside validate")
    const data =
      source === "body"
        ? req.body
        : source === "params"
        ? req.params
        : source === "query"
        ? req.query
        : null;

        console.log("data:", data)
    const referer = req.get("Referer") || req.originalUrl || "/";

    if (!data) {
      console.log("no data")
      req.flash("error", "Invalid request data");
      return res.redirect(referer);
    }

    const result = schema.safeParse(data);
    console.log(result)

    if (!result.success) {
      const messages = result.error.issues.map(i => i.message);
      req.flash("error", messages);
      
    return res.redirect(referer);
}


    if (source === "body") req.body = result.data;
    if (source === "params") req.params = result.data;
    if (source === "query") req.query = result.data;

    next();
  };
};
