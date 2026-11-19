import type { ElementType, ReactNode } from "react";

interface ContainerProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

export function Container({
  as: Component = "div",
  className = "",
  children,
}: ContainerProps) {
  return (
    <Component
      className={`mx-auto w-full max-w-[1380px] px-4 sm:px-6 lg:px-10 ${className}`.trim()}
    >
      {children}
    </Component>
  );
}
