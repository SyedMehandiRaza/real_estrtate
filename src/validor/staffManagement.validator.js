const { z } = require("zod");

const ROLES = [
  "ADMIN",
  "AGENT",
];

const PERMISSIONS = [
  "properties_management",
  "leads_crm",
  "payment_tracking",
  "marketing",
  "facility_management",
];

exports.addStaffSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(30, "Name should not be greater than 30 characters"),

  email: z
    .string()
    .email("Invalid email address"),

  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone must be 10 digits"),

  role: z.enum(ROLES, {
    errorMap: () => ({ message: "Invalid role selected" }),
  }),

  permissions: z
    .array(z.enum(PERMISSIONS))
    .optional(),
});
