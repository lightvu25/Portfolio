"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { PixelIcon } from "@/components/pixel/PixelIcon";
import { PlaceholderText } from "@/components/ui/PlaceholderText";
import { serviceCategories } from "@/content/services";
import { siteConfig } from "@/content/site";
import type { WebsiteType } from "@/types/content";
import { submitInquiry } from "./submit";
import {
  formatInquirySummary,
  validateInquiryField,
  validateInquiryForm,
  type InquiryFieldErrors,
  type InquiryFormValues,
} from "./validate";

export interface PresetInquiryDetail {
  websiteType: WebsiteType;
  packageName?: string;
}

const INITIAL_VALUES: InquiryFormValues = {
  name: "",
  email: "",
  businessName: "",
  websiteType: "",
  budget: "",
  timeline: "",
  description: "",
  botTrap: "",
};

export function InquiryForm() {
  const formId = useId();
  const [values, setValues] = useState<InquiryFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<InquiryFieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof InquiryFormValues, boolean>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "demo" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [selectedPackageHint, setSelectedPackageHint] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const formRef = useRef<HTMLFormElement | null>(null);
  const statusBannerRef = useRef<HTMLDivElement | null>(null);

  const isConfigured = Boolean(siteConfig.inquiryEndpoint);

  // Listen for package selection events from `/services` pricing cards
  useEffect(() => {
    const onPreset = (event: Event) => {
      const custom = event as CustomEvent<PresetInquiryDetail>;
      if (!custom.detail?.websiteType) return;

      setValues((prev) => ({
        ...prev,
        websiteType: custom.detail.websiteType,
      }));
      setErrors((prev) => ({ ...prev, websiteType: undefined }));
      if (custom.detail.packageName) {
        setSelectedPackageHint(custom.detail.packageName);
      }
    };

    window.addEventListener("preset-inquiry-type", onPreset);
    return () => window.removeEventListener("preset-inquiry-type", onPreset);
  }, []);

  const updateField = <K extends keyof InquiryFormValues>(
    field: K,
    value: InquiryFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const fieldError = validateInquiryField(field, String(value));
      setErrors((prev) => ({ ...prev, [field]: fieldError }));
    }
    if (status === "demo" || status === "error") {
      setStatus("idle");
    }
  };

  const handleBlur = (field: keyof InquiryFormValues) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const fieldError = validateInquiryField(field, values[field]);
    setErrors((prev) => ({ ...prev, [field]: fieldError }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validateInquiryForm(values);
    setErrors(validationErrors);
    setTouched({
      name: true,
      email: true,
      websiteType: true,
      description: true,
    });

    const errorKeys = Object.keys(validationErrors) as (keyof InquiryFormValues)[];
    if (errorKeys.length > 0) {
      const firstField = errorKeys[0];
      const target = formRef.current?.querySelector<HTMLElement>(
        `[name="${firstField}"]`
      );
      target?.focus();
      return;
    }

    setStatus("submitting");
    setErrorMessage("");
    setCopied(false);

    const result = await submitInquiry(values);
    if (result.status === "sent") {
      setStatus("sent");
      statusBannerRef.current?.focus();
    } else if (result.status === "demo") {
      setStatus("demo");
      statusBannerRef.current?.focus();
    } else {
      setStatus("error");
      setErrorMessage(result.message);
      statusBannerRef.current?.focus();
    }
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(formatInquirySummary(values));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handleReset = () => {
    setValues(INITIAL_VALUES);
    setErrors({});
    setTouched({});
    setSelectedPackageHint("");
    setStatus("idle");
    setCopied(false);
  };

  const inputBase =
    "w-full min-h-11 border bg-paper px-3.5 py-2.5 text-sm sm:text-base text-ink placeholder:text-ink-subtle transition-colors";
  const inputNormal = "border-line-strong hover:border-ink focus:border-accent";
  const inputError = "border-danger bg-danger-bg/40";

  const errorCount = Object.values(errors).filter(Boolean).length;

  if (status === "sent") {
    return (
      <div
        ref={statusBannerRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className="border border-success bg-success-bg p-6 sm:p-8 space-y-4"
      >
        <div className="flex items-center gap-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-success">
          <PixelIcon name="check" size={16} />
          <span>Inquiry Delivered</span>
        </div>
        <h3 className="font-display text-2xl font-semibold text-ink">
          Thank you, {values.name.trim()}. Your project details have been received.
        </h3>
        <p className="text-sm leading-relaxed text-ink-muted sm:text-base">
          I review every inquiry personally and typically reply within{" "}
          <PlaceholderText text={siteConfig.responseWindow} compact /> with
          initial thoughts or clarifying questions.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="pixel-btn pixel-btn-secondary inline-flex min-h-11 items-center gap-2 border border-ink bg-paper-card px-4 py-2 font-mono text-xs font-medium text-ink"
          >
            Send another inquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      aria-busy={status === "submitting"}
      className="border border-ink bg-paper-card p-5 sm:p-7 lg:p-8 space-y-6"
    >
      {/* Environment transparency banner when no backend endpoint is configured */}
      {!isConfigured && (
        <div className="flex items-start gap-2.5 border border-dashed border-demo/60 bg-demo-bg px-3.5 py-2.5 font-mono text-xs text-demo">
          <span aria-hidden="true" className="mt-1 h-2 w-2 shrink-0 bg-pixel" />
          <p>
            <strong>Development / Demo Mode:</strong> Form validation is live,
            and no backend endpoint (<code className="font-semibold">NEXT_PUBLIC_INQUIRY_ENDPOINT</code>)
            is configured yet. Submitting previews your formatted brief without
            discarding it silently.
          </p>
        </div>
      )}

      {selectedPackageHint && (
        <div className="flex flex-wrap items-center justify-between gap-2 border border-accent/40 bg-accent-soft px-3.5 py-2 font-mono text-xs text-accent">
          <span>Selected package context: {selectedPackageHint}</span>
          <button
            type="button"
            onClick={() => setSelectedPackageHint("")}
            className="underline underline-offset-2 hover:text-ink"
          >
            Clear
          </button>
        </div>
      )}

      {/* Accessible validation error summary */}
      {errorCount > 0 && (
        <div
          role="alert"
          className="border border-danger bg-danger-bg px-4 py-3 text-sm text-danger"
        >
          Please check {errorCount === 1 ? "the highlighted field" : `the ${errorCount} highlighted fields`} below before continuing.
        </div>
      )}

      {/* Honeypot anti-spam trap (hidden from visual and screen-reader users) */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor={`${formId}-trap`}>Leave this field blank</label>
        <input
          id={`${formId}-trap`}
          name="botTrap"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.botTrap}
          onChange={(e) => updateField("botTrap", e.target.value)}
        />
      </div>

      {/* Row 1: Name + Email */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor={`${formId}-name`}
            className="block font-mono text-xs font-medium text-ink"
          >
            Your Name <span className="text-danger">*</span>
          </label>
          <input
            id={`${formId}-name`}
            name="name"
            type="text"
            autoComplete="name"
            required
            value={values.name}
            onChange={(e) => updateField("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${formId}-name-err` : undefined}
            placeholder="e.g. Minh Tran"
            className={`${inputBase} ${errors.name ? inputError : inputNormal}`}
          />
          {errors.name && (
            <p
              id={`${formId}-name-err`}
              className="font-mono text-xs text-danger"
            >
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={`${formId}-email`}
            className="block font-mono text-xs font-medium text-ink"
          >
            Email Address <span className="text-danger">*</span>
          </label>
          <input
            id={`${formId}-email`}
            name="email"
            type="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={(e) => updateField("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${formId}-email-err` : undefined}
            placeholder="you@company.com"
            className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
          />
          {errors.email && (
            <p
              id={`${formId}-email-err`}
              className="font-mono text-xs text-danger"
            >
              {errors.email}
            </p>
          )}
        </div>
      </div>

      {/* Row 2: Business/Project Name + Website Type */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor={`${formId}-business`}
            className="block font-mono text-xs font-medium text-ink"
          >
            Business or Project Name{" "}
            <span className="font-normal text-ink-subtle">(optional)</span>
          </label>
          <input
            id={`${formId}-business`}
            name="businessName"
            type="text"
            autoComplete="organization"
            value={values.businessName}
            onChange={(e) => updateField("businessName", e.target.value)}
            placeholder="Studio, shop, or brand name"
            className={`${inputBase} ${inputNormal}`}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={`${formId}-type`}
            className="block font-mono text-xs font-medium text-ink"
          >
            Website Type <span className="text-danger">*</span>
          </label>
          <select
            id={`${formId}-type`}
            name="websiteType"
            required
            value={values.websiteType}
            onChange={(e) =>
              updateField("websiteType", e.target.value as WebsiteType | "")
            }
            onBlur={() => handleBlur("websiteType")}
            aria-invalid={Boolean(errors.websiteType)}
            aria-describedby={
              errors.websiteType ? `${formId}-type-err` : undefined
            }
            className={`${inputBase} ${
              errors.websiteType ? inputError : inputNormal
            }`}
          >
            <option value="">Select website type...</option>
            {serviceCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>
          {errors.websiteType && (
            <p
              id={`${formId}-type-err`}
              className="font-mono text-xs text-danger"
            >
              {errors.websiteType}
            </p>
          )}
        </div>
      </div>

      {/* Row 3: Optional Budget + Timeline */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor={`${formId}-budget`}
            className="block font-mono text-xs font-medium text-ink"
          >
            Estimated Scope / Budget{" "}
            <span className="font-normal text-ink-subtle">(optional)</span>
          </label>
          <select
            id={`${formId}-budget`}
            name="budget"
            value={values.budget}
            onChange={(e) => updateField("budget", e.target.value)}
            className={`${inputBase} ${inputNormal}`}
          >
            <option value="">Select if known...</option>
            {siteConfig.budgetOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label.replace(/⟨PLACEHOLDER:\s*([^⟩]+)⟩/g, "[$1]")}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={`${formId}-timeline`}
            className="block font-mono text-xs font-medium text-ink"
          >
            Desired Timeline{" "}
            <span className="font-normal text-ink-subtle">(optional)</span>
          </label>
          <select
            id={`${formId}-timeline`}
            name="timeline"
            value={values.timeline}
            onChange={(e) => updateField("timeline", e.target.value)}
            className={`${inputBase} ${inputNormal}`}
          >
            <option value="">Select timeline...</option>
            {siteConfig.timelineOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 4: Project Description */}
      <div className="space-y-1.5">
        <label
          htmlFor={`${formId}-description`}
          className="block font-mono text-xs font-medium text-ink"
        >
          Project Description <span className="text-danger">*</span>
        </label>
        <textarea
          id={`${formId}-description`}
          name="description"
          rows={5}
          required
          value={values.description}
          onChange={(e) => updateField("description", e.target.value)}
          onBlur={() => handleBlur("description")}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={`${formId}-desc-hint ${
            errors.description ? `${formId}-desc-err` : ""
          }`.trim()}
          placeholder="Tell me what your business or creative practice does, who visits the site, and any features you have in mind (e.g., portfolio gallery, shoot booking, CMS editing)."
          className={`${inputBase} resize-y ${
            errors.description ? inputError : inputNormal
          }`}
        />
        <p id={`${formId}-desc-hint`} className="font-mono text-[11px] text-ink-subtle">
          Plain language is welcome—no technical spec needed.
        </p>
        {errors.description && (
          <p
            id={`${formId}-desc-err`}
            className="font-mono text-xs text-danger"
          >
            {errors.description}
          </p>
        )}
      </div>

      {/* Submission error banner */}
      {status === "error" && (
        <div
          ref={statusBannerRef}
          tabIndex={-1}
          role="alert"
          className="border border-danger bg-danger-bg p-4 text-sm text-danger"
        >
          {errorMessage}
        </div>
      )}

      {/* Honest Demo Mode result banner (never fakes delivery) */}
      {status === "demo" && (
        <div
          ref={statusBannerRef}
          tabIndex={-1}
          role="status"
          aria-live="polite"
          className="space-y-3 border border-demo bg-demo-bg p-4 sm:p-5"
        >
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-demo">
            Validated in Demo Mode — Message Not Sent
          </p>
          <p className="text-sm leading-relaxed text-ink">
            All fields passed validation, however{" "}
            <code className="font-mono text-xs">NEXT_PUBLIC_INQUIRY_ENDPOINT</code>{" "}
            is not configured yet so no network email was sent. Copy your
            formatted inquiry below{siteConfig.contactEmail ? " or open it directly in your mail app" : ""}:
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleCopySummary}
              className="pixel-btn pixel-btn-secondary inline-flex min-h-10 items-center gap-2 border border-ink bg-paper-card px-3.5 py-2 font-mono text-xs font-medium text-ink"
            >
              <span>{copied ? "Copied to Clipboard" : "Copy Inquiry Text"}</span>
              <PixelIcon name={copied ? "check" : "code"} size={13} />
            </button>

            {siteConfig.contactEmail && (
              <a
                href={`mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(
                  `Project Inquiry — ${values.businessName.trim() || values.name.trim()}`
                )}&body=${encodeURIComponent(formatInquirySummary(values))}`}
                className="pixel-btn inline-flex min-h-10 items-center gap-2 border border-ink bg-accent px-3.5 py-2 font-mono text-xs font-medium text-white"
              >
                <span>Open in Email App</span>
                <PixelIcon name="arrow-up-right" size={13} />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Submit + Privacy Note */}
      <div className="flex flex-col items-start justify-between gap-4 border-t border-line pt-5 sm:flex-row sm:items-center">
        <p className="max-w-md text-xs leading-relaxed text-ink-muted">
          <strong>Privacy:</strong> Details entered here are used solely to
          review your project inquiry and reply. Typical response window:{" "}
          <PlaceholderText text={siteConfig.responseWindow} compact />.
        </p>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="pixel-btn inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2.5 border border-ink bg-accent px-6 py-3 font-mono text-xs sm:w-auto sm:text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          <span>
            {status === "submitting"
              ? "Checking & Sending..."
              : isConfigured
                ? "Send Project Inquiry"
                : "Validate Project Brief"}
          </span>
          <PixelIcon name="arrow-right" size={14} />
        </button>
      </div>
    </form>
  );
}
