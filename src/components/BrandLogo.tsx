import type { JSX } from "react";
import { Link } from "react-router-dom";
import visionTechLogo from "../assets/visiontech-ai-logo.png";
import visionTechLogoLight from "../assets/visiontech-ai-logo-light.png";

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
  const logoSrc = variant === "light" ? visionTechLogoLight : visionTechLogo;
  const image = (
    <img
      src={logoSrc}
      alt={alt}
      className={`block h-auto w-full object-contain ${imageClassName}`}
    />
  );

  if (!to) {
    return <div className={className}>{image}</div>;
  }

  return (
    <Link to={to} aria-label="VisionTech AI home" className={`inline-flex items-center ${className}`}>
      {image}
    </Link>
  );
}
