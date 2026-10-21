import { z } from "zod";

export const genderSchema = z.union([z.literal("Male"), z.literal("Female")]);

const sessionTokenSchema = z.uuid({ error: "Session token is required" });

export const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/\d/, "Must contain at least one number")
  .regex(
    /[@$!%*?&#]/,
    "Must contain at least one special character (@$!%*?&#)",
  );

export const signupSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(50, "Full name must not exceed 50 characters")
    .regex(
      /^[A-Za-z\u1780-\u17FF\s]+$/,
      "Full name can only contain letters and spaces",
    )
    .refine((name) => name.trim().split(/\s+/).length >= 2, {
      message: "Please enter your full name (first and last name)",
    })
    .transform((name) => name.replace(/\s+/g, " ")),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: passwordSchema,
  gender: genderSchema,
});

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const verifyOtpSchema = z.object({
  sessionToken: sessionTokenSchema,
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const resendOtpSchema = z.object({
  sessionToken: sessionTokenSchema,
});

export type ResendOtpInput = z.infer<typeof resendOtpSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    sessionToken: sessionTokenSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const googleOAuthSchema = z.object({
  idToken: z.string().min(1, "Google ID token is required"),
});

export type GoogleOAuthInput = z.infer<typeof googleOAuthSchema>;
