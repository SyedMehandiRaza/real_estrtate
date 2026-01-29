const { z } = require("zod");

exports.promotePropertySchema = z.object({
  
    propertyId: z.coerce.number().int().positive(), 

    platforms: z
        .array(
        z.enum(["facebook", "instagram", "youtube", "linkedin"])
        )
        .min(1, "Select at least one platform"),
});