import type { JSX, ReactNode } from "react";
import BrandLogo from "./BrandLogo";

type AuthBrandFrameProps = {
  eyebrow: string;
  title: string;
  body: string;
  children: ReactNode;
};

export default function AuthBrandFrame({
  eyebrow,
  title,
  body,
  children,
}: AuthBrandFrameProps): JSX.Element {
  return (
    <div className="relative z-10 flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col justify-between gap-7 rounded-[28px] border border-white/16 bg-transparent p-6">
      <div className="flex justify-center">
        <BrandLogo variant="light" className="w-full max-w-[10.5rem]" />
      </div>

      <div className="max-w-lg">
        <p className="font-label text-[11px] font-black uppercase tracking-[0.22em] text-[#d8cffc]">{eyebrow}</p>
        <h1 className="mt-4 font-headline text-4xl font-black leading-tight tracking-tight">
          {title}
        </h1>
        <p className="mt-5 text-base leading-7 text-white/78">{body}</p>
      </div>

      <div className="border-t border-white/12 pt-6">{children}</div>
    </div>
  );
}
