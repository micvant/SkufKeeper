import { cn } from "@/lib/utils";
import { getLocationColorStyles } from "@/lib/colors";
import { getEntityIcon, type IconName } from "@/lib/icons";

interface EntityIconProps {
  iconName?: string | null;
  fallback: IconName;
  colorSlug?: string | null;
  className?: string;
  iconClassName?: string;
}

export function EntityIcon({
  iconName,
  fallback,
  colorSlug,
  className,
  iconClassName,
}: EntityIconProps) {
  const Icon = getEntityIcon(iconName, fallback);
  const color = colorSlug ? getLocationColorStyles(colorSlug) : null;

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        color?.bg,
        className
      )}
    >
      <Icon className={cn(color?.text, iconClassName)} />
    </div>
  );
}
