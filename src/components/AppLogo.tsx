import Image from "next/image";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  size?: number;
  className?: string;
}

export function AppLogo({ size = 36, className }: AppLogoProps) {
  return (
    <Image
      src="/icons/logo.png"
      alt="SkufKeeper"
      width={size}
      height={size}
      className={cn("shrink-0 rounded-lg object-contain", className)}
      unoptimized
      priority
    />
  );
}
