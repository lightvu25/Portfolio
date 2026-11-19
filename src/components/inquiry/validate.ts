import type { WebsiteType } from "@/types/content";

export interface InquiryFormValues {
  name: string;
  email: string;
  businessName: string;
  websiteType: WebsiteType | "";
  budget: string;
  timeline: string;
  description: string;
  botTrap: string;
}

export type InquiryFieldErrors = Partial<
  Record<keyof InquiryFormValues, string>
>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateInquiryField(
  field: keyof InquiryFormValues,
  value: string
): string | undefined {
  const trimmed = value.trim();

  switch (field) {
    case "name":
      if (!trimmed) return "Please enter your name.";
      if (trimmed.length < 2) return "Name must be at least 2 characters.";
      return undefined;
    case "email":
      if (!trimmed) return "Please enter an email address so I can reply.";
      if (!EMAIL_PATTERN.test(trimmed))
        return "Please enter a valid email address (for example, name@domain.com).";
      return undefined;
    case "websiteType":
      if (!trimmed) return "Please choose the website type closest to your project.";
      return undefined;
    case "description":
      if (!trimmed)
        return "Please share a short summary of what you want to build.";
      if (trimmed.length < 20)
        return "Please add a little more detail (at least 20 characters) about your goals.";
      return undefined;
    default:
      return undefined;
  }
}

export function validateInquiryForm(
  values: InquiryFormValues
): InquiryFieldErrors {
  const errors: InquiryFieldErrors = {};
  const requiredFields: (keyof InquiryFormValues)[] = [
    "name",
    "email",
    "websiteType",
    "description",
  ];

  for (const field of requiredFields) {
    const err = validateInquiryField(field, values[field]);
    if (err) {
      errors[field] = err;
    }
  }

  return errors;
}

export function formatInquirySummary(values: InquiryFormValues): string {
  return [
    `Name: ${values.name.trim()}`,
    `Email: ${values.email.trim()}`,
    `Business / Project: ${values.businessName.trim() || "Not specified"}`,
    `Website Type: ${values.websiteType}`,
    `Estimated Budget: ${values.budget || "Not specified"}`,
    `Desired Timeline: ${values.timeline || "Not specified"}`,
    "",
    "Project Description:",
    values.description.trim(),
  ].join("\n");
}
