"use client";

import { cn } from "@/lib/utils";
import { Camera, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

interface PhotoUploadProps {
  label?: string;
  currentPhoto?: string | null;
  onPhotoChange: (file: File | null) => void;
  onRemoveCurrent?: () => void;
}

export function PhotoUpload({
  label = "Фото",
  currentPhoto,
  onPhotoChange,
  onRemoveCurrent,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removedCurrent, setRemovedCurrent] = useState(false);

  const displayPhoto = preview || (!removedCurrent ? currentPhoto : null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    onPhotoChange(file);
    setPreview(URL.createObjectURL(file));
    setRemovedCurrent(false);
  }

  function handleRemove() {
    onPhotoChange(null);
    setPreview(null);
    if (currentPhoto) {
      setRemovedCurrent(true);
      onRemoveCurrent?.();
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-1.5">
      {label && <p className="text-sm font-medium text-slate-700">{label}</p>}

      {displayPhoto ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
          <Image
            src={displayPhoto}
            alt="Preview"
            fill
            className="object-cover"
            unoptimized
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200",
            "bg-slate-50 py-8 text-slate-500 transition-colors hover:border-emerald-400 hover:bg-emerald-50/50 hover:text-emerald-600"
          )}
        >
          <Camera className="h-8 w-8" />
          <span className="text-sm font-medium">Добавить фото</span>
          <span className="text-xs text-slate-400">JPG, PNG, WEBP до 10 МБ</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
