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
  const imageStyle = variant === "light"
    ? {
        filter:
          "brightness(1.18) contrast(1.12) saturate(1.08) drop-shadow(0 0 1px rgba(255,255,255,0.96)) drop-shadow(0 0 4px rgba(255,255,255,0.66)) drop-shadow(0 8px 18px rgba(0,0,0,0.28))",
      }
    : {
        filter: "drop-shadow(0 1px 2px rgba(0,12,40,0.2))",
      };
  const content = (
    <span className="inline-flex w-full items-center">
      <img
        src={visionTechLogo}
        alt={alt}
        className={`block h-auto w-full object-contain ${imageClassName}`}
        style={imageStyle}
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
