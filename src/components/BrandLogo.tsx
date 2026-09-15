import type { JSX } from "react";
import { Link } from "react-router-dom";
import visionTechLogo from "../assets/visiontech-ai-logo.png";
import visionTechLogoLight from "../assets/visiontech-ai-logo-light-vivid.png";
import visionTechWordmark from "../assets/visiontech-ai-wordmark-core.png";
import visionTechWordmarkLight from "../assets/visiontech-ai-wordmark-core-light-vivid.png";

type BrandLogoProps = {
  alt?: string;
  className?: string;
  imageClassName?: string;
  layout?: "wordmark" | "stacked";
  showMotto?: boolean;
  to?: string;
  variant?: "default" | "light";
};

const motto = "Empowering Potential | Connecting Opportunities";

export default function BrandLogo({
  alt = "VisionTech AI",
  className = "",
  imageClassName = "",
  layout = "wordmark",
  showMotto = true,
  to = "/",
  variant = "default",
}: BrandLogoProps): JSX.Element {
  const logoSrc = layout === "stacked"
    ? variant === "light" ? visionTechLogoLight : visionTechLogo
    : variant === "light" ? visionTechWordmarkLight : visionTechWordmark;
  const imageTreatment = variant === "light"
    ? "drop-shadow-[0_0_10px_rgba(255,255,255,0.55)]"
    : "drop-shadow-[0_1px_2px_rgba(0,12,40,0.2)]";
  const mottoColor = variant === "light" ? "text-white" : "text-[#00143f]";
  const content = (
    <span className="inline-flex w-full flex-col items-center">
      <img
        src={logoSrc}
        alt={alt}
        className={`block h-auto w-full object-contain ${imageTreatment} ${imageClassName}`}
      />
      {showMotto && (
        <span className={`mt-1 block max-w-full text-center font-label text-[0.48rem] font-black uppercase leading-tight tracking-[0.12em] ${mottoColor}`}>
          {motto}
        </span>
      )}
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
