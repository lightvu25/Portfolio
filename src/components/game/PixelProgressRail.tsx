"use client";

import { useMagneticScroll } from "./MagneticScroller";

export function PixelProgressRail() {
  const { sections, activeIndex, goToSection, bootComplete } =
    useMagneticScroll();

  if (!bootComplete) return null;

  return (
    <nav
      aria-label="Phân đoạn trang"
      className="fixed top-1/2 right-2.5 z-[82] hidden -translate-y-1/2 flex-col items-end gap-2 sm:right-4 sm:flex"
    >
      {sections.map((section) => {
        const isActive = section.index === activeIndex;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => goToSection(section.index)}
            aria-label={`Chuyển đến ${section.label}`}
            aria-current={isActive ? "step" : undefined}
            className="group flex items-center gap-2 py-0.5 focus-visible:outline-none"
          >
            <span
              className={`font-mono text-[10px] tracking-widest uppercase transition-all ${
                isActive
                  ? "opacity-100 text-retro-text"
                  : "opacity-0 text-retro-muted group-hover:opacity-100 group-focus-visible:opacity-100"
              }`}
            >
              {section.label}
            </span>
            <span
              className="block transition-all duration-200"
              style={{
                width: isActive ? 14 : 6,
                height: 6,
                backgroundColor: isActive ? section.accentHex : "#2B3A5C",
                boxShadow: isActive ? `0 0 10px ${section.accentHex}` : "none",
              }}
            />
          </button>
        );
      })}
    </nav>
  );
}
