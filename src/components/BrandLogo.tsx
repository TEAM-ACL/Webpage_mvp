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
  const foregroundStyle = variant === "light"
    ? {
        filter:
          "brightness(1.28) contrast(1.18) saturate(1.12) drop-shadow(0 8px 18px rgba(0,0,0,0.32))",
      }
    : {
        filter: "drop-shadow(0 1px 2px rgba(0,12,40,0.2))",
      };
  const keylineStyle = {
    filter:
      "brightness(0) invert(1) opacity(0.96) drop-shadow(0 0 1px rgba(255,255,255,1)) drop-shadow(0 0 5px rgba(255,255,255,0.88))",
    transform: "scale(1.018)",
  };
  const content = (
    <span className="relative inline-flex w-full items-center">
      {variant === "light" && (
        <img
          src={visionTechLogo}
          alt=""
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 block h-auto w-full object-contain ${imageClassName}`}
          style={keylineStyle}
        />
      )}
      <img
        src={visionTechLogo}
        alt={alt}
        className={`relative block h-auto w-full object-contain ${imageClassName}`}
        style={foregroundStyle}
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
