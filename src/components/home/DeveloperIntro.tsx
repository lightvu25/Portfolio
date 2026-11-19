import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { PixelCluster } from "@/components/pixel/PixelCluster";
import { PlaceholderText } from "@/components/ui/PlaceholderText";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/content/site";

const PRINCIPLES = [
  {
    code: "P.01",
    title: "Design & engineering under one roof",
    body: "Visual hierarchy, typography, micro-interactions, and clean frontend code are shaped together—avoiding the disconnect between static mockups and how a website actually feels in the browser.",
  },
  {
    code: "P.02",
    title: "Plain-language collaboration",
    body: "Clients do not need to speak in frameworks or server jargon. Every project begins by clarifying what your customers need to understand and do, translated into a clear written scope.",
  },
  {
    code: "P.03",
    title: "Responsive & accessible from day one",
    body: "Mobile ergonomics, keyboard navigation, readable contrast, and reduced-motion preferences are built into components from the start rather than patched on before launch.",
  },
  {
    code: "P.04",
    title: "Maintainable handover",
    body: "Structured code, predictable content models, and clear documentation mean your website stays fast to load and straightforward to update as your business grows.",
  },
];

export function DeveloperIntro() {
  return (
    <section className="border-b border-line py-16 sm:py-24">
      <Container className="space-y-10 sm:space-y-12">
        <Reveal>
          <SectionHeading
            index="03"
            eyebrow="Approach"
            title={
              <>
                How <PlaceholderText text={siteConfig.personName} /> approaches
                creative web development.
              </>
            }
            description="A balance of visual craft and dependable engineering—using custom interaction only where it sharpens communication, never at the expense of readability or speed."
            align="split"
          />
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2">
          {PRINCIPLES.map((item, idx) => (
            <Reveal key={item.code} delayMs={idx * 60}>
              <div className="relative h-full border border-line bg-paper-card p-6 sm:p-7">
                <div className="mb-3 flex items-center justify-between">
                  <span className="border border-ink bg-paper px-2 py-0.5 font-mono text-xs font-semibold text-ink">
                    {item.code}
                  </span>
                  <span aria-hidden="true" className="h-2 w-2 bg-accent" />
                </div>
                <h3 className="font-display text-lg font-semibold text-ink sm:text-xl">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-muted sm:text-base">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 font-mono text-xs text-ink-subtle">
          <span>
            Stack capabilities: TypeScript · React / Next.js · Responsive CSS ·
            Interactive Canvas / Motion · CMS &amp; API Integrations
          </span>
          <PixelCluster variant="spark" />
        </Reveal>
      </Container>
    </section>
  );
}
