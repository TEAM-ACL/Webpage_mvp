import type { JSX } from "react";
import { Link } from "react-router-dom";
import visionTechLogo from "../assets/visiontech-ai-logo.png";

type BrandLogoProps = {
  alt?: string;
  className?: string;
  imageClassName?: string;
  to?: string;
  variant?: "default" | "light";
};

export default function BrandLogo({
  alt = "VisionTech AI",
  className = "",
  imageClassName = "",
  to = "/",
  variant = "default",
}: BrandLogoProps): JSX.Element {
  const frameClass = variant === "light"
    ? "rounded-md bg-white/95 p-1.5 shadow-[0_0_0_1px_rgba(255,255,255,0.72),0_10px_28px_rgba(0,0,0,0.2)]"
    : "drop-shadow-[0_1px_2px_rgba(0,12,40,0.2)]";
  const content = (
    <span className={`inline-flex w-full items-center ${frameClass}`}>
      <img
        src={visionTechLogo}
        alt={alt}
        className={`block h-auto w-full object-contain ${imageClassName}`}
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
