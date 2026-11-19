import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { PixelCluster } from "@/components/pixel/PixelCluster";
import { PixelField } from "@/components/pixel/PixelField";
import { PlaceholderText } from "@/components/ui/PlaceholderText";
import { siteConfig } from "@/content/site";
import { InquiryForm } from "./InquiryForm";

interface ContactSectionProps {
  index?: string;
  heading?: string;
  subheading?: string;
}

export function ContactSection({
  index = "04",
  heading = "Have a website or booking project in mind?",
  subheading = "Share a few details about what you are building, who it serves, and what stage you are in. You will receive a clear, practical response—never a high-pressure sales pitch.",
}: ContactSectionProps) {
  return (
    <section
      id="project-inquiry"
      data-pixel-stage
      className="relative scroll-mt-20 overflow-hidden py-16 sm:py-24"
    >
      <PixelField />

      <Container className="relative z-10">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Intro & Expectations */}
          <Reveal className="space-y-6 lg:col-span-5">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center border border-ink bg-ink px-1.5 py-0.5 font-pixel text-[10px] leading-none text-paper">
                {index}
              </span>
              <span className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-accent">
                Project Inquiry
              </span>
              <span aria-hidden="true" className="h-1.5 w-1.5 bg-pixel" />
            </div>

            <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-4xl lg:leading-[1.12]">
              {heading}
            </h2>

            <p className="text-base leading-relaxed text-ink-muted">
              {subheading}
            </p>

            <div className="space-y-4 border-t border-line pt-6">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-ink">
                What happens next
              </h3>
              <ol className="space-y-3 text-sm text-ink-muted">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 border border-ink bg-paper-card px-1.5 py-0.5 font-pixel text-[10px] text-ink">
                    1
                  </span>
                  <span>
                    I review your goals and reply within{" "}
                    <PlaceholderText text={siteConfig.responseWindow} compact />.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 border border-ink bg-paper-card px-1.5 py-0.5 font-pixel text-[10px] text-ink">
                    2
                  </span>
                  <span>
                    If needed, we clarify open questions via email or a short
                    discovery call.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 border border-ink bg-paper-card px-1.5 py-0.5 font-pixel text-[10px] text-ink">
                    3
                  </span>
                  <span>
                    You receive a transparent scope outline, timeline range, and
                    pricing options.
                  </span>
                </li>
              </ol>
            </div>

            <PixelCluster variant="step-bar" className="pt-2" />
          </Reveal>

          {/* Right Form */}
          <Reveal delayMs={80} className="lg:col-span-7">
            <InquiryForm />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
