const {z} = require("zod");

exports.registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(30, "Name should not greater than 30 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters").max(20, "Password should not greater than 20 characters")
});

exports.loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().regex(/^[0-9]{10}$/).optional(),
  password: z.string().min(6, "Password is required").max(20, "Password should not greater than 20 characters")
}).refine(
  (data) => data.email || data.phone,
  {
    message: "Email or phone is required",
    path: ["email"]
  }
);
