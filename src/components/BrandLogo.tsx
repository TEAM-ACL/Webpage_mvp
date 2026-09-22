import type { JSX } from "react";
import { Link } from "react-router-dom";
import visionTechLogoDark from "../assets/visiontech-ai-logo-dark.png";
import visionTechLogoLight from "../assets/visiontech-ai-logo-light.png";
import { useTheme } from "../context/ThemeContext";
import { cn } from "../lib/utils";

type BrandLogoProps = {
  alt?: string;
  className?: string;
  imageClassName?: string;
  to?: string;
  variant?: "auto" | "default" | "light";
};

export default function BrandLogo({
  alt = "VisionTech AI",
  className = "",
  imageClassName = "",
  to = "/",
  variant = "auto",
}: BrandLogoProps): JSX.Element {
  const { isDark } = useTheme();
  const resolvedVariant = variant === "auto" ? (isDark ? "light" : "default") : variant;
  const logo = resolvedVariant === "light" ? visionTechLogoDark : visionTechLogoLight;
  const content = (
    <span className="relative inline-flex w-full items-center">
      <img
        src={logo}
        alt={alt}
        className={cn("relative block h-auto w-full object-contain", imageClassName)}
      />
    </span>
  );

  if (!to) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link to={to} aria-label="VisionTech AI home" className={`inline-flex items-center ${className}`}>
      {content}
    </Link>
  );
}
