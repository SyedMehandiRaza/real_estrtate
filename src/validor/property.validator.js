const { z } = require("zod");


exports.createPropertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  constructionStatus: z.enum([
    "UNDER_CONSTRUCTION",
    "READY"
  ]),
  price: z.number().int().positive(),
  address: z.string().min(5, "Address is required")
});

exports.uploadMediaSchema = z.object({
  propertyId: z.coerce.number().int().positive()
});



// add property forms
// 1

exports.createPropertyStep1Schema = z.object({
  title: z
    .string({ required_error: "Property name is required" })
    .trim()
    .min(3, "Property name must be at least 3 characters"),

  type: z.enum(
    ["APARTMENT", "VILLA", "HOUSE", "PLOT", "BUNGLOW"],
    { required_error: "Property type is required" }
  ),

  purpose: z.enum(["rent", "buy"], {
    required_error: "Listing purpose is required"
  }),

  status: z.enum(["ACTIVE", "INACTIVE"], {
    required_error: "Property status is required"
  }),

  city: z
    .string({ required_error: "City is required" })
    .trim()
    .min(1, "City is required"),

  state: z
    .string({ required_error: "State is required" })
    .trim()
    .min(1, "State is required"),

  country: z
    .string({ required_error: "Country is required" })
    .trim()
    .min(1, "Country is required"),

  locationArea: z
    .string({ required_error: "Locality is required" })
    .trim()
    .min(1, "Locality is required"),

  zipCode: z
    .string({ required_error: "Zip code is required" })
    .trim()
    .regex(/^[0-9]{5,8}$/, "Invalid postal code"),

  address: z
    .string({ required_error: "Address is required" })
    .trim()
    .min(5, "Address is required")
});

// 2
exports.createPropertyStep2Schema = z.object({
  area: z.coerce.number().positive("Total area must be positive"),

  noOfUnit: z.coerce.number().int("Number of units must be an integer").positive("Number of units must be positive"),

  noOfTower: z.coerce.number().int("Number of towers must be an integer").positive("Number of towers must be positive"),

  noOfFloor: z.coerce.number().int("Number of floors must be an integer").positive("Number of floors must be positive"),

  price: z.coerce.number().int("Price must be an integer").positive("Price must be positive"),

  yearBuilt: z.coerce.number()
    .int("Year built must be an integer")
    .min(1800, "Year built seems too old")
    .max(new Date().getFullYear(), "Year built cannot be in the future"),

  builderName: z.string().trim().min(3, "Builder name must be at least 3 characters"),

  description: z.string().trim().min(10, "Description must be at least 10 characters"),

  amenities: z.string().trim().min(3, "Amenities must be at least 3 characters")
});

// 3 

exports.createPropertyStep3Schema = z.object({
  configName: z
    .string({ required_error: "Configuration name is required" })
    .trim()
    .min(3, "Configuration name must be at least 3 characters"),

  configArea: z.coerce.number({ invalid_type_error: "Area must be a number" })
    .positive("Area must be a positive number"),

  totalUnits: z.coerce.number({ invalid_type_error: "Total units must be a number" })
    .int("Total units must be an integer")
    .positive("Total units must be positive"),

  availableUnits: z.coerce.number({ invalid_type_error: "Available units must be a number" })
    .int("Available units must be an integer")
    .nonnegative("Available units cannot be negative"),

  price: z.coerce.number({ invalid_type_error: "Price must be a number" })
    .int("Price must be an integer")
    .positive("Price must be positive"),

  floorPlan: z
    .any()
    .refine(file => file && file.size > 0, "Floor plan file is required")
    .refine(file => {
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      return allowedTypes.includes(file?.mimetype);
    }, "Invalid file type. Only PDF, JPG, PNG are allowed")
    .refine(file => file.size <= 10 * 1024 * 1024, "File size must be ≤ 10 MB")
})
.superRefine((data, ctx) => {
  if (data.availableUnits > data.totalUnits) {
    ctx.addIssue({
      path: ["availableUnits"],
      code: z.ZodIssueCode.custom,
      message: "Available units cannot exceed total units",
    });
  }
});

