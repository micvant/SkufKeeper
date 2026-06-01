import { cn } from "@/lib/utils";
import { getEntityIcon, type IconName } from "@/lib/icons";

interface EntityIconProps {
  iconName?: string | null;
  fallback: IconName;
  className?: string;
  iconClassName?: string;
}

export function EntityIcon({
  iconName,
  fallback,
  className,
  iconClassName,
}: EntityIconProps) {
  const Icon = getEntityIcon(iconName, fallback);

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Icon className={iconClassName} />
    </div>
  );
}
