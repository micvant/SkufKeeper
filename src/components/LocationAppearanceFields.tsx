"use client";

import { IconPicker } from "@/components/IconPicker";
import { ColorPicker } from "@/components/ColorPicker";
import { getLocationColorStyles } from "@/lib/colors";
import type { IconName } from "@/lib/icons";
import type { LocationColorSlug } from "@/lib/colors";

interface LocationAppearanceFieldsProps {
  iconName: IconName | null;
  color: LocationColorSlug | null;
  onIconChange: (icon: IconName | null) => void;
  onColorChange: (color: LocationColorSlug | null) => void;
}

export function LocationAppearanceFields({
  iconName,
  color,
  onIconChange,
  onColorChange,
}: LocationAppearanceFieldsProps) {
  const colorStyles = getLocationColorStyles(color);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <IconPicker
        value={iconName}
        onChange={onIconChange}
        variant="location"
        label="Иконка (если нет фото)"
        previewBg={colorStyles.bg}
        previewText={colorStyles.text}
      />
      <ColorPicker value={color} onChange={onColorChange} />
    </div>
  );
}
