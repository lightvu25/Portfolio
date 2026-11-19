import { Container } from "@/components/layout/Container";
import { PixelCluster } from "@/components/pixel/PixelCluster";
import { ButtonLink } from "@/components/ui/ButtonLink";

export default function NotFound() {
  return (
    <div className="web-service-root min-h-screen bg-paper text-ink">
      <section className="py-24 sm:py-32">
        <Container className="max-w-2xl space-y-6 text-left">
          <div className="flex items-center gap-3">
            <span className="border border-ink bg-ink px-2 py-0.5 font-pixel text-xs text-paper">
              404
            </span>
            <PixelCluster variant="spark" />
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
            This page could not be found.
          </h1>
          <p className="text-base leading-relaxed text-ink-muted">
            The link may have moved or the URL may contain a typo. Head back to
            the Game Portfolio or explore Web Development Services.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink href="/" variant="primary" icon="arrow-right">
              Game Portfolio
            </ButtonLink>
            <ButtonLink href="/web-service/" variant="secondary">
              Web Services
            </ButtonLink>
          </div>
        </Container>
      </section>
    </div>
  );
}
