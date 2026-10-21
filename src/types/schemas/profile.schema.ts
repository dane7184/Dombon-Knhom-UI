import { z } from "zod";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
} from "@/types/activity.type";

export const personalInfoSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(30, "Full name must be at most 30 characters")
    .regex(/^[a-zA-Z\s]+$/, "Full name cannot contain numbers or symbols"),
  bio: z.string().max(200, "Bio is too long").optional().or(z.literal("")),
  gender: z.union([z.literal("Male"), z.literal("Female"), z.literal("")]),
  phone: z.string().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
});

export type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

export function buildPersonalInfoSchema(isOrgAccount: boolean) {
  return personalInfoSchema.superRefine((data, ctx) => {
    if (isOrgAccount) {
      if (!data.phone || !/^0\d{1,11}$/.test(data.phone)) {
        ctx.addIssue({
          code: "custom",
          path: ["phone"],
          message: "Phone must start with 0 and be at most 12 digits",
        });
      }
      if (
        data.website &&
        !/^(https?:\/\/|www\.)[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(data.website)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["website"],
          message: "Enter a valid URL",
        });
      }
    } else {
      if (!/^[a-zA-Z]+\s[a-zA-Z]+$/.test(data.fullName)) {
        ctx.addIssue({
          code: "custom",
          path: ["fullName"],
          message: "Please enter your first and last name",
        });
      }
      if (data.gender !== "Male" && data.gender !== "Female") {
        ctx.addIssue({
          code: "custom",
          path: ["gender"],
          message: "Please select a gender",
        });
      }
    }
  });
}

export const requestOrganizerSchema = z.object({
  profileImage: z
    .instanceof(File)
    .optional()
    .nullable()
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Please upload a valid image file (JPG, PNG, or WEBP).",
    )
    .refine(
      (file) => !file || file.size <= MAX_IMAGE_SIZE_BYTES,
      "Image must be smaller than 5MB.",
    ),
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(30, "Full name must be at most 30 characters")
    .regex(/^[a-zA-Z\s]+$/, "Full name cannot contain numbers or symbols")
    .refine(
      (val) => /^[a-zA-Z]+\s[a-zA-Z]+$/.test(val),
      "Please enter your first and last name",
    ),
  province: z.string().min(1, "Province is required"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^0\d{1,11}$/, "Phone must start with 0 and be at most 12 digits"),
  website: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) =>
        !val || /^(https?:\/\/|www\.)[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(val),
      "Enter a valid website URL",
    ),
  about: z
      .string()
      .trim()
      .min(10, "About must be at least 10 characters")
      .max(500, "About must be no more than 500 characters"),
  verificationDocument: z
    .instanceof(File, { message: "Please upload a verification document" })
    .refine(
      (file) => file.type === "application/pdf",
      "Only PDF files are accepted",
    ),
});

export type RequestOrganizerInput = z.infer<typeof requestOrganizerSchema>;
