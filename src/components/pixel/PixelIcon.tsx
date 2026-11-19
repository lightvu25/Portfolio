export type PixelIconName =
  | "cursor"
  | "arrow-right"
  | "arrow-up-right"
  | "layout"
  | "spark"
  | "store"
  | "calendar"
  | "sliders"
  | "cart"
  | "code"
  | "check"
  | "minus";

interface PixelIconProps {
  name: PixelIconName;
  className?: string;
  size?: number;
}

export function PixelIcon({
  name,
  className = "",
  size = 16,
}: PixelIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={`shrink-0 ${className}`.trim()}
    >
      {name === "cursor" && (
        <>
          <path d="M3 1h2v2h2v2h2v2h2v2H7v2h2v3H7v-3H5V9H3V1z" />
          <rect x="12" y="2" width="2" height="2" fill="var(--accent)" />
        </>
      )}
      {name === "arrow-right" && (
        <path d="M2 7h9V5h2v2h2v2h-2v2h-2V9H2V7zm7-4h2v2H9V3zm0 8h2v2H9v-2z" />
      )}
      {name === "arrow-up-right" && (
        <path d="M5 3h8v8h-2V7H9v2H7v2H5v2H3v-2h2V9h2V7h2V5H5V3z" />
      )}
      {name === "layout" && (
        <path d="M2 2h12v12H2V2zm2 2v2h8V4H4zm0 4v4h3V8H4zm5 0v4h3V8H9z" />
      )}
      {name === "spark" && (
        <path d="M7 1h2v4h2v2h4v2h-4v2H9v4H7v-4H5V9H1V7h4V5h2V1z" />
      )}
      {name === "store" && (
        <path d="M2 2h12v2H2V2zm1 3h10v3H3V5zm-1 3h2v6H2V8zm10 0h2v6h-2V8zM5 9h6v5H5V9zm2 2v3h2v-3H7z" />
      )}
      {name === "calendar" && (
        <path d="M4 1h2v2h4V1h2v2h2v11H2V3h2V1zm0 4v2h8V5H4zm0 4v3h3V9H4zm5 0v2h3V9H9z" />
      )}
      {name === "sliders" && (
        <path d="M2 3h4V2h2v4H6V5H2V3zm8 0h4v2h-4V3zM2 9h8V8h2v4h-2v-1H2V9zm12 0h0M12 9h2v2h-2V9zM2 13h2v-1h2v3H4v-1H2v-1zm6 0h6v1H8v-1z" />
      )}
      {name === "cart" && (
        <path d="M1 2h3v2h10v5H5v2h8v2H4V4H1V2zm5 3v2h6V5H6zm-1 9h2v2H5v-2zm6 0h2v2h-2v-2z" />
      )}
      {name === "code" && (
        <path d="M5 4h2v2H5v2H3V6h2V4zm0 6h2v2H5v-2zM3 8h2v2H3V8zm6-4h2v2h2v2h-2v2H9v-2h2V6H9V4zm0 6h2v2H9v-2z" />
      )}
      {name === "check" && (
        <path d="M12 4h2v2h-2V4zm-2 2h2v2h-2V6zM8 8h2v2H8V8zm-2 2h2v2H6v-2zM4 8h2v2H4V8zM2 6h2v2H2V6z" />
      )}
      {name === "minus" && <rect x="3" y="7" width="10" height="2" />}
    </svg>
  );
}
