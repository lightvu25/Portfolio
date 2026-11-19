import { siteConfig } from "@/content/site";
import type { InquiryFormValues } from "./validate";

export type SubmissionResult =
  | { status: "sent" }
  | { status: "demo" }
  | { status: "error"; message: string };

/**
 * Submits the validated inquiry to `NEXT_PUBLIC_INQUIRY_ENDPOINT` when configured
 * (compatible with Formspree, Web3Forms, Basin, or a custom JSON endpoint).
 *
 * When no endpoint is configured, returns `{ status: "demo" }` rather than
 * pretending the inquiry was delivered.
 */
export async function submitInquiry(
  values: InquiryFormValues
): Promise<SubmissionResult> {
  // Silent honeypot guard against automated spam bots
  if (values.botTrap.trim() !== "") {
    return { status: "demo" };
  }

  const endpoint = siteConfig.inquiryEndpoint;
  if (!endpoint) {
    await new Promise((resolve) => setTimeout(resolve, 260));
    return { status: "demo" };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: values.name.trim(),
        email: values.email.trim(),
        businessName: values.businessName.trim() || undefined,
        websiteType: values.websiteType,
        budget: values.budget || undefined,
        timeline: values.timeline || undefined,
        description: values.description.trim(),
        submittedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      return {
        status: "error",
        message: `The form service returned status ${response.status}. Please review your connection or try again.`,
      };
    }

    return { status: "sent" };
  } catch {
    return {
      status: "error",
      message:
        "Unable to reach the inquiry service right now. Please check your internet connection and try again.",
    };
  }
}
