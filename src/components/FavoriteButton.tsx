"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  locationId: string;
  initialFavorite?: boolean;
  onChange?: (favorite: boolean) => void;
}

export function FavoriteButton({
  locationId,
  initialFavorite = false,
  onChange,
}: FavoriteButtonProps) {
  const [favorite, setFavorite] = useState(initialFavorite);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      if (favorite) {
        await fetch(`/api/favorites/${locationId}`, { method: "DELETE" });
        setFavorite(false);
        onChange?.(false);
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locationId }),
        });
        setFavorite(true);
        onChange?.(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors",
        favorite
          ? "border-amber-300 bg-amber-50 text-amber-500"
          : "border-slate-200 bg-white text-slate-400 hover:text-amber-500"
      )}
      aria-label={favorite ? "Убрать из избранного" : "В избранное"}
      title={favorite ? "В избранном" : "В избранное"}
    >
      <Star className={cn("h-5 w-5", favorite && "fill-current")} />
    </button>
  );
}
