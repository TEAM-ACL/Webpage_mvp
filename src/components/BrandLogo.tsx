import type { JSX } from "react";
import { Link } from "react-router-dom";
import visionTechLogo from "../assets/visiontech-ai-logo.png";

type BrandLogoProps = {
  alt?: string;
  className?: string;
  imageClassName?: string;
  to?: string;
};

export default function BrandLogo({
  alt = "VisionTech AI",
  className = "",
  imageClassName = "",
  to = "/",
}: BrandLogoProps): JSX.Element {
  const image = (
    <img
      src={visionTechLogo}
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
